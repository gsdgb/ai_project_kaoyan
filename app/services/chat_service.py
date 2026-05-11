from sqlalchemy.orm import Session

from app.models.chat_message import ChatMessage


def create_chat_message(
    db: Session,
    owner_id: int,
    user_message: str,
    assistant_message: str,
):
    chat = ChatMessage(
        owner_id=owner_id,
        user_message=user_message,
        assistant_message=assistant_message,
    )

    db.add(chat)

    db.commit()

    db.refresh(chat)

    return chat