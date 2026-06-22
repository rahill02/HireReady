from datetime import datetime
from app.database import get_db
from app.utils.password import hash_password, verify_password
from app.utils.jwt_handler import create_access_token
from fastapi import HTTPException, status

async def register_user(name: str, email: str, password: str, target_role: str) -> dict:
    db = get_db()

    # Check if email already exists
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Validate password length
    if len(password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters"
        )

    # Build the user document
    user_doc = {
        "name": name,
        "email": email,
        "password_hash": hash_password(password),
        "target_role": target_role,
        "skills": [],
        "resume_url": None,
        "created_at": datetime.utcnow()
    }

    # Insert into MongoDB
    result = await db.users.insert_one(user_doc)

    # Create and return a token immediately (auto-login after register)
    token = create_access_token({"sub": str(result.inserted_id)})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(result.inserted_id),
            "name": name,
            "email": email,
            "target_role": target_role,
            "skills": []
        }
    }


async def login_user(email: str, password: str) -> dict:
    db = get_db()

    # Find user by email
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Create token
    token = create_access_token({"sub": str(user["_id"])})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "target_role": user["target_role"],
            "skills": user.get("skills", [])
        }
    }