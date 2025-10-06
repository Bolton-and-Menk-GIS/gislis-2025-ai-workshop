
from fastapi import WebSocket
from app.config import settings
from openai import AsyncOpenAI
from app.utils.models import validate_model
from app.utils.logging import logger
from app.schemas.llm import ClientType, ChatResponse
from typing import Optional
import json # type: ignore


def get_llm_client(client_type: ClientType='openai', base_url: Optional[str]=None, api_key: Optional[str]=None) -> AsyncOpenAI:
    """Get an instance of the LLM client based on the specified type.

    Args:
        client_type (ClientType): The type of LLM client to use ('openai', 'ollama', or 'huggingface').
        base_url (str, optional): The base URL for the LLM API. Defaults to None.
        api_key (str, optional): The API key for authentication. Defaults to None.

    Returns:
        AsyncOpenAI: An instance of the LLM client.
    """
    if client_type == 'openai' and not api_key:
        api_key = settings.openai_api_key

    if client_type == 'ollama' and not base_url:
        base_url = f'{settings.ollama_url}/v1'
        logger.info(f'Creating LLM client of type "{client_type}" with base_url="{base_url}"')

    return AsyncOpenAI(
        base_url=base_url,
        api_key=api_key
    )

async def run_chat_completion(
        messages: list, 
        model: str='gpt-3.5-turbo', 
        stream=True, 
        websocket: Optional[WebSocket]=None, 
        max_tokens: Optional[int]=4096, 
        timeout: Optional[int]=180, 
        temperature: Optional[float]=0.7, **kwargs
    ) -> ChatResponse:
    """Run chat completion using the OpenAI API.

    Args:
        messages (list): The messages to send to the model.
        model (ChatModel): The model to use for chat completion.
        stream (bool, optional): Whether to stream the response. Defaults to True.
        websocket (Optional[WebSocket], optional): The websocket to send the response to. Defaults to None.
        timeout (int, optional): The timeout for the API request. Defaults to 180.
        temperature (float, optional): The temperature for the model. Defaults to 0.7.
        max_tokens (int, optional): The maximum number of tokens to generate. Defaults to 1000.

    Returns:
        dict: The response from the OpenAI API.
    """
    model_info = await validate_model(model)
    logger.info(f'Using validated model for chat completion: "{model_info.name}"')
    openaiClient = get_llm_client(client_type=model_info.client)

    if stream and websocket:
        async for chunk in await openaiClient.chat.completions.create(
            model=model_info.name,
            messages=messages,
            stream=True,
            timeout=timeout,
            max_tokens=max_tokens,
            temperature=temperature,
            **kwargs
        ):
            delta = chunk.choices[0].delta.content
            if delta:
                await websocket.send_text(delta)
        return {} # type: ignore

    response = await openaiClient.chat.completions.create(
        model=model,
        messages=messages,
        timeout=timeout,
        max_tokens=max_tokens,
        temperature=temperature,
        **kwargs
    )

    result = response.choices[0].message.content.strip()
    if result.startswith('```') and result.rstrip().endswith('```'):
        # print('Stripping code block markers from JSON response: ', result)
        result = '\n'.join(result.split('\n')[1:-1]).strip()
        # print('after stripping: ', result)
    if result.startswith('{') and result.endswith('}'):
        try:
            result = json.loads(result)
            # result = json.loads(result)
        except Exception as e:
            print('Error parsing JSON:', e)
    
    return ChatResponse(
        response=result,
        model=model_info.name,
        usage=response.usage.dict() if response.usage else None
    )
