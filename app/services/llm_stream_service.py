from collections.abc import Generator

from openai import OpenAI
from sqlalchemy.orm import Session

from app.core.config import settings
from app.services.conversation_service import get_recent_messages

client = OpenAI(
    api_key=settings.OPENAI_API_KEY,
    base_url=settings.OPENAI_BASE_URL,
)


def stream_chat_with_llm(
    message: str, db: Session, owner_id: int
) -> Generator[str, None, None]:
    history = get_recent_messages(db, owner_id, limit=10)

    messages = [
        {"role": "system", "content": "你是一个直言不讳的 AI 学习助手。"},
    ]

    for msg in history:
        messages.append({"role": "user", "content": msg.user_message})
        messages.append({"role": "assistant", "content": msg.assistant_message})

    messages.append({"role": "user", "content": message})

    stream = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        temperature=0.7,
        stream=True,
    )

    for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
