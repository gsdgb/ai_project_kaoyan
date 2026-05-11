from datetime import datetime

from pydantic import BaseModel


class FileResponse(BaseModel):
    id: int

    filename: str
    original_filename: str

    file_size: int
    file_type: str

    created_at: datetime

    class Config:
        from_attributes = True