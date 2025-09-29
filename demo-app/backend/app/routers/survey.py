import io
from typing import Annotated
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from app.schemas.survey import GetSurveyRequest, SurveyInfo
from app.schemas.survey import LegalDescriptionInfo
from app.utils.pdf_parser import parse_pdf, make_paragraphs_text
from app.utils.survey import get_survey_info, extract_legal_description

survey_api = APIRouter(prefix="/survey", tags=["survey"])

@survey_api.post('/extract-legal-descriptions', response_model=LegalDescriptionInfo)
async def get_legal_description_from_survey_file(file: Annotated[UploadFile, File(...)]):
    """get structured survey information from a legal description."""
    contents = await file.read()
    parsed = parse_pdf(io.BytesIO(contents), filename=file.filename)
    # print('Parsed PDF content:', '\n'.join(parsed.content))
    legalRes = await extract_legal_description('/n'.join(parsed.content))
    return legalRes

@survey_api.post("/get-survey-info", response_model=SurveyInfo)
async def get_survey_info_from_legal(request: GetSurveyRequest):
    """get structured survey information from a legal description."""
    legal_description = request.legalDescription
    survey_info = await get_survey_info(legal_description)
    return survey_info