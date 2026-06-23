import json
from typing import AsyncGenerator

from app.core.config import settings
# 注意：需要从 agent_graph 中引入原生的 builder
from app.graph.agent_graph import builder
from app.runtime.structured_output import AgentResponse
from app.runtime.memory import get_redis_checkpointer


async def stream_graph_response(
        question: str,
        user_id: int,
        session_id: str = "default_session"
) -> AsyncGenerator[str, None]:
    thread_id = f"user_{user_id}_{session_id}"

    print(f"\n➡️ [DEBUG] 1. 准备连接 Redis ({settings.REDIS_URL})...")  # 👈 新增

    async with get_redis_checkpointer() as saver:
        print("➡️ [DEBUG] 2. Redis 连接建立，准备编译 Graph...")  # 👈 新增

        graph_with_memory = builder.compile(checkpointer=saver)#挂载redis

        inputs = {
            "question": question,
            "search_count": 0,
        }

        config = {
            "configurable": {"thread_id": thread_id},
            "recursion_limit": 10
        }

        print("➡️ [DEBUG] 3. 开始执行 astream_events...")

        async for event in graph_with_memory.astream_events(
                inputs,
                version="v2",
                config=config
        ):
            event_type = event["event"]
            node_name = event.get("metadata", {}).get("langgraph_node", "")

            if event_type == "on_chat_model_stream":
                token = event["data"].get("chunk", {}).content
                if token:
                    yield json.dumps({"type": "token", "node": node_name, "content": token}, ensure_ascii=False)
            elif event_type == "on_tool_start":
                yield json.dumps(
                    {"type": "status", "content": f"🔍 正在搜索..."},
                    ensure_ascii=False)
            elif event_type == "on_tool_end":
                yield json.dumps(
                    {"type": "status", "content": f"✅ 搜索完成"},
                    ensure_ascii=False)
            elif event_type == "on_chain_end" and node_name in ["planner", "researcher", "reflector", "finalizer"]:
                yield json.dumps({"type": "status", "content": f"📌 {node_name} 阶段完成"}, ensure_ascii=False)