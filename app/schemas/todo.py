from typing import Optional
from pydantic import BaseModel, Field

class TodoCreate(BaseModel):
    title: str = Field(...,min_length=1, max_length=100, description="Todo标题")
    description: Optional[str] = Field(None, max_length=500, description="Todo描述")

class TodoUpdate(BaseModel):
    title: Optional[str] = Field(None,min_length=1, max_length=100, description="Todo标题")
    description: Optional[str] = Field(None, max_length=500, description="Todo描述")
    completed: Optional[bool] = Field(None, description="Todo完成状态")

class TodoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    completed: bool