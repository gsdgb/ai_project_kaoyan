from langgraph.graph import StateGraph
from langgraph.graph import START, END

from app.graph.state import AgentState

from app.graph.nodes import (
    planner_node,
    research_node,
    reflection_node,
    final_node
)

from app.graph.routers import reflection_router


builder = StateGraph(AgentState)


builder.add_node(
    "planner",
    planner_node
)

builder.add_node(
    "researcher",
    research_node
)

builder.add_node(
    "reflector",
    reflection_node
)

builder.add_node(
    "finalizer",
    final_node
)


builder.add_edge(
    START,
    "planner"
)

builder.add_edge(
    "planner",
    "researcher"
)

builder.add_edge(
    "researcher",
    "reflector"
)


builder.add_conditional_edges(
    "reflector",
    reflection_router,
    {
        "research": "researcher",
        "final": "finalizer"
    }
)

builder.add_edge(
    "finalizer",
    END
)


graph = builder.compile()