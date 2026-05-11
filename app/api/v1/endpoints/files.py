from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.response import success_response
from app.models.user import User
from app.schemas.file import FileResponse
from app.services.file_service import save_upload_file

router = APIRouter()


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