import json

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.response import success_response
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import create_chat_message
from app.services.llm_service import chat_with_llm
from app.services.llm_stream_service import stream_chat_with_llm

router = APIRouter()


@router.post("/chat")
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """非流式对话：一次性返回完整回答"""
    assistant_message = chat_with_llm(request.message, db, current_user.id)

    chat_message = create_chat_message(
        db=db,
        owner_id=current_user.id,
        user_message=request.message,
        assistant_message=assistant_message,
    )

    return success_response(
        data=ChatResponse.model_validate(chat_message).model_dump(mode="json"),
        message="chat success",
    )


@router.post("/chat/stream")
def chat_stream(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """SSE 流式对话：逐 token 返回，完成后保存 ChatMessage"""

    def event_generator():
        full_response = ""

        try:
            for token in stream_chat_with_llm(
                request.message, db, current_user.id
            ):
                full_response += token
                yield f"data: {json.dumps({'type': 'token', 'content': token}, ensure_ascii=False)}\n\n"

            # 保存到数据库
            chat_message = create_chat_message(
                db=db,
                owner_id=current_user.id,
                user_message=request.message,
                assistant_message=full_response,
            )
            yield f"data: {json.dumps({'type': 'saved', 'id': chat_message.id}, ensure_ascii=False)}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'content': 'finished'}, ensure_ascii=False)}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
