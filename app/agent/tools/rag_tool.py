
from langchain.tools import tool


@tool
def rag_search(query: str):
    """
    RAG 检索工具
    """

    return f"RAG结果: {query}"

