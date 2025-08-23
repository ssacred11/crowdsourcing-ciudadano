from fastapi import FastAPI
from .routers import auth, incidents, health

app = FastAPI(title="Crowdsourcing Ciudadano API", version="0.1.0")

app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(incidents.router, prefix="/incidents", tags=["incidents"])
