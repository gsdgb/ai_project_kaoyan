from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.core.response import success_response
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter()


@router.get("/users/me")
def read_current_user(current_user: User = Depends(get_current_user)):
    return success_response(
        data=UserResponse.model_validate(current_user).model_dump(mode="json"),
        message="current user fetched successfully",
    )