from langchain_core.tools import tool

from tavily import TavilyClient

from app.core.config import settings


client = TavilyClient(
    api_key=settings.TAVILY_API_KEY
)


@tool
def search_tool(query: str) -> str:
    """
    联网搜索工具
    """

    response = client.search(
        query=query,
        search_depth="advanced",
        max_results=3
    )

    results = response.get("results", [])

    if not results:
        return "没有搜索到结果"

    final_result = []

    for item in results:

        title = item.get("title", "")
        content = item.get("content", "")

        final_result.append(
            f"标题: {title}\n内容: {content}"
        )

    return "\n\n".join(final_result)


@tool
def rag_tool(query: str) -> str:
    """
    RAG知识库检索
    """

    return f"RAG结果: {query}"