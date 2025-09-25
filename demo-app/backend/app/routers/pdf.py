import io
from fastapi import APIRouter, File, UploadFile
from typing import Annotated
from app.schemas import PDFResult
from app.utils.pdf_parser import parse_pdf

pdf_api = APIRouter(prefix="/pdf", tags=["pdf"])

@pdf_api.post("/parse", response_model=PDFResult)
async def parse_pdf_endpoint(file: Annotated[UploadFile, File(...)]) -> PDFResult:
    # Placeholder implementation for PDF parsing
    # In a real implementation, you would parse the PDF file at file_path
    # and extract relevant information.
    contents = await file.read()
    # print('contents type:', contents)
    result = parse_pdf(stream=io.BytesIO(contents))
    if not result.file_name:
        result.file_name = file.filename if hasattr(file, 'filename') else None
    return result