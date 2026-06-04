from openai import OpenAI
from sqlalchemy.orm import Session

from app.agent.prompts.agent_prompt import AGENT_SYSTEM_PROMPT
from app.agent.tools.rag_tool import rag_search
from app.agent.tools.search_tool import tavily_search
from app.core.config import settings

client = OpenAI(
    api_key=settings.OPENAI_API_KEY,
    base_url=settings.OPENAI_BASE_URL,
)


def choose_tool(query: str):
    query_lower = query.lower()

    if any(word in query_lower for word in [
        "最新",
        "新闻",
        "today",
        "联网",
    ]):
        return "search"

    return "rag"


def agent_chat(
    query: str,
    owner_id: int,
    db: Session,
):
    tool = choose_tool(query)

    tool_result = None

    if tool == "search":
        tool_result = tavily_search(query)

    elif tool == "rag":
        tool_result = rag_search(
            query=query,
            owner_id=owner_id,
            db=db,
        )

    prompt = f"""
用户问题：
{query}

工具结果：
{tool_result}

请基于工具结果回答用户问题。
"""

    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": AGENT_SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": prompt,
            }
        ],
        temperature=0.3,
    )

    print(tool_result)

    return {

        "tool_used": tool,
        "tool_result": tool_result,
        "answer": response.choices[0].message.content,
    }
