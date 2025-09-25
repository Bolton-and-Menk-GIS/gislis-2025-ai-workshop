from pydantic import BaseModel, Field
from typing import List, Optional

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

class PDFResult(BaseModel):
    file_name: str | None = None
    num_pages: int = 0
    num_images: int = 0
    metadata: dict[str, str | None] = {}
    scanned: bool = False
    content: list[str] = []

class ModelDetails(BaseModel):
    parent_model: Optional[str] = ""
    format: Optional[str] = None
    family: str
    families: Optional[List[str]] = Field(default_factory=list)
    parameter_size: Optional[str] = None
    quantization_level: Optional[str] = None

class LLMModel(BaseModel):
    name: str
    model: str
    modified_at: Optional[str] = ''
    size: Optional[int] = 0
    digest: Optional[str] = ''
    details: ModelDetails

class OllamaModelsResponse(BaseModel):
    models: List[LLMModel]