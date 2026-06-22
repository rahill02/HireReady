from fastapi import APIRouter
from app.models.user import UserRegister, UserLogin
from app.services.auth_service import register_user, login_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
async def register(user_data: UserRegister):
    return await register_user(
        name=user_data.name,
        email=user_data.email,
        password=user_data.password,
        target_role=user_data.target_role
    )

@router.post("/login")
async def login(user_data: UserLogin):
    return await login_user(
        email=user_data.email,
        password=user_data.password
    )