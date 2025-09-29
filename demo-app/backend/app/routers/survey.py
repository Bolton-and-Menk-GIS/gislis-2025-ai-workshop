from fastapi import APIRouter
from app.schemas.survey import GetSurveyRequest, SurveyInfo
from app.utils.survey import get_survey_info

survey_api = APIRouter(prefix="/survey", tags=["survey"])

@survey_api.post("/get-survey-info", response_model=SurveyInfo)
async def get_survey_info_from_legal(request: GetSurveyRequest):
    """get structured survey information from a legal description."""
    legal_description = request.legalDescription
    survey_info = await get_survey_info(legal_description)
    return survey_info