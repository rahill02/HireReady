from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.utils.dependencies import get_current_user
from app.services.resume_service import upload_and_analyze_resume
from app.database import get_db
from bson import ObjectId

router = APIRouter(prefix="/resume", tags=["Resume"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    # Validate file type
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are accepted"
        )

    # Read file bytes
    file_bytes = await file.read()

    # Validate file size
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 5MB"
        )

    result = await upload_and_analyze_resume(
        file_bytes=file_bytes,
        filename=file.filename,
        user_id=str(current_user["_id"])
    )

    return result


@router.get("/analysis")
async def get_resume_analysis(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    user = await db.users.find_one({"_id": ObjectId(str(current_user["_id"]))})

    if not user.get("resume_url"):
        raise HTTPException(
            status_code=404,
            detail="No resume uploaded yet"
        )

    return {
        "resume_url": user.get("resume_url"),
        "analysis": user.get("resume_analysis")
    }