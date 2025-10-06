from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal, Any, TypeVar, Generic
from app.schemas.prompts import AskPromptType
from openai.types.completion_usage import CompletionUsage

ClientType = Literal['openai', 'ollama', 'huggingface']

T = TypeVar('T')
Context = TypeVar('Context')
Response = TypeVar('Response')

class Extent(BaseModel):
    lat: float
    lon: float
    radius: float

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
    client: ClientType
    modified_at: Optional[str] = ''
    size: Optional[int] = 0
    digest: Optional[str] = ''
    details: ModelDetails

class OllamaModelsResponse(BaseModel):
    models: List[LLMModel]

class PDFResult(BaseModel):
    file_name: str | None = None
    num_pages: int = 0
    num_images: int = 0
    metadata: dict[str, str | None] = {}
    scanned: bool = False
    content: list[str] = []

class RagResponse(BaseModel):
    summary: str
    features: list[dict] = Field(default_factory=list)

class ChatPayloadBase(BaseModel, Generic[T]):
    model: str = Field(default='gpt-3.5-turbo')
    temperature: Optional[float] = Field(default=0.7, ge=0, le=2)
    max_tokens: Optional[int] = 4096
    timeout: Optional[int] = 180
    context: Optional[T] = None

    class Config:
        model_config = ConfigDict(extra="allow")

class AskPayload(ChatPayloadBase):
    text: str
    prompt: Optional[AskPromptType] = 'ask'

class ChatPayload(ChatPayloadBase):
    stream: bool = Field(default=True)
    messages: List[dict] = Field(default_factory=list)

class ChatResponse(BaseModel, Generic[Response, Context]):
    response: Response
    context: Optional[Context] = None
    model: str
    usage: Optional[CompletionUsage] = None

    class Config:
        model_config = ConfigDict(extra="allow")

