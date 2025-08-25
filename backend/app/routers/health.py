from fastapi import APIRouter
from starlette.responses import JSONResponse
from starlette import status


router = APIRouter()

@router.get("")
def health():
    return {"status": "ok"}



@router.get("/readiness")
def readiness():
    # luego aquí chequeamos DB; por ahora OK
    return {"ready": True}
