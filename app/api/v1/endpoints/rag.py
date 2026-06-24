from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.response import success_response
from app.models.chat_message import ChatMessage
from app.models.user import User
from app.rag.services.rag_service import rag_chat

router = APIRouter()


@router.post("/rag/chat")
def rag_chat_api(
    query: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = rag_chat(
        query=query,
        owner_id=current_user.id,
        db=db,
    )

    return success_response(
        data=result,
        message="rag chat success",
    )


@router.get("/rag/history")
def rag_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.owner_id == current_user.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    data = []
    for msg in messages:
        data.append({
            "id": msg.id,
            "user_message": msg.user_message,
            "assistant_message": msg.assistant_message,
            "created_at": msg.created_at,
        })

    return success_response(
        data=data,
        message="rag history success",
    )
