from langgraph.prebuilt import create_react_agent

from app.langchain.llm import get_llm

from app.graph.tools import (
    search_tool,
    rag_tool
)


llm = get_llm()

tools = [
    search_tool,
    rag_tool
]

system_prompt = """
你是企业 AI 助手。

**严格执行规则**：
1. 最多调用 2 次工具
2. 获取到信息后立即回复用户，不要再次搜索
3. 用简洁的话回复
4. 不要重复搜索相似内容
"""

graph = create_react_agent(
    model=llm,
    tools=tools,
    state_modifier=system_prompt
)