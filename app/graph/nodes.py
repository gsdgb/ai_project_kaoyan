from langchain_core.messages import HumanMessage

from app.graph.state import AgentState
from app.graph.tools import search_tool, rag_tool

from app.langchain.llm import get_llm


llm = get_llm()

tools = [
    search_tool,
    rag_tool
]

llm_with_tools = llm.bind_tools(tools)


def chatbot_node(state: AgentState):

    question = state["question"]

    response = llm_with_tools.invoke(
        [
            HumanMessage(content=question)
        ]
    )

    return {
        "answer": response.content
    }