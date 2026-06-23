from contextlib import asynccontextmanager
from langgraph.checkpoint.redis.aio import AsyncRedisSaver
from app.core.config import settings

@asynccontextmanager
async def get_redis_checkpointer():
    """
    工业级 Redis Checkpointer 资源管理器。
    """
    # 🚀 核心修复：使用官方底层的 from_conn_string 方法，直接传入 REDIS_URL。
    # 这样底层库会自动帮我们建立异步连接，管理生命周期，并在 yield 结束后安全销毁。
    async with AsyncRedisSaver.from_conn_string(settings.REDIS_URL) as saver:
        yield saver