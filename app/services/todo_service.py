from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoUpdate


def create_todo(db: Session, todo_create: TodoCreate, owner_id: int) -> Todo:
    todo = Todo(
        title=todo_create.title,
        description=todo_create.description,
        owner_id=owner_id,
    )

    db.add(todo)
    db.commit()
    db.refresh(todo)

    return todo


def list_todos(db: Session, owner_id: int) -> List[Todo]:
    return (
        db.query(Todo)
        .filter(Todo.owner_id == owner_id)
        .order_by(Todo.id.desc())
        .all()
    )


def get_todo(db: Session, todo_id: int, owner_id: int) -> Optional[Todo]:
    return (
        db.query(Todo)
        .filter(Todo.id == todo_id, Todo.owner_id == owner_id)
        .first()
    )


def update_todo(
    db: Session,
    todo_id: int,
    owner_id: int,
    todo_update: TodoUpdate,
) -> Optional[Todo]:
    todo = get_todo(db, todo_id, owner_id)

    if todo is None:
        return None

    if todo_update.title is not None:
        todo.title = todo_update.title

    if todo_update.description is not None:
        todo.description = todo_update.description

    if todo_update.completed is not None:
        todo.completed = todo_update.completed

    db.commit()
    db.refresh(todo)

    return todo


def delete_todo(db: Session, todo_id: int, owner_id: int) -> bool:
    todo = get_todo(db, todo_id, owner_id)

    if todo is None:
        return False

    db.delete(todo)
    db.commit()

    return True