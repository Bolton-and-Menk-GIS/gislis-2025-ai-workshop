from pydantic import BaseModel, Field
from typing import Optional

class Extent(BaseModel):
    xmin: float
    ymin: float
    xmax: float
    ymax: float

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
    features: list[RagFeature] = Field(default_factory=list)