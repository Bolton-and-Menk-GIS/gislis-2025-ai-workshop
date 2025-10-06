from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Sequence
from app.schemas.llm import ChatResponse

class Extent(BaseModel):
    xmin: float
    ymin: float
    xmax: float
    ymax: float

    class Config:
        model_config = ConfigDict(extra="allow")

class RagRequest(BaseModel):
    question: str
    extent: Optional[Extent] = None

class PointGeometry(BaseModel):
    type: str = "Point"
    coordinates: list[float]  # [lon, lat]

class RagFeature(BaseModel):
    objectid: int
    map_id: Optional[int] = None
    geometry: PointGeometry
    comment: str 

class RagResponse(BaseModel):
    answer: str
    features: Sequence[RagFeature] = Field(default_factory=list)

class RagChatResponse(BaseModel):
    response: ChatResponse[RagResponse, None]