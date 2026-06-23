from app.graph.state import AgentState

from app.graph.logger import print_router_decision


def reflection_router(state: AgentState):

    reflection = state["reflection"]

    search_count = state["search_count"]

    if search_count >= 2:

        print_router_decision(
            "达到最大搜索次数 -> FINAL"
        )

        return "final"

    if "NEED_MORE_RESEARCH" in reflection:

        print_router_decision(
            "继续 Research"
        )

        return "research"

    print_router_decision(
        "信息足够 -> FINAL"
    )

    return "final"