from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class SurveyPoint(BaseModel):
    id: str
    x: float
    y: float
    z: Optional[float] = None
    description: Optional[str] = None

class SurveyLine(BaseModel):
    id: str
    start_point: SurveyPoint
    end_point: SurveyPoint
    bearing: Optional[float] = None
    distance: Optional[float] = None
    description: Optional[str] = None

class CogoPath(BaseModel):
    id: str
    name: str
    points: List[SurveyPoint]
    lines: List[SurveyLine]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class CogoPathsResponse(BaseModel):
    paths: List[CogoPath]
    total_count: int = 0

class SurveyRequest(BaseModel):
    name: str
    description: Optional[str] = None
    coordinate_system: Optional[str] = "NAD83"

class SurveyResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    coordinate_system: str
    created_at: datetime
    paths: List[CogoPath] = Field(default_factory=list)
    total_paths: int = 0