import os
from pydantic import Field
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

DEFAULT_OPENAI_URL = 'https://api.openai.com/v1'
DEFAULT_OLLAMA_URL = 'http://host.docker.internal:11434'
DEFAULT_CONNECTION_STRING = 'postgresql+asyncpg://postgres:postgres@postgres:5432/rag_demo'

class Settings(BaseSettings):
    """Settings for the application."""
    ai_client: str = Field(default=os.getenv('OPENAI_CLIENT', 'openai'), examples=['openai', 'ollama'])
    connection_string: str = Field(default=os.getenv('DATABASE_URL', DEFAULT_CONNECTION_STRING))
    openai_api_key: str = Field(default=os.getenv('OPENAI_API_KEY', ''))
    openai_base_url: str = Field(default=os.getenv('OPENAI_BASE_URL', DEFAULT_OPENAI_URL))
    ollama_url: str = Field(default=os.getenv('OLLAMA_URL', DEFAULT_OLLAMA_URL))


settings = Settings()