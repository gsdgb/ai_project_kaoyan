from langchain.tools import tool


@tool
def tavily_search(query: str):
    """
    联网搜索工具
    """

    return f"联网搜索结果: {query}"




# from tavily import TavilyClient
#
# from app.core.config import settings
#
# client = TavilyClient(
#     api_key=settings.TAVILY_API_KEY
# )
#
#
# def search_web(query: str):
#     response = client.search(
#         query=query,
#         search_depth="advanced",
#         max_results=5,
#     )
#
#     results = []
#
#     for item in response["results"]:
#         results.append({
#             "title": item["title"],
#             "content": item["content"],
#             "url": item["url"],
#         })
#
#     return results