def human_approval(action: str):

    print("\n")
    print(f"AI 准备执行操作: {action}")

    answer = input(
        "是否允许？(yes/no): "
    )

    return answer == "yes"