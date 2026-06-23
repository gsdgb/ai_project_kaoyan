from typing import TypedDict, Annotated, List
import operator


class AgentState(TypedDict):
    question: str
    plan: str
    research: str
    reflection: str
    final_answer: str
    search_count: int

    # 🌟 核心魔法：使用 Annotated 和 operator.add 构建 Reducer (状态聚合器)
    # 当后续节点返回 {"messages": ["新消息"]} 时，LangGraph 会自动将其追加到历史列表中，而不是覆盖。
    messages: Annotated[List[str], operator.add]