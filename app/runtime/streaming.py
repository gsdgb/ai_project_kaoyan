import json
from typing import AsyncGenerator, Optional

from app.graph.agent_graph import builder
from app.runtime.structured_output import AgentResponse
from app.runtime.memory import get_redis_checkpointer


async def stream_graph_response(
        question: Optional[str],  # 🚀 改为 Optional，因为恢复执行时传入的是 None
        user_id: int,
        session_id: str = "default_session",
        is_resume: bool = False  # 🚀 新增参数：标识是否为断点恢复操作
) -> AsyncGenerator[str, None]:
    thread_id = f"user_{user_id}_{session_id}"

    async with get_redis_checkpointer() as saver:

        # 🧠 1. 编译 Graph 并注入断点机制
        # 设置在进入 researcher 节点前强行中断 (等待人类审批)
        graph_with_memory = builder.compile(
            checkpointer=saver,
            interrupt_before=["researcher"]  # 👈 核心魔法：执行完 Planner 后自动暂停
        )

        config = {
            "configurable": {"thread_id": thread_id},
            "recursion_limit": 10
        }

        # 🧠 2. 状态机输入判断
        if is_resume:
            inputs = None  # None 告诉 LangGraph：不需要新输入，从内存的断点处继续执行
        else:
            inputs = {"question": question, "search_count": 0}

        # 🧠 3. 执行流式事件
        async for event in graph_with_memory.astream_events(
                inputs,
                version="v2",
                config=config
        ):
            event_type = event["event"]
            node_name = event.get("metadata", {}).get("langgraph_node", "")

            if event_type == "on_chat_model_stream":
                token = event["data"].get("chunk", {}).content
                if token:
                    yield json.dumps({"type": "token", "node": node_name, "content": token}, ensure_ascii=False)

            elif event_type == "on_tool_start":
                yield json.dumps(
                    {"type": "tool_start", "tool_name": event["name"], "input": event["data"].get("input", "")},
                    ensure_ascii=False)

            elif event_type == "on_chain_end" and node_name in ["planner", "researcher", "reflector", "finalizer"]:
                yield json.dumps({"type": "node_end", "node": node_name}, ensure_ascii=False)

        # 🧠 4. 运行结束后的状态判定 (谁负责收尾？)
        # 获取当前图的状态
        state = await graph_with_memory.aget_state(config)

        # 如果下一步是 researcher，说明图被我们刚才设置的 interrupt_before 成功拦截了！
        if state.next and state.next[0] == "researcher":
            plan_content = state.values.get("plan", "暂无计划")
            yield json.dumps({
                "type": "hitl",
                "content": "pending_approval",
                "message": "Planner 计划已生成，等待人类确认以继续检索...",
                "plan": plan_content
            }, ensure_ascii=False)
        # 如果 next 为空，说明整个流程走完了（到了 END 节点）
        elif not state.next:
            yield json.dumps({"type": "status", "content": "finished"}, ensure_ascii=False)