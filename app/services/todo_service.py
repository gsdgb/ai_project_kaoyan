import  sqlite3
from typing import List, Optional, Dict, Any

from app.core.config import settings
from app.schemas.todo import TodoCreate, TodoUpdate

def get_connection():
    conn = sqlite3.connect(settings.DATABADE_URL)#
    conn.row_factory = sqlite3.Row#
    return conn

def init_db():
    conn = get_connection()#获取连接
    cursor = conn.cursor()#获取游标

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            completed INTEGER NOT NULL DEFAULT 0
        )
        """
    )#创建表

    conn.commit()#提交
    cursor.close()

def row_to_dict(row: sqlite3.Row) -> Dict[str, Any]:
    return {
        "id": row["id"],
        "title": row["title"],
        "description": row["description"],
        "completed": bool(row["completed"]),
    }

def create_todo(todo: TodoCreate) -> Dict[str, Any]:
    conn = get_connection()#获取连接
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO todos (title, description, completed)
        VALUES(?,?,?)
        """,
        (todo.title, todo.description, 0)#插入数据
    )

    conn.commit()
    todo_id = cursor.lastrowid

    cursor.execute(
        """
        SELECT id, title, description, completed
        FROM todos
        WHERE id = ?
        """
        (todo_id,)
    )

    row = cursor.fetchone()
    conn.close()

    return row_to_dict(row)

def list_todos() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, title, description, completed
        FROM todos
        ORDER BY id DESC
        """
    )

    rows = cursor.fetchall()#获取所有数据
    conn.close()

    return [row_to_dict(row) for row in rows]#转换为字典

def get_todo(todo_id: int) -> Optional[Dict[str,Any]]:
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT id, title, description, completed
        FROM todos
        WHERE id = ?
        """,
        (todo_id,)
    )

    row = cursor.fetchone()#获取数据
    conn.close()

    if row is None:
        return None
    return row_to_dict(row)

def update_todo(todo_id: int, todo: TodoUpdate) -> Optional[Dict[str, Any]]:
    old_todo = get_todo(todo_id)#

    if old_todo is None:
        return None

    new_title = todo.title if todo.title is not None else old_todo["title"]
    new_description = todo.description if todo.description is not None else old_todo["description"]
    new_completed = todo.completed if todo.completed is not None else old_todo["completed"]

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE todos
        SET title = ?, description = ?, completed = ?
        WHERE id = ?
        """,
        (new_title, new_description, new_completed, todo_id)
    )

    conn.commit()
    conn.close()

    return get_todo(todo_id)

def delete_todo(todo_id: int) -> bool:
    old_todo = get_todo(todo_id)

    if old_todo is None:
        return False

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        DELETE FROM todos
        WHERE id = ?
        """,
        (todo_id,)
    )
    conn.commit()
    conn.close()

    return True












