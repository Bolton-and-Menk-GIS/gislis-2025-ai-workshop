import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.agents.orchestrators import chat_orchestrator
from app.utils.types import ChatContext

chat_api = APIRouter()

@chat_api.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket):
    await websocket.accept()
    try:
        messages = []
        while True:
            data = await websocket.receive_json()
            user_message = data.get("user_message")
            context_data = data.get("context", {})
            context = ChatContext(**context_data) if context_data else None

            messages.append({"role": "user", "content": user_message})

            # Stream mode on for general chat; agent-based handlers may override
            stream = True

            # If you're using agents for certain intents, you can inspect here if they allow streaming
            chat_response = await chat_orchestrator(
                messages=messages,
                context=context,
                model="gpt-4o",
                stream=stream,
            )

            if stream and isinstance(chat_response.message, str):
                # fallback: if you still got a string message, send it as one payload
                await websocket.send_json(chat_response.dict())
            elif stream and isinstance(chat_response.message, list):
                # if streamed message was accumulated as chunks, emit as events
                for token in chat_response.message:
                    await websocket.send_text(token)

                # signal end of response
                await websocket.send_text("<END>")
            else:
                # regular fallback if streaming not used
                await websocket.send_json(chat_response.dict())

            messages.append({"role": "assistant", "content": chat_response.message})

    except WebSocketDisconnect:
        print("Client disconnected.")