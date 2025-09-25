import os
import databases
import sqlalchemy
from pydantic import Field
from pydantic_settings import BaseSettings
from dotenv import load_dotenv


load_dotenv()

db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'chatbot.sqlite'))
print('db_path:', db_path)

DEFAULT_OLLAMA_URL = 'http://vm-gis-3002:11434/v1'
DEFAULT_OPENAI_URL = 'https://api.openai.com/v1'
DEFAULT_OLLAMA_URL = 'http://host.docker.internal:11434'
DEFAULT_CONNECTION_STRING = 'postgresql+psycopg2://postgres:postgres@postgres:5432/rag_demo'

class Settings(BaseSettings):
    """Settings for the application."""
    ai_client: str = Field(default=os.getenv('OPENAI_CLIENT', 'openai'), examples=['openai', 'ollama'])
    connection_string: str = Field(default=os.getenv('DATABASE_URL', DEFAULT_CONNECTION_STRING))
    openai_api_key: str = Field(default=os.getenv('OPENAI_API_KEY', ''))
    openai_base_url: str = Field(default=os.getenv('OPENAI_BASE_URL', DEFAULT_OPENAI_URL))
    ollama_url: str = Field(default=os.getenv('OLLAMA_URL', DEFAULT_OLLAMA_URL))


settings = Settings()

def set_client(client: str, url: str | None=None):
    """Set the AI client to use."""
    client = client or os.getenv('OPENAI_CLIENT', 'openai')
    if client not in ['openai', 'ollama']:
        print("Client must be either 'openai' or 'ollama'")
    settings.ai_client = client
    if (client == 'ollama'):
        settings.openai_base_url = os.getenv('OPENAI_BASE_URL', url or DEFAULT_OLLAMA_URL)
    else:
        settings.openai_base_url = url or DEFAULT_OPENAI_URL
    print(f"AI client set to: {settings.ai_client}")

set_client(settings.ai_client)
print('client and baseurl: ', settings.ai_client, settings.openai_base_url)

# Initialize database connection
database = databases.Database(settings.connection_string)
metadata = sqlalchemy.MetaData()
engine = sqlalchemy.create_engine(settings.connection_string)

