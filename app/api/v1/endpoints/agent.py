from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.agent.services.agent_service import agent_chat
from app.api.deps import get_current_user, get_db
from app.core.response import success_response
from app.models.user import User

router = APIRouter()


@router.post("/agent/chat")
def agent_chat_api(
    query: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = agent_chat(
        query=query,
        owner_id=current_user.id,
        db=db,
    )

    return success_response(
        data=result,
        message="agent chat success",
    )