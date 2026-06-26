import json

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.response import success_response
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import create_chat_message
from app.services.llm_service import chat_with_llm
from app.services.llm_stream_service import (
    stream_chat_with_llm,
    stream_chat_with_prompt,
)

router = APIRouter()


@router.post("/chat")
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """非流式对话：一次性返回完整回答"""
    assistant_message = chat_with_llm(request.message, db, current_user.id)

    chat_message = create_chat_message(
        db=db,
        owner_id=current_user.id,
        user_message=request.message,
        assistant_message=assistant_message,
    )

    return success_response(
        data=ChatResponse.model_validate(chat_message).model_dump(mode="json"),
        message="chat success",
    )


@router.post("/chat/stream")
def chat_stream(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """SSE 流式对话：支持普通聊天和 RAG 检索增强生成

    SSE 事件格式：
      data: {"type":"sources","sources":[...]}
      data: {"type":"token","content":"..."}
      data: {"type":"saved","id":...}
      data: {"type":"done"}
      data: {"type":"error","content":"..."}
    """

    def event_generator():
        full_response = ""

        try:
            if request.use_rag:
                from app.rag.vectordb.chroma_service import get_vectorstore

                vectorstore = get_vectorstore()
                docs = vectorstore.similarity_search(
                    query=request.message,
                    k=3,
                    filter={"owner_id": current_user.id},
                )

                sources = []
                for doc in docs:
                    text = doc.page_content or ""
                    sources.append({
                        "content": text[:300],
                        "source": doc.metadata.get("source", ""),
                        "file_id": doc.metadata.get("file_id"),
                    })

                yield f"data: {json.dumps({'type': 'sources', 'sources': sources}, ensure_ascii=False)}\n\n"

                if not docs or not any(doc.page_content.strip() for doc in docs):
                    full_response = "未在知识库中找到与该问题相关的文档内容。请先上传相关文件后再试。"
                    yield f"data: {json.dumps({'type': 'token', 'content': full_response}, ensure_ascii=False)}\n\n"
                else:
                    context = "\n\n".join([doc.page_content for doc in docs])
                    prompt = f"""你是一个 AI 学习助手。

请严格基于以下知识库内容回答问题。如果知识库内容不足以回答，请明确说明"知识库中暂无相关信息"，不要编造。

知识库内容：
{context}

用户问题：
{request.message}"""

                    for token in stream_chat_with_prompt(
                        prompt, db, current_user.id
                    ):
                        full_response += token
                        yield f"data: {json.dumps({'type': 'token', 'content': token}, ensure_ascii=False)}\n\n"
            else:
                for token in stream_chat_with_llm(
                    request.message, db, current_user.id
                ):
                    full_response += token
                    yield f"data: {json.dumps({'type': 'token', 'content': token}, ensure_ascii=False)}\n\n"

            # 保存到数据库
            chat_message = create_chat_message(
                db=db,
                owner_id=current_user.id,
                user_message=request.message,
                assistant_message=full_response,
            )
            yield f"data: {json.dumps({'type': 'saved', 'id': chat_message.id}, ensure_ascii=False)}\n\n"
            yield f"data: {json.dumps({'type': 'done', 'content': 'finished'}, ensure_ascii=False)}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
