import time


def print_node_start(node_name: str):

    print("\n")
    print("=" * 80)

    print(f"进入节点: {node_name}")

    print("=" * 80)


def print_node_end(node_name: str):

    print("\n")
    print("-" * 80)

    print(f"离开节点: {node_name}")

    print("-" * 80)


def print_state(state):

    print("\n当前 State:\n")

    for key, value in state.items():

        print(f"{key}:")

        print(value)

        print()


def print_tool_call(tool_name: str, tool_input: str):

    print("\n")
    print("#" * 80)

    print(f"Tool 调用: {tool_name}")

    print(f"Tool 输入: {tool_input}")

    print("#" * 80)


def print_router_decision(decision: str):

    print("\n")
    print("*" * 80)

    print(f"Router 决策: {decision}")

    print("*" * 80)


def print_execution_time(start_time):

    cost = time.time() - start_time

    print("\n")

    print(f"耗时: {cost:.2f} 秒")