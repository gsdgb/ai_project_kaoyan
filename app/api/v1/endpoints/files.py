import os

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.response import success_response
from app.models.user import User
from app.models.user_file import UserFile
from app.schemas.file import FileResponse
from app.services.file_service import save_upload_file
from app.rag.vectordb.chroma_service import delete_vectors_by_file

router = APIRouter()


@router.get("/files")
def list_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    files = (
        db.query(UserFile)
        .filter(UserFile.owner_id == current_user.id)
        .order_by(UserFile.created_at.desc())
        .all()
    )

    data = []
    for f in files:
        data.append({
            "id": f.id,
            "filename": f.original_filename,
            "file_type": f.file_type,
            "file_size": f.file_size,
            "created_at": f.created_at,
        })

    return success_response(
        data=data,
        message="file list success",
    )


@router.post("/files/upload")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_file = await save_upload_file(
        db=db,
        owner_id=current_user.id,
        file=file,
    )

    return success_response(
        data=FileResponse.model_validate(user_file).model_dump(mode="json"),
        message="file uploaded successfully",
    )


@router.delete("/files/{file_id}")
def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_file = (
        db.query(UserFile)
        .filter(
            UserFile.id == file_id,
            UserFile.owner_id == current_user.id,
        )
        .first()
    )

    if user_file is None:
        raise HTTPException(status_code=404, detail="File not found")

    # 删除 Chroma 向量
    delete_vectors_by_file(owner_id=current_user.id, file_id=user_file.id)

    # 删除磁盘文件
    file_path = user_file.file_path
    if file_path and os.path.exists(file_path):
        os.remove(file_path)

    db.delete(user_file)
    db.commit()

    return success_response(
        data=None,
        message="file deleted successfully",
    )
