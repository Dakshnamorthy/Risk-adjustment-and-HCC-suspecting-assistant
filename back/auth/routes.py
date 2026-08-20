from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from auth.models import User
from auth.schemas import LoginRequest, LoginResponse
from auth.utils import verify_password

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Step 1: look up the user
    user = db.query(User).filter(User.user_id == request.user_id).first()

    # Step 2: user not found -> reject
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user ID or password")

    # Step 3: check password
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid user ID or password")

    # Step 4: success
    return LoginResponse(
        status="success",
        message="Login successful",
        user_id=user.user_id,
        role=user.role
    )