from pydantic import BaseModel, Field, ConfigDict, computed_field
from typing import List, Optional, Literal
from datetime import datetime

class TieLine(BaseModel):
    bearing: str
    distance: float

DivisionLevel = Literal['section', 'quarter', 'forty']
class ReferencePoint(BaseModel):
    corner: str
    tieLine: TieLine
    divisionLevel: DivisionLevel
    referenceWhere: str

    class Config:
        model_config = ConfigDict(extra="allow")

class TraverseSegment(BaseModel):
    bearing: str
    distance: float

class SurveyInfo(BaseModel):
    section: int | str
    township: int | str
    townshipDirection: str
    range: int | str
    rangeDirection: str
    quarterQuarter: str
    referencePoint: ReferencePoint
    traverse: List[TraverseSegment]
    area: Optional[str | int] = None
    whereClause: str

    class Config:
        model_config = ConfigDict(extra="allow")

class LegalDescriptionEntry(BaseModel):
    index: int
    text: str
    confidence: float

class LegalDescriptionInfo(BaseModel):
    legalDescriptions: List[LegalDescriptionEntry] = Field(default_factory=list)

    @computed_field
    @property
    def count(self) -> int:
        return len(self.legalDescriptions)

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

class GetSurveyRequest(BaseModel):
    legalDescription: str

class SurveyResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    coordinate_system: str
    created_at: datetime
    paths: List[CogoPath] = Field(default_factory=list)
    total_paths: int = 0