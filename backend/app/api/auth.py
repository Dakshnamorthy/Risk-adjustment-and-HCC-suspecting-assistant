import os

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session

from app.auth_dependencies import SESSION_COOKIE, require_auth
from app.database.connection import get_db
from app.schemas.auth import LoginRequest
from app.services.auth_service import AuthService

router = APIRouter(tags=["Authentication"])


@router.post("/login")
def login(credentials: LoginRequest, response: Response, db: Session = Depends(get_db)):
	result = AuthService(db).login(credentials.username, credentials.password)
	if result is None:
		raise HTTPException(status_code=401, detail="Invalid username or password.")

	token, user = result
	response.set_cookie(
		SESSION_COOKIE,
		token,
		httponly=True,
		secure=os.getenv("COOKIE_SECURE", "false").lower() == "true",
		samesite=os.getenv("COOKIE_SAMESITE", "lax"),
		max_age=8 * 60 * 60,
	)
	return {"message": "Login successful", "user": user}


@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
	token = request.cookies.get(SESSION_COOKIE)
	if token:
		AuthService(db).logout(token)
	response.delete_cookie(SESSION_COOKIE)
	return {"message": "Logout successful"}


@router.get("/me")
def me(user=Depends(require_auth)):
	return {"user": user}
