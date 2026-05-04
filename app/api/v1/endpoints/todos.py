from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.response import success_response
from app.models.user import User
from app.schemas.todo import TodoCreate, TodoResponse, TodoUpdate
from app.services import todo_service

router = APIRouter()


@router.post("/todos", status_code=status.HTTP_201_CREATED)
def create_todo(
    todo_create: TodoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    todo = todo_service.create_todo(
        db=db,
        todo_create=todo_create,
        owner_id=current_user.id,
    )

    return success_response(
        data=TodoResponse.model_validate(todo).model_dump(mode="json"),
        message="todo created successfully",
    )


@router.get("/todos")
def list_todos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    todos = todo_service.list_todos(
        db=db,
        owner_id=current_user.id,
    )

    return success_response(
        data=[
            TodoResponse.model_validate(todo).model_dump(mode="json")
            for todo in todos
        ],
        message="todo list fetched successfully",
    )


@router.get("/todos/{todo_id}")
def get_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    todo = todo_service.get_todo(
        db=db,
        todo_id=todo_id,
        owner_id=current_user.id,
    )

    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found",
        )

    return success_response(
        data=TodoResponse.model_validate(todo).model_dump(mode="json"),
        message="todo fetched successfully",
    )


@router.put("/todos/{todo_id}")
def update_todo(
    todo_id: int,
    todo_update: TodoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    todo = todo_service.update_todo(
        db=db,
        todo_id=todo_id,
        owner_id=current_user.id,
        todo_update=todo_update,
    )

    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found",
        )

    return success_response(
        data=TodoResponse.model_validate(todo).model_dump(mode="json"),
        message="todo updated successfully",
    )


@router.delete("/todos/{todo_id}")
def delete_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = todo_service.delete_todo(
        db=db,
        todo_id=todo_id,
        owner_id=current_user.id,
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found",
        )

    return success_response(
        data={"id": todo_id},
        message="todo deleted successfully",
    )