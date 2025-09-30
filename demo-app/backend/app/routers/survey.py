import io
from typing import Annotated
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from app.utils.logging import logging
from app.schemas.survey import GetSurveyRequest, SurveyInfo
from app.schemas.survey import LegalDescriptionInfo
from app.utils.pdf_parser import parse_pdf, make_paragraphs_text
from app.utils.survey import get_survey_info, extract_legal_description

survey_api = APIRouter(prefix="/survey", tags=["survey"])

# simple in-memory cache for survey info
# for production, consider using Redis or an actual caching solution
survey_cache: dict[str, dict[str, LegalDescriptionInfo | SurveyInfo]] = {}  

@survey_api.post('/extract-legal-descriptions', response_model=LegalDescriptionInfo)
async def get_legal_description_from_survey_file(file: Annotated[UploadFile, File(...)]):
    """get structured survey information from a legal description."""
    filename = file.filename
    if file.filename and file.filename in survey_cache:
        print(f'Using cached survey info for "{file.filename}"')
        legal = survey_cache[file.filename].get('legalDescription')
        if legal:
            
            return legal
    
    contents = await file.read()
    parsed = parse_pdf(io.BytesIO(contents), filename=filename)
    # print('Parsed PDF content:', '\n'.join(parsed.content))
    legalRes = await extract_legal_description('/n'.join(parsed.content))
    if filename:
        survey_cache[filename] = dict(legal=legalRes)
        print(f'Caching survey info for "{file.filename}"')
    return legalRes

@survey_api.post("/get-survey-info", response_model=SurveyInfo)
async def get_survey_info_from_legal(request: GetSurveyRequest):
    """get structured survey information from a legal description."""
    legal_description = request.legalDescription
    survey_info = await get_survey_info(legal_description)
    return survey_info