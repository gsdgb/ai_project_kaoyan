from fastapi import APIRouter, HTTPException, status

from app.core.response import success_response
from app.schemas.todo import TodoCreate, TodoUpdate
from app.services import todo_service

router = APIRouter()

@router.post("/todos", status_code=status.HTTP_201_CREATED)
def create_todo(todo: TodoCreate):
    new_todo = todo_service.create_todo(todo)

    return success_response(
        data=new_todo,
        message="Todo created successfully"
    )

@router.get("/todos")
def list_todos():
    todos = todo_service.list_todos()#获取所有数据

    return success_response(
        data=todos,
        message="Todos list fetched successfully"
    )

@router.get("/todos/{todo_id}")
def get_todo(todo_id: int):
    todo = todo_service.get_todo(todo_id)

    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    return success_response(
        data=todo,
        message="Todo fetched successfully"
    )

@router.put("/todos/{todo_id}")
def update_todo(todo_id: int, todo_update: TodoUpdate):
    update_todo = todo_service.update_todo(todo_id, todo_update)

    if update_todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    return success_response(
        data=update_todo,
        message="Todo updated successfully"
    )


@router.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    deleted = todo_service.delete_todo(todo_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    return success_response(
        data={
            "id": todo_id
        },
        message="Todo deleted successfully"
    )




























