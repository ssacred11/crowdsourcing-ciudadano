from fastapi import APIRouter, Request, Depends, Header
from pydantic import BaseModel
from typing import Optional, List, Dict
from uuid import uuid4
from backend.app.core.security import require_role

# --- Moderation import (fail-open si no está disponible) ---
try:
    from moderation.core.analyzer import analyze_report  # Benja's module
except Exception:
    def analyze_report(text: str):
        # fallback suave: no bloquea creación si el módulo no está
        return {"flag": False, "reasons": [], "severity": "leve"}
# -----------------------------------------------------------

router = APIRouter()

class IncidentIn(BaseModel):
    title: str
    description: str
    type_id: Optional[int] = None
    area_id: Optional[int] = None

class IncidentOut(IncidentIn):
    id: str
    tenant_id: str
    # --- Campos de moderación ---
    moderation_flag: bool
    moderation_reasons: List[str]
    severity: str  # "leve" | "media" | "grave"
    # ----------------------------

# BD en memoria por tenant (hasta conectar Postgres)
_DB: Dict[str, List[IncidentOut]] = {}

@router.post("", status_code=201)
def create_incident(
    payload: IncidentIn,
    request: Request,
    x_tenant_id: str = Header("default", alias="x-tenant-id"),
    user: dict = Depends(require_role(["student","staff","admin"])),
):
    tenant = x_tenant_id or getattr(request.state, "tenant_id", "default")

    # 1) Moderación (usa title+description como entrada)
    text = f"{payload.title}\n{payload.description}".strip()
    try:
        mod = analyze_report(text) or {}
    except Exception:
        mod = {"flag": False, "reasons": [], "severity": "leve"}

    # Normaliza claves esperadas
    flag = bool(mod.get("flag", False))
    reasons = list(mod.get("reasons", []))
    severity = str(mod.get("severity", "leve"))

    # 2) Construye el objeto salida (con moderación)
    item = IncidentOut(
        id=str(uuid4()),
        tenant_id=tenant,
        title=payload.title,
        description=payload.description,
        type_id=payload.type_id,
        area_id=payload.area_id,
        moderation_flag=flag,
        moderation_reasons=reasons,
        severity=severity,
    )
    _DB.setdefault(tenant, []).append(item)
    return item

@router.get("", response_model=List[IncidentOut])
def list_incidents(
    request: Request,
    x_tenant_id: str = Header("default", alias="x-tenant-id"),
):
    tenant = x_tenant_id or getattr(request.state, "tenant_id", "default")
    return _DB.get(tenant, [])

@router.patch("/{incident_id}")
def update_incident(
    incident_id: str,
    patch: dict,
    request: Request,
    x_tenant_id: str = Header("default", alias="x-tenant-id"),
    user: dict = Depends(require_role(["staff","admin"])),
):
    tenant = x_tenant_id or getattr(request.state, "tenant_id", "default")
    for it in _DB.get(tenant, []):
        if it.id == incident_id:
            return {"id": it.id, "tenant_id": tenant, "updated": True, "patch": patch}
    return {"error": "not found"}

