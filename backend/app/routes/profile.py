from fastapi import APIRouter, Depends
from app.utils.dependencies import get_current_user
from app.database import get_db
from pydantic import BaseModel
from typing import Optional
from bson import ObjectId

router = APIRouter(prefix="/profile", tags=["Profile"])

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    target_role: Optional[str] = None
    skills: Optional[list[str]] = None

@router.get("/me")
async def get_profile(current_user=Depends(get_current_user)):
    return {
        "id": str(current_user["_id"]),
        "name": current_user["name"],
        "email": current_user["email"],
        "target_role": current_user["target_role"],
        "skills": current_user.get("skills", []),
    }

@router.put("/update")
async def update_profile(
    updates: ProfileUpdate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}

    if not update_data:
        return {"message": "Nothing to update"}

    await db.users.update_one(
        {"_id": ObjectId(str(current_user["_id"]))},
        {"$set": update_data}
    )

    updated_user = await db.users.find_one({"_id": ObjectId(str(current_user["_id"]))})

    return {
        "id": str(updated_user["_id"]),
        "name": updated_user["name"],
        "email": updated_user["email"],
        "target_role": updated_user["target_role"],
        "skills": updated_user.get("skills", []),
    }