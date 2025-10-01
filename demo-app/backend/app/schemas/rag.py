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

class RagResponse(BaseModel):
    answer: str
    features: list[dict] = Field(default_factory=list)