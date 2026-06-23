from langchain_openai import ChatOpenAI

from app.core.config import settings


def get_llm():

    return ChatOpenAI(

        model="deepseek-chat",

        base_url="https://api.deepseek.com",

        api_key=settings.OPENAI_API_KEY,

        temperature=0.7,

        streaming=True
    )