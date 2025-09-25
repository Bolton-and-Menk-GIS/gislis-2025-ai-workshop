import httpx
from app.config import settings
from app.schemas import LLMModel, ModelDetails
openai_models: list[LLMModel] = list(
    map(
        lambda name: LLMModel(
            name=name, 
            model=name, 
            details=ModelDetails(
                family="openai",
                families=["openai"],
            )
        ),
        ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"],
    )
)

async def fetch_ollama_models() -> list[LLMModel]:
    """Fetch available models from the Ollama API."""
    url = f'{settings.ollama_url}/api/tags'
  
    try:
        response = httpx.get(url, timeout=10.0)
        response.raise_for_status()
        models_json = response.json()
        ollama_data = [
            LLMModel(
                name=m.get("name", ""),
                model=m.get("name", ""),
                size=m.get("size", 0),
                digest=m.get("digest", ""),
                modified_at=m.get("modifiedAt", ""),
                details=ModelDetails(
                    **m.get("details", {}),
                )
            ) for m in models_json.get('models', [])
        ]
        return ollama_data
    except httpx.RequestError as e:
        print(f"An error occurred while requesting {e.request.url!r}.")
        print(e)
    except httpx.HTTPStatusError as e:
        print(f"Error response {e.response.status_code} while requesting {e.request.url!r}.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    return []

async def get_available_models() -> list[LLMModel]:
    """Get a combined list of available models from OpenAI and Ollama."""
    ollama_models = await fetch_ollama_models()
    combined_models = openai_models + ollama_models
    return combined_models