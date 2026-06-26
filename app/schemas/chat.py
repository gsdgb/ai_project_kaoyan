from datetime import datetime

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    use_rag: bool = False


class ChatResponse(BaseModel):
    id: int

    user_message: str
    assistant_message: str

    created_at: datetime

    class Config:
        from_attributes = True