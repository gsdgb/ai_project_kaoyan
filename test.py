from app.graph.agent_graph import graph


result = graph.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": "搜索今天中国江西5个城市的天气"
            }
        ]
    },
    config={
        "recursion_limit": 10
    }
)

print(result)