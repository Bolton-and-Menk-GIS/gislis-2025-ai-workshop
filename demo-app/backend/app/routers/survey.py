from fastapi import APIRouter

survey_api = APIRouter(prefix="/survey", tags=["survey"])

@survey_api.post("/get-cogo-paths")
async def get_cogo_paths():
    return {"paths": []}