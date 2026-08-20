from pydantic import BaseModel

# ---- What the frontend sends us when logging in ----
class LoginRequest(BaseModel):
    user_id: str
    password: str

# ---- What we send back if login succeeds ----
class LoginResponse(BaseModel):
    status: str
    message: str
    user_id: str
    role: str