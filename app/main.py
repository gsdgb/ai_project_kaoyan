from fastapi import FastAPI

from app.api.v1.api import api_router
from app.core.config import settings
from app.services.todo_service import init_db

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI 学习助手后端服务脚手架",
)


@app.on_event("startup")
def on_startup():
    init_db()


app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "message": "Welcome to AI Backend Starter",
        "docs": "/docs",
        "api_prefix": "/api/v1"
    }