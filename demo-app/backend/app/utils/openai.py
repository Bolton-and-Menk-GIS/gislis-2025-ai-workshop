
import os
from fastapi import WebSocket
from datetime import datetime, timezone
from app.config import settings
from openai import AsyncOpenAI

from app.utils.models import validate_model, DEFAULT_OLLAMA_MODEL, DEFAULT_OPENAI_MODEL
from app.utils.logging import logger
from typing import List, Union, Literal, Optional
from app.schemas.llm import ClientType, ChatResponse


default_prompt_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'prompts'))

try:
    import orjson
except ImportError:  # pragma: nocover
    import json
    orjson = json  # type: ignore

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

def load_prompt_template(name: str='ask', template_path: str=default_prompt_path, ext: str='md', context: Optional[dict]=None, **kwargs) -> str:
    """Load a prompt template from a file.

    Args:
        name (str): The name of the prompt template file (without extension).
        template_path (str): The path to the prompt template file.
        ext (str): The file extension of the prompt template file.
        **kwargs: Additional keyword arguments to format the template.
    Returns:
        str: The content of the prompt template.
    """
    template_file = os.path.join(template_path, f'{name}.{ext}')
    if not os.path.exists(template_file):
        template_file = os.path.join(template_path, 'ask.md')
    with open(template_file, 'r') as file:
        prompt = file.read().format(context=context, **kwargs)
    logger.info(f'Loaded prompt template {os.path.basename(template_file)}, prompt is:\n\n{prompt}\n\n')
    return prompt

async def run_chat_completion(messages: list, model: str='gpt-3.5-turbo', stream=True, websocket: Optional[WebSocket]=None, max_tokens: Optional[int]=4096, timeout: Optional[int]=180, temperature: Optional[float]=0.7, **kwargs):
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
        return {}

    response = await openaiClient.chat.completions.create(
        model=model,
        messages=messages,
        timeout=timeout,
        max_tokens=max_tokens,
        temperature=temperature,
        **kwargs
    )

    result = response.choices[0].message.content.strip()
    if result.startswith('{') and result.endswith('}'):
        try:
            result = orjson.loads(result)
        except Exception as e:
            print('Error parsing JSON:', e)
    else:
        return ChatResponse(
            response=result,
            model=model_info.name,
            usage=response.usage.dict() if response.usage else None
        )
