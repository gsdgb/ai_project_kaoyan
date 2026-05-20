from openai import OpenAI
from requests import Session

from app.core.config import settings
from app.rag.vectordb.chroma_service import get_vectorstore

from app.services.conversation_service import get_recent_messages
from app.rag.prompts.system_prompt import SYSTEM_PROMPT

from app.models.chat_message import ChatMessage

client = OpenAI(
    api_key=settings.OPENAI_API_KEY,
    base_url=settings.OPENAI_BASE_URL,
)

def rag_chat(query: str,owner_id: int,db: Session):
    vectorstore = get_vectorstore()

    docs = vectorstore.similarity_search(
        query=query,
        k=3,# 返回的文档数量
        filter={
            "owner_id": owner_id
        }
    )

    sources = []

    for doc in docs:
        sources.append({
            "source": doc.metadata.get("source"),
            "file_id": doc.metadata.get("file_id"),
        })

    context = "\n\n".join(
        [doc.page_content for doc in docs]
    )

    prompt = f"""
你是一个 AI 学习助手。

请基于以下知识库内容回答问题。

知识库内容：
{context}

用户问题：
{query}
"""

    history_messages = get_recent_messages(
        db=db,
        owner_id=owner_id,
    )

    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT,
        }
    ]

    for msg in history_messages:
        messages.append({
            "role": "user",
            "content": msg.user_message,
        })

        messages.append({
            "role": "assistant",
            "content": msg.assistant_message,
        })

    messages.append({
        "role": "user",
        "content": prompt,
    })

    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        temperature=0.3,
    )

    assistant_reply = response.choices[0].message.content

    # 保存聊天记录
    chat_message = ChatMessage(
        owner_id=owner_id,
        user_message=query,
        assistant_message=assistant_reply,
    )

    db.add(chat_message)
    db.commit()
    db.refresh(chat_message)

    return {
        "answer": assistant_reply,
        "sources": sources,
    }
