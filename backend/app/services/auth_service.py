import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
from sqlalchemy import text
from sqlalchemy.orm import Session


class AuthService:
	SESSION_HOURS = 8

	def __init__(self, db: Session):
		self.db = db

	def login(self, username: str, password: str):
		user = self.db.execute(text("""
			SELECT id, username, password_hash, role, is_active
			FROM users
			WHERE username = :username
		"""), {"username": username}).mappings().first()

		if user is None or not user["is_active"]:
			return None

		try:
			valid = bcrypt.checkpw(password.encode("utf-8"), user["password_hash"].encode("utf-8"))
		except (ValueError, TypeError):
			valid = False
		if not valid:
			return None

		token = secrets.token_urlsafe(32)
		token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
		expires_at = datetime.now(timezone.utc) + timedelta(hours=self.SESSION_HOURS)
		self.db.execute(text("""
			INSERT INTO auth_sessions (user_id, token_hash, expires_at)
			VALUES (:user_id, :token_hash, :expires_at)
		"""), {"user_id": user["id"], "token_hash": token_hash, "expires_at": expires_at})
		self.db.commit()
		return token, {"id": user["id"], "username": user["username"], "role": user["role"]}

	def logout(self, token: str):
		token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
		self.db.execute(text("""
			UPDATE auth_sessions
			SET revoked_at = CURRENT_TIMESTAMP
			WHERE token_hash = :token_hash AND revoked_at IS NULL
		"""), {"token_hash": token_hash})
		self.db.commit()
