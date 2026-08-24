from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    role: str


class LoginResponse(BaseModel):
    message: str
    user: UserResponse
