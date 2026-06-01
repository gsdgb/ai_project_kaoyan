from typing import TypedDict
from typing import List


class AgentState(TypedDict):

    question: str

    plan: str

    research: str

    reflection: str

    final_answer: str

    search_count: int

    messages: List[str]