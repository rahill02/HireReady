from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# What we accept when registering
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    target_role: str  # "frontend" | "backend" | "fullstack" | "dsa"

# What we accept when logging in
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# What we store in MongoDB
class UserInDB(BaseModel):
    name: str
    email: str
    password_hash: str
    target_role: str
    skills: list[str] = []
    resume_url: Optional[str] = None
    created_at: datetime = datetime.utcnow()

# What we send back to the frontend (never include password_hash)
class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    target_role: str
    skills: list[str]