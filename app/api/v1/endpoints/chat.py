from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.response import success_response
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import create_chat_message
from app.services.llm_service import chat_with_llm

router = APIRouter()


@router.post("/chat")
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assistant_message = chat_with_llm(request.message, db, current_user.id)

    chat_message = create_chat_message(
        db=db,
        owner_id=current_user.id,
        user_message=request.message,
        assistant_message=assistant_message,
    )

    return success_response(
        data=ChatResponse.model_validate(chat_message).model_dump(mode="json"),
        message="chat success",
    )
