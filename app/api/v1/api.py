from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    chat,
    files,
    health,
    todos,
    users,
    rag,
    conversations,
    agent,

)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, tags=["Auth"])
api_router.include_router(users.router, tags=["Users"])
api_router.include_router(todos.router, tags=["Todos"])
api_router.include_router(chat.router, tags=["Chat"])
api_router.include_router(files.router, tags=["Files"])
api_router.include_router(rag.router, tags=["RAG"])
api_router.include_router(
    conversations.router,
    tags=["Conversations"],
)
api_router.include_router(agent.router, tags=["Agent"])
