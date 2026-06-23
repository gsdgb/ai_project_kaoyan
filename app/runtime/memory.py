from contextlib import asynccontextmanager
from langgraph.checkpoint.redis.aio import AsyncRedisSaver
from app.core.config import settings

@asynccontextmanager
async def get_redis_checkpointer():
    """
    工业级 Redis Checkpointer 资源管理器。
    (完美适配 LangGraph 1.0.1 + Checkpoint 3.0.1 生态)
    """
    # 🚀 在最新生态下，直接使用官方的异步上下文管理器 from_conn_string。
    # 它会自动建立连接池、传递安全参数 (allowed_objects)，并在结束时优雅断开。
    async with AsyncRedisSaver.from_conn_string(settings.REDIS_URL) as saver:
        yield saver