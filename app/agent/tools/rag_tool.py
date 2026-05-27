
from langchain.tools import tool


@tool
def rag_search(query: str):
    """
    RAG 检索工具
    """

    return f"RAG结果: {query}"











# from sqlalchemy.orm import Session
#
# from app.rag.services.rag_service import rag_chat
#
#
# def rag_tool(
#     query: str,
#     owner_id: int,
#     db: Session,
# ):
#     result = rag_chat(
#         query=query,
#         owner_id=owner_id,
#         db=db,
#     )
#
#     return result
