from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    chat,
    files,
    health,
    todos,
    users,
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, tags=["Auth"])
api_router.include_router(users.router, tags=["Users"])
api_router.include_router(todos.router, tags=["Todos"])
api_router.include_router(chat.router, tags=["Chat"])
api_router.include_router(files.router, tags=["Files"])