import time

print("=== yield 版本（边生产边消费）===")
print("开始等待...", flush=True)

def type_message_yield(message):
    for char in message:
        time.sleep(0.5)
        yield char

for char in type_message_yield("你好世界"):
    print(char, end="", flush=True)

print()
print()
print("=== return 版本（全部生产完才能消费）===")
print("开始等待...", flush=True)

def type_message_return(message):
    result = []
    for char in message:
        time.sleep(0.5)
        result.append(char)
    return result

for char in type_message_return("你好世界"):
    print(char, end="", flush=True)
