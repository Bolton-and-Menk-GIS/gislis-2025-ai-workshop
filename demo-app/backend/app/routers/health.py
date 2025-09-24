import time
from fastapi import APIRouter
from app.schemas import HealthResponse, PingResponse

health_api = APIRouter(prefix="/health", tags=["health"])

start_time = time.time()

@health_api.get("/", response_model=HealthResponse)
def get_health():
    uptime = time.time() - start_time
    return {"status": "ok", "uptime": uptime}

@health_api.get("/ping", response_model=PingResponse)
def ping():
    uptime = time.time() - start_time
    return {"status": "ok", "uptime": uptime, 'message': 'pong', 'code': 200, 'test': 'testing, testing, 123. Did it work?'}   
