import cloudinary
import cloudinary.uploader
import fitz  # pymupdf
import tempfile
import os
from app.config import settings
from app.services.ai_service import analyze_resume
from app.database import get_db
from bson import ObjectId
from fastapi import HTTPException

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret
)

async def upload_and_analyze_resume(file_bytes: bytes, filename: str, user_id: str) -> dict:
    db = get_db()

    # Step 1 — Extract text from PDF
    pdf_text = extract_text_from_pdf(file_bytes)
    if not pdf_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from PDF. Make sure it's not a scanned image."
        )

    # Step 2 — Upload to Cloudinary
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        upload_result = cloudinary.uploader.upload(
            tmp_path,
            resource_type="raw",
            folder="resumes",
            public_id=f"resume_{user_id}",
            overwrite=True
        )
        resume_url = upload_result["secure_url"]
    finally:
        os.unlink(tmp_path)

    # Step 3 — Analyze with AI
    analysis = await analyze_resume(pdf_text)

    # Step 4 — Save to user document
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "resume_url": resume_url,
            "resume_analysis": analysis
        }}
    )

    return {
        "resume_url": resume_url,
        "analysis": analysis
    }


def extract_text_from_pdf(file_bytes: bytes) -> str:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        doc = fitz.open(tmp_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text
    finally:
        os.unlink(tmp_path)