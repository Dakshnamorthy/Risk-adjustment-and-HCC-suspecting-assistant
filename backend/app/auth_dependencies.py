import hashlib
from datetime import datetime, timezone

from fastapi import Depends, HTTPException, Request
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database.connection import get_db

SESSION_COOKIE = "cts_session"


def require_auth(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")

    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    user = db.execute(text("""
        SELECT u.id, u.username, u.role
        FROM auth_sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = :token_hash
          AND s.expires_at > CURRENT_TIMESTAMP
          AND s.revoked_at IS NULL
          AND u.is_active = TRUE
    """), {"token_hash": token_hash}).mappings().first()
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    return dict(user)
