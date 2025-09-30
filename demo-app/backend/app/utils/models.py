import httpx
from app.config import settings
from app.utils.logging import logger
from app.schemas.llm import LLMModel, ModelDetails

DEFAULT_OLLAMA_MODEL =  "granite3.2:2b" 
DEFAULT_OPENAI_MODEL = "gpt-3.5-turbo"

# open ai models
openai_models: list[LLMModel] = list(
    map(
        lambda name: LLMModel(
            name=name, 
            model=name, 
            client='openai',
            details=ModelDetails(
                family="openai",
                families=["openai"],
            )
        ),
        ["gpt-3.5-turbo", "gpt-4o-mini", "gpt-4o"],
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
                client='ollama',
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
        logger.warning(f"An error occurred while requesting {e.request.url!r}.")
    except httpx.HTTPStatusError as e:
        logger.warning(f"Error response {e.response.status_code} while requesting {e.request.url!r}.")
    except Exception as e:
        logger.warning(f"An unexpected error occurred: {e}")
    return []

async def get_available_models() -> list[LLMModel]:
    """Get a combined list of available models from OpenAI and Ollama."""
    ollama_models = await fetch_ollama_models()
    combined_models = openai_models + ollama_models
    return combined_models


async def get_model_info(model_name: str) -> LLMModel | None:
    """Get details of a specific model by name.
    
    Args:
        model_name (str): The name of the model to retrieve details for.

    Returns:
        ModelDetails | None: The details of the model if found, otherwise None.
    """
    for model in openai_models:
        if model.model == model_name:
            return model
    models = await fetch_ollama_models()
    for model in models:
        if model.model == model_name:
            return model
    return None

async def validate_model(model_name: str) -> LLMModel:
    """Will ensure a model is found, if no model is found with given name a default model will be returned.
    
    Args:
        model_name (str): The name of the model to retrieve details for.

    Returns:
        ModelDetails | None: The details of the model if found, otherwise None.
    
    """
    model = await get_model_info(model_name)
    if not model:
        model = openai_models[0]  # Default to first OpenAI model
        logger.warning(f'Model "{model_name}" not found. Defaulting to "{model.name}".')
        
    return model