import io
from fastapi import APIRouter, File, UploadFile
from typing import Annotated
from app.schemas.llm import PDFResult
from app.utils.pdf_parser import parse_pdf, extract_text_from_pdf

pdf_api = APIRouter(prefix="/pdf", tags=["pdf"])

@pdf_api.post("/parse", response_model=PDFResult)
async def parse_pdf_endpoint(file: Annotated[UploadFile, File(...)]) -> PDFResult:
    contents = await file.read()
    # print('contents type:', contents)
    result = parse_pdf(io.BytesIO(contents))
    if not result.file_name:
        result.file_name = file.filename if hasattr(file, 'filename') else None
    return result