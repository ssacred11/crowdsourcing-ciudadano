from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from uuid import uuid4

router = APIRouter()

class IncidentIn(BaseModel):
    title: str
    description: str
    type_id: Optional[int] = None
    area_id: Optional[int] = None

class IncidentOut(IncidentIn):
    id: str

# almacenamiento temporal en memoria
_DB: List[IncidentOut] = []

@router.post("", status_code=201)
def create_incident(payload: IncidentIn):
    item = IncidentOut(id=str(uuid4()), **payload.model_dump())
    _DB.append(item)
    return item

@router.get("", response_model=List[IncidentOut])
def list_incidents(status: Optional[str] = None):
    return _DB

@router.patch("/{incident_id}")
def update_incident(incident_id: str, patch: dict):
    for it in _DB:
        if it.id == incident_id:
            return {"id": it.id, "updated": True, "patch": patch}
    return {"error": "not found"}
