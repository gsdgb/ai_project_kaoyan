from langchain.tools import tool

@tool
def tavily_search(query: str):
    """
    联网搜索工具
    """

    return f"联网搜索结果: {query}"

