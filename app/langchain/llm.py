from langchain_openai import ChatOpenAI

from app.core.config import settings


def get_llm():

    return ChatOpenAI(

        model=settings.OPENAI_MODEL,

        base_url=settings.OPENAI_BASE_URL,

        api_key=settings.OPENAI_API_KEY,

        temperature=0.7,

        streaming=True
    )