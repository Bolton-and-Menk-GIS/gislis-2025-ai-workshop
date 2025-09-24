from pydantic import BaseModel

class Extent(BaseModel):
    lat: float
    lon: float
    radius: float

class RagRequest(BaseModel):
    prompt: str
    extent: Extent

class RagResponse(BaseModel):
    summary: str
    features: list[dict]

class HealthResponse(BaseModel):
    status: str
    uptime: float

class PingResponse(BaseModel):
    status: str
    uptime: float
    message: str
    code: int
    test: str
