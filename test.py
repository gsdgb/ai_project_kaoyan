from app.graph.agent_graph import graph


initial_state = {

    "question": "2026年AI Agent的发展趋势是什么？简单回复",

    "plan": "",

    "research": "",

    "reflection": "",

    "final_answer": "",

    "search_count": 0,

    "messages": []
}


result = graph.invoke(
    initial_state,
    config={
        "recursion_limit": 10
    }
)

print("\n")
print("=" * 80)
print("Workflow 结束")
print("=" * 80)

print("\n最终答案:\n")

print(result["final_answer"])