from app.schemas.survey import SurveyInfo, LegalDescriptionInfo
from app.utils.prompts import load_prompt_template
from app.utils.openai import run_chat_completion

# async def extract_legal_description(text: str, model="gpt-4o-mini"):
#     """Extract the legal description from the text."""
#     prompt = load_prompt_template('extractLegalDescription', text=text)
#     messages = [
#         {"role": "system", "content": prompt},
#     ]
#     result = await run_chat_completion(messages, model=model)
#     return LegalDescriptionInfo(**result.response)

async def extract_legal_description(paragraphs: str, model="gpt-4o-mini"):
    """Extract the legal description from the text."""
    prompt = load_prompt_template('extractLegalDescription', paragraphs=paragraphs)
    messages = [
        {"role": "system", "content": prompt},
    ]
    result = await run_chat_completion(messages, model=model)
    return LegalDescriptionInfo(**result.response)

async def get_survey_info(legalDescription: str, model="gpt-4o-mini") -> SurveyInfo:
    """Get structured survey information from a legal description using an LLM."""
    prompt = load_prompt_template('parseLegalDescription', legalDescription=legalDescription)
    messages = [
        {"role": "system", "content": prompt},
    ]
    result = await run_chat_completion(messages, model=model)
    return SurveyInfo(**result.response) # type: ignore