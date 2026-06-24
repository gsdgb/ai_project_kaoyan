from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.response import success_response
from app.models.chat_message import ChatMessage
from app.models.user import User

router = APIRouter()


@router.get("/conversations")
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.owner_id == current_user.id)
        .order_by(ChatMessage.created_at.desc())
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
        message="conversation list success",
    )


@router.get("/conversations/{conversation_id}")
def get_conversation_detail(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    msg = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.id == conversation_id,
            ChatMessage.owner_id == current_user.id,
        )
        .first()
    )

    if msg is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return success_response(
        data={
            "id": msg.id,
            "user_message": msg.user_message,
            "assistant_message": msg.assistant_message,
            "created_at": msg.created_at,
        },
        message="conversation detail success",
    )
