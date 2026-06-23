import json
import asyncio
import traceback
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.api.deps import get_db
from app.core.security import decode_access_token
from app.services.user_service import get_user_by_id
from app.runtime.streaming import stream_graph_response

router = APIRouter()


class ActiveTaskManager:
    """会话级任务管理器，专门用于精准控制并发任务的 Lifecycle 与 Cancellation"""
    def __init__(self):
        self.active_tasks: dict[int, asyncio.Task] = {}

    def register_task(self, user_id: int, task: asyncio.Task):
        # 如果当前用户已有运行中的 Agent 任务，强行终止，腾出并发通道
        self.cancel_task(user_id)
        self.active_tasks[user_id] = task

    def cancel_task(self, user_id: int):
        if user_id in self.active_tasks:
            task = self.active_tasks[user_id]
            if not task.done():
                task.cancel()
            del self.active_tasks[user_id]


task_manager = ActiveTaskManager()


@router.websocket("/ws/chat")
async def websocket_agent_endpoint(
        websocket: WebSocket,
        token: str = Query(...),
        db: Session = Depends(get_db)
):
    # 1. 严格的协议层身份审查
    user_id = decode_access_token(token)
    if not user_id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user = get_user_by_id(db, int(user_id))
    if not user or not user.is_active:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()

    # 🚀 这里的 run_agent_stream 是一个标准的协程，它可以被 create_task 调用
    async def run_agent_stream(question: Optional[str], is_resume: bool = False):
        try:
            # 透传 is_resume 标志
            async for chunk in stream_graph_response(question, user.id, is_resume=is_resume):
                await websocket.send_text(chunk)

            # 🚀 删除了原本硬编码的 {"type": "status", "content": "finished"}
            # 因为结束状态现在由 streaming.py 的第 4 步智能接管了！

        except asyncio.CancelledError:
            await websocket.send_text(json.dumps({"type": "status", "content": "canceled"}))
        except Exception as e:
            await websocket.send_text(json.dumps({"type": "error", "content": str(e)}))
        finally:
            if user.id in task_manager.active_tasks:
                del task_manager.active_tasks[user.id]

    # 2. 核心主循环：唯一的数据接收口 (Single Reader)
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            action = payload.get("action")

            if action == "query":
                question = payload.get("question", "")
                if not question:
                    continue
                # 新提问
                stream_task = asyncio.create_task(run_agent_stream(question, is_resume=False))
                task_manager.register_task(user.id, stream_task)

            elif action == "resume":
                # 🚀 前端发来“同意”指令，恢复执行！
                stream_task = asyncio.create_task(run_agent_stream(question=None, is_resume=True))
                task_manager.register_task(user.id, stream_task)

            elif action == "cancel":
                task_manager.cancel_task(user.id)

    except WebSocketDisconnect:
        # 前端正常或异常断开连接
        pass
    finally:
        # 连接彻底销毁时的资源兜底清理
        task_manager.cancel_task(user.id)