
from fastapi import APIRouter
from app.utils.models import get_available_models
from app.schemas.prompts import AskPromptOptions
from app.schemas.llm import OllamaModelsResponse, AskPayload, ChatResponse
from app.utils.openai import run_chat_completion
from app.utils.prompts import load_prompt_template

chat_api = APIRouter(prefix="/assistant", tags=["AI Assistant"])

@chat_api.get("/models", response_model=OllamaModelsResponse)
async def get_models():
    # In a real implementation, you might fetch this from a model provider or config
    available_models = await get_available_models()
    return {"models": available_models}

@chat_api.post("/ask", response_model=ChatResponse)
async def ask_question(payload: AskPayload):
    prompt = load_prompt_template(name=payload.prompt or 'ask', question=payload.text, context=payload.context or None)
    messages = [{"role": "user", "content": prompt}]
    response = await run_chat_completion(
        messages=messages,
        model=payload.model,
        temperature=payload.temperature,
        max_tokens=payload.max_tokens,
        timeout=payload.timeout,
        stream=False
    )
    return response

@chat_api.get("/ask/prompts", response_model=AskPromptOptions)
async def get_prompts():
    """Return available prompt types for asking a question."""
    return AskPromptOptions()
