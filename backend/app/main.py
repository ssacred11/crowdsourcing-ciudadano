from fastapi import FastAPI, Request
from .routers import auth, incidents, health
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Crowdsourcing Ciudadano API", version="0.1.0")

# Middleware opcional: guarda el tenant del header (fallback si no lo envías por parámetro)
@app.middleware("http")
async def add_tenant_to_request(request: Request, call_next):
    tenant_id = request.headers.get("x-tenant-id", "default")
    request.state.tenant_id = tenant_id
    return await call_next(request)

# Rutas
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(incidents.router, prefix="/incidents", tags=["incidents"])

# CORS
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)