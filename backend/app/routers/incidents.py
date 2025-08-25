from fastapi import APIRouter, Request, Depends, Header
from pydantic import BaseModel
from typing import Optional, List, Dict
from uuid import uuid4
from backend.app.core.security import require_role

router = APIRouter()

class IncidentIn(BaseModel):
    title: str
    description: str
    type_id: Optional[int] = None
    area_id: Optional[int] = None

class IncidentOut(IncidentIn):
    id: str
    tenant_id: str

# BD en memoria por tenant
_DB: Dict[str, List[IncidentOut]] = {}

@router.post("", status_code=201, dependencies=[Depends(require_role(["student","staff","admin"]))])
def create_incident(
    payload: IncidentIn,
    request: Request,
    x_tenant_id: str = Header("default", alias="x-tenant-id"),
):
    tenant = x_tenant_id or getattr(request.state, "tenant_id", "default")
    item = IncidentOut(id=str(uuid4()), tenant_id=tenant, **payload.model_dump())
    _DB.setdefault(tenant, []).append(item)
    return item

@router.get("", response_model=List[IncidentOut])
def list_incidents(
    request: Request,
    x_tenant_id: str = Header("default", alias="x-tenant-id"),
):
    tenant = x_tenant_id or getattr(request.state, "tenant_id", "default")
    return _DB.get(tenant, [])

@router.patch("/{incident_id}", dependencies=[Depends(require_role(["staff","admin"]))])
def update_incident(
    incident_id: str,
    patch: dict,
    request: Request,
    x_tenant_id: str = Header("default", alias="x-tenant-id"),
):
    tenant = x_tenant_id or getattr(request.state, "tenant_id", "default")
    for it in _DB.get(tenant, []):
        if it.id == incident_id:
            return {"id": it.id, "tenant_id": tenant, "updated": True, "patch": patch}
    return {"error": "not found"}
