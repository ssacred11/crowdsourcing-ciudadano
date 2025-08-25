from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.core.security import create_access_token, USERS

router = APIRouter()

class LoginIn(BaseModel):
    username: str

@router.post("/login")
def login(payload: LoginIn):
    username = payload.username.strip().lower()
    user = USERS.get(username)
    if not user:
        USERS[username] = {"role": "student"}
        user = USERS[username]
    token = create_access_token(sub=username, role=user["role"])
    return {"access_token": token, "token_type": "bearer"}
