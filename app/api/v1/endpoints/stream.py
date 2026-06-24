from fastapi import APIRouter, Query, Depends
from fastapi.responses import StreamingResponse
from app.runtime.streaming import stream_graph_response
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/stream")
async def stream_chat(
    question: str = Query(..., min_length=1),#
    current_user: User = Depends(get_current_user)  # 严格鉴权
):
    """
    高性能标准 SSE 流式接口
    """
    async def event_generator():
        async for chunk in stream_graph_response(question, current_user.id):
            # 严格遵循 standard SSE 帧格式
            yield f"data: {chunk}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # 禁用 Nginx 缓冲区，确保零延迟推送
        }
    )