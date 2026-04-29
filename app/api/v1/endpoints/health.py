from fastapi import APIRouter

from app.core.config import settings
from app.core.response import success_response

router = APIRouter()


@router.get("/health")
def health_check():
    return success_response(
        data={
            "status": "ok",
            "app_name": settings.APP_NAME,
            "version": settings.APP_VERSION
        },
        message="service is running"
    )