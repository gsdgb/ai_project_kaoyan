from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.response import success_response
from app.core.security import create_access_token
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.schemas.auth import Token
from app.services.auth_service import authenticate_user
from app.services.user_service import create_user, get_user_by_email, get_user_by_username

router = APIRouter()


@router.post("/auth/register", response_model=dict)
def register(user_create: UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user_by_username(db, user_create.username)

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )

    if user_create.email:
        existing_email_user = get_user_by_email(db, user_create.email)
        if existing_email_user is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

    user = create_user(db, user_create)

    return success_response(
        data=UserResponse.model_validate(user).model_dump(mode="json"),
        message="user registered successfully",
    )


@router.post("/auth/login", response_model=dict)
def login(user_login: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_login.username, user_login.password)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=str(user.id))

    token = Token(access_token=access_token)

    return success_response(
        data=token.model_dump(),
        message="login successfully",
    )