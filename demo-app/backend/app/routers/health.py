import time
from fastapi import APIRouter
from app.schemas.general import HealthResponse

health_api = APIRouter(prefix="/health", tags=["health"])

start_time = time.time()

@health_api.get("/", response_model=HealthResponse)
async def get_health():
    uptime = time.time() - start_time
    return {"status": "ok", "uptime": uptime}
