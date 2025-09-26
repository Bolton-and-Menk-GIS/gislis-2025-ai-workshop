
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.utils.models import get_available_models
from app.schemas.prompts import AskPromptOptions
from app.schemas.llm import OllamaModelsResponse, AskPayload, ChatResponse
from app.utils.openai import run_chat_completion, load_prompt_template
# Uncomment the following lines if agent orchestrators and ChatContext are implemented
# from app.agents.orchestrators import chat_orchestrator
# from app.utils.types import ChatContext

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

@chat_api.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket):
    ...
    # await websocket.accept()
    # try:
    #     messages = []
    #     while True:
    #         data = await websocket.receive_json()
    #         user_message = data.get("user_message")
    #         context_data = data.get("context", {})
    #         context = ChatContext(**context_data) if context_data else None

    #         messages.append({"role": "user", "content": user_message})

    #         # Stream mode on for general chat; agent-based handlers may override
    #         stream = True

            # # If you're using agents for certain intents, you can inspect here if they allow streaming
            # chat_response = await chat_orchestrator(
            #     messages=messages,
            #     context=context,
            #     model="gpt-4o",
            #     stream=stream,
            # )

            # if stream and isinstance(chat_response.message, str):
            #     # fallback: if you still got a string message, send it as one payload
            #     await websocket.send_json(chat_response.dict())
            # elif stream and isinstance(chat_response.message, list):
            #     # if streamed message was accumulated as chunks, emit as events
            #     for token in chat_response.message:
            #         await websocket.send_text(token)

            #     # signal end of response
            #     await websocket.send_text("<END>")
            # else:
            #     # regular fallback if streaming not used
            #     await websocket.send_json(chat_response.dict())

            # messages.append({"role": "assistant", "content": chat_response.message})

    # except WebSocketDisconnect:
    #     print("Client disconnected.")