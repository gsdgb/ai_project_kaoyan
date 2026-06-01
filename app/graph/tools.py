from langchain_core.tools import tool

from tavily import TavilyClient

from app.core.config import settings

from app.graph.logger import print_tool_call


client = TavilyClient(
    api_key=settings.TAVILY_API_KEY
)


@tool
def search_tool(query: str) -> str:
    """
    联网搜索工具
    """

    print_tool_call(
        "search_tool",
        query
    )

    response = client.search(
        query=query,
        search_depth="advanced",
        max_results=5
    )

    results = response.get("results", [])

    if not results:
        return "没有搜索结果"

    final_results = []

    for item in results:

        title = item.get("title", "")
        content = item.get("content", "")

        final_results.append(
            f"标题: {title}\n内容: {content}"
        )

    return "\n\n".join(final_results)