import asyncio
from typing import Any, Dict, List, Optional
from uuid import UUID
from langchain_core.callbacks import AsyncCallbackHandler
from langchain_core.outputs import LLMResult

class AsyncTokenQueueCallbackHandler(AsyncCallbackHandler):
    """
    工业级异步 Token 队列回调处理器
    采用 asyncio.Queue 实现线程安全的生产者-消费者模型，完美解决高并发下的 Token 积压与掉帧问题
    """
    def __init__(self) -> None:
        self.queue: asyncio.Queue = asyncio.Queue()
        self.done: asyncio.Event = asyncio.Event()

    async def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        """当大模型生成新 Token 时，推入队列"""
        if token:
            await self.queue.put(token)

    async def on_llm_end(self, response: LLMResult, **kwargs: Any) -> None:
        """LLM 推理结束，激活完成信号"""
        self.done.set()

    async def on_llm_error(self, error: BaseException, **kwargs: Any) -> None:
        """异常发生时，激活完成信号防止前端永久挂起"""
        self.done.set()

    async def token_generator(self):
        """消费者：异步迭代输出 Token，直至推理结束"""
        while not self.done.is_set() or not self.queue.empty():
            try:
                # 设置超时时间，防止网络僵死
                token = await asyncio.wait_for(self.queue.get(), timeout=0.1)
                yield token
                self.queue.task_done()
            except asyncio.TimeoutError:
                if self.done.is_set():
                    break