from openai import OpenAI

from app.core.config import settings

client = OpenAI(
    api_key=settings.OPENAI_API_KEY,
    base_url=settings.OPENAI_BASE_URL,
)


def chat_with_llm(message: str) -> str:
    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": "你是一个直言不讳的 AI 学习助手。",
            },
            {
                "role": "user",
                "content": message,
            }
        ],
        temperature=0.7,
    )

    return response.choices[0].message.content