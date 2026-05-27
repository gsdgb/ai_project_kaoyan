
from langchain_openai import ChatOpenAI
from app.core.config import settings


def get_llm():

    return ChatOpenAI(
        model="deepseek-chat",
        temperature=0,
        api_key=settings.OPENAI_API_KEY,
        base_url="https://api.deepseek.com",
    )