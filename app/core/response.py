from typing import Any, Optional


def success_response(data: Optional[Any] = None, message: str = "success"):
    return {
        "code": 200,
        "message": message,
        "data": data
    }


def error_response(message: str = "error", code: int = 400, data: Optional[Any] = None):
    return {
        "code": code,
        "message": message,
        "data": data
    }