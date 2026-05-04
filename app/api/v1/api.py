from fastapi import APIRouter

from app.api.v1.endpoints import auth, health, todos, users

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, tags=["Auth"])
api_router.include_router(users.router, tags=["Users"])
api_router.include_router(todos.router, tags=["Todos"])