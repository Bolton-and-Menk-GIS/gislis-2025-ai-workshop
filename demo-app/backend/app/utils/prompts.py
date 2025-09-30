import os
from app.utils.logging import logger
from typing import Optional

default_prompt_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'prompts'))

def load_prompt_template(name: str='ask', template_path: Optional[str]=default_prompt_path, ext: Optional[str]='md', context: Optional[dict]=None, skip_formatting: bool=False, **kwargs) -> str:
    """Load a prompt template from a file.

    Args:
        name (str): The name of the prompt template file (without extension).
        template_path (str): The path to the prompt template file.
        ext (str): The file extension of the prompt template file.
        skip_formatting (bool): If True, do not format the template with context and kwargs.
        **kwargs: Additional keyword arguments to format the template.
    Returns:
        str: The content of the prompt template.
    """
    template_file = os.path.join(template_path, f'{name}.{ext}')
    if not os.path.exists(template_file):
        template_file = os.path.join(template_path, 'ask.md')
    with open(template_file, 'r') as file:
        prompt = file.read().format(context=context, **kwargs) if not skip_formatting else file.read()
    logger.info(f'Loaded prompt template {os.path.basename(template_file)}, prompt is:\n\n{prompt}\n\n')
    return prompt