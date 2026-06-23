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

    question = state["question"]
    # 🧠 读取记忆：获取最近的 6 条对话记录（3轮对话）作为短期上下文
    history_messages = state.get("messages", [])
    recent_history = "\n".join(history_messages[-6:]) if history_messages else "暂无历史记录"

    # 注入记忆到 Prompt
    prompt = f"""
    {PLANNER_PROMPT}

    【历史对话记忆】
    {recent_history}

    【当前用户问题】
    {question}
    """

    response = llm.invoke(prompt)

    # Planner 阶段不需要追加 messages，仅更新 plan
    result = {
        "plan": response.content
    }
    # ... 省略下方原有的打印和耗时计算逻辑，原样保留即可 ...
    return result


def research_node(state: AgentState):

    start_time = time.time()

    print_node_start("Research")

    print_state(state)

    plan = state["plan"]

    if len(plan) > 400:
        extract_prompt = f"""
        请将以下研究计划提炼成一个简洁的搜索查询（不超过200个字符）：

        研究计划：
        {plan}

        要求：
        1. 提取核心关键词和关键问题
        2. 保持语义完整，适合搜索引擎使用
        3. 严格控制在200字符以内
        4. 直接输出查询内容，不要添加其他说明

        简洁查询：
        """

        extraction_response = llm.invoke(extract_prompt)
        query = extraction_response.content.strip()

        if len(query) > 200:
            query = query[:200]
    else:
        query = plan

    search_result = search_tool.invoke(query)

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

    # 🧠 写入记忆：将本轮的用户问题和 Agent 回答，以 List 的形式返回
    # 由于 state.py 中配置了 operator.add，LangGraph 会自动把这两条塞入 Redis 列表末尾！
    result = {
        "final_answer": response.content,
        "messages": [
            f"User: {question}",
            f"Agent: {response.content}"
        ]
    }
    # ... 省略下方原有的打印逻辑 ...
    return result