from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class LoginIn(BaseModel):
    username: str

@router.post("/login")
def login(payload: LoginIn):
    # Mock: devuelve un token fijo por ahora
    return {"access_token": "mock-token", "token_type": "bearer"}
