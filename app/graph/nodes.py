import time

from app.graph.state import AgentState

from app.langchain.llm import get_llm

from app.graph.prompts import (
    PLANNER_PROMPT,
    RESEARCH_PROMPT,
    REFLECTION_PROMPT
)

from app.graph.tools import search_tool

from app.graph.logger import (
    print_node_start,
    print_node_end,
    print_state,
    print_execution_time
)


llm = get_llm()


def planner_node(state: AgentState):

    start_time = time.time()

    print_node_start("Planner")

    print_state(state)

    question = state["question"]

    prompt = f"""
    {PLANNER_PROMPT}

    用户问题：
    {question}
    """

    response = llm.invoke(prompt)

    result = {
        "plan": response.content
    }

    print("\nPlanner 输出:\n")

    print(response.content)

    print_execution_time(start_time)

    print_node_end("Planner")

    return result


def research_node(state: AgentState):

    start_time = time.time()

    print_node_start("Research")

    print_state(state)

    plan = state["plan"]

    search_result = search_tool.invoke(plan)

    prompt = f"""
    {RESEARCH_PROMPT}

    搜索计划：
    {plan}

    搜索结果：
    {search_result}

    请总结研究结果。
    """

    response = llm.invoke(prompt)

    result = {
        "research": response.content,
        "search_count": state["search_count"] + 1
    }

    print("\nResearch 输出:\n")

    print(response.content)

    print_execution_time(start_time)

    print_node_end("Research")

    return result


def reflection_node(state: AgentState):

    start_time = time.time()

    print_node_start("Reflection")

    print_state(state)

    research = state["research"]

    prompt = f"""
    {REFLECTION_PROMPT}

    当前研究结果：

    {research}
    """

    response = llm.invoke(prompt)

    result = {
        "reflection": response.content
    }

    print("\nReflection 输出:\n")

    print(response.content)

    print_execution_time(start_time)

    print_node_end("Reflection")

    return result


def final_node(state: AgentState):

    start_time = time.time()

    print_node_start("Final")

    print_state(state)

    question = state["question"]

    research = state["research"]

    prompt = f"""
    用户问题：
    {question}

    研究结果：
    {research}

    请生成最终答案。
    """

    response = llm.invoke(prompt)

    result = {
        "final_answer": response.content
    }

    print("\nFinal Answer:\n")

    print(response.content)

    print_execution_time(start_time)

    print_node_end("Final")

    return result