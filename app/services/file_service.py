import os
import uuid

import aiofiles
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.models.user_file import UserFile

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".docx",
    ".txt",
}

MAX_FILE_SIZE = 10 * 1024 * 1024

UPLOAD_DIR = "app/storage/uploads"


async def save_upload_file(
    db: Session,
    owner_id: int,
    file: UploadFile,
):
    file_ext = os.path.splitext(file.filename)[1].lower()

    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type",
        )

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large",
        )

    unique_filename = f"{uuid.uuid4()}{file_ext}"

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    async with aiofiles.open(file_path, "wb") as out_file:
        await out_file.write(content)

    user_file = UserFile(
        owner_id=owner_id,
        filename=unique_filename,
        original_filename=file.filename,
        file_size=len(content),
        file_type=file_ext,
        file_path=file_path,
    )

    db.add(user_file)

    db.commit()

    db.refresh(user_file)

    return user_file