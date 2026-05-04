from fastapi import FastAPI

from app.api.v1.api import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine

# 重要：导入 models，确保 SQLAlchemy 能识别模型
from app import models  # noqa: F401

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI 学习助手后端服务脚手架",
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "message": "Welcome to AI Backend Starter",
        "docs": "/docs",
        "api_prefix": "/api/v1",
    }