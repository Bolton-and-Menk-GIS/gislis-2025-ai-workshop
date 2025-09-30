from typing import Literal, Optional
from pydantic import BaseModel

AskPromptType = Literal['ask', 'simple', 'professor', 'contrarian', 'sassy']

class AskPromptOption(BaseModel):
    name: AskPromptType = 'ask'
    label: str
    description: Optional[str] = None

class AskPromptOptions(BaseModel):
    options: list[AskPromptOption] = [
        AskPromptOption(
            name='ask',
            label='Standard',
            description='A straightforward, concise answer based on the provided context or general knowledge.'
        ),
        AskPromptOption(
            name='simple',
            label="Explain like I'm 5",
            description='A simplified answer that is easy to understand, as if explaining to a child.'
        ),
        AskPromptOption(
            name='professor',
            label='Professor',
            description='A detailed, in-depth explanation with background information and examples, as if you were a knowledgeable professor.'
        ),
        AskPromptOption(
            name='contrarian',
            label='Contrarian',
            description='A response that challenges common assumptions and encourages critical thinking by presenting alternative viewpoints.'
        ),
        AskPromptOption(
            name='sassy',
            label='Sassy',
            description="A cheeky, humorous answer that doesn’t hold back on wit and sarcasm, making the interaction entertaining."
        )
    ]