from typing import AsyncGenerator

import json

from app.graph.agent_graph import graph

from app.runtime.structured_output import (
    AgentResponse
)


async def stream_graph_response(
    question: str
) -> AsyncGenerator[str, None]:

    initial_state = {

        "question": question,

        "plan": "",

        "research": "",

        "reflection": "",

        "final_answer": "",

        "search_count": 0,

        "messages": []
    }

    async for event in graph.astream(
        initial_state,
        config={
            "recursion_limit": 10
        }
    ):

        for step, value in event.items():

            response = AgentResponse(
                step=step,
                content=str(value),
                status="running"
            )

            yield json.dumps(
                response.dict(),
                ensure_ascii=False
            )