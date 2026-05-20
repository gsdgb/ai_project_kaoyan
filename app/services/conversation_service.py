from sqlalchemy.orm import Session

from app.models.chat_message import ChatMessage


def get_recent_messages(
    db: Session,
    owner_id: int,
    limit: int = 5,
):
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.owner_id == owner_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
        .all()
    )

    return list(reversed(messages))