import os
import io
import re
import pdfplumber
import pytesseract
from typing import Optional
from pdf2image import convert_from_path, convert_from_bytes
from app.schemas.llm import PDFResult

def split_into_paragraphs(text: str) -> list[str]:
    """
    Split text into candidate blocks for LLM classification.
    Uses double newlines or long line breaks as separators.
    """
    # Normalize newlines
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Split on two or more newlines (likely a paragraph break)
    paragraphs = re.split(r"\n{2,}", text)

    # Clean each chunk
    paragraphs = [p.strip() for p in paragraphs if p.strip()]

    return paragraphs

def make_paragraphs_text(text_content: str) -> str:
    """Create a numbered list of paragraphs for LLM input."""
    paragraphs = split_into_paragraphs(text_content)
    return "\n\n".join([f"{i+1}. {p}" for i, p in enumerate(paragraphs)])

def clean_pdf_text(text: str) -> str:
    # Remove non-printable characters
    text = re.sub(r"[^\x09\x0A\x0D\x20-\x7E]", " ", text)
    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def extract_text_from_pdf(filepath_or_obj: str | io.BytesIO, clean=True) -> list[str]:
    """Extract text from a PDF file (BytesIO or file-like).
    
    Args:
        filepath_or_obj (str | io.BytesIO): The file path or file-like object of the PDF.
        clean (bool, optional): Whether to clean the extracted text. Defaults to True

    Returns:
        list[str]: A list of text strings, one per page.
    """
    pages = []
    with pdfplumber.open(filepath_or_obj) as pdf:
        for page in pdf.pages:
            text = page.extract_text(x_tolerance=2, y_tolerance=2) or ""
            pages.append(clean_pdf_text(text) if clean else text)
    return pages

def is_scanned_pdf(filepath_or_obj: str | io.BytesIO, **kwargs) -> bool:
    """Check if a PDF is scanned (i.e., contains no text)."""
    text = extract_text_from_pdf(filepath_or_obj, **kwargs)
    if all(not page.strip() for page in text):
        return True
    return False

def ocr_pdf(filepath_or_obj: str | io.BytesIO, clean=True, **kwargs) -> list[str]:
    """Perform OCR on a scanned PDF and extract text."""
    pages: list[str] = []
    if isinstance(filepath_or_obj, str):
        images = convert_from_path(filepath_or_obj, **kwargs)
    else:
        if isinstance(filepath_or_obj, io.BytesIO):
            filepath_or_obj.seek(0) # ensure file pointer for OCR is reset to beginning
        images = convert_from_bytes(filepath_or_obj.read(), **kwargs)
        cleaner = clean_pdf_text if clean else lambda text: text.strip()
        pages = [cleaner(pytesseract.image_to_string(image)) for image in images]
    return pages

def get_pdf_text(filepath_or_obj: str | io.BytesIO, **kwargs) -> list[str]:
    """Get text from a PDF, using OCR if it's scanned."""
    if is_scanned_pdf(filepath_or_obj, **kwargs):
        return ocr_pdf(filepath_or_obj, **kwargs)
    else:
        return extract_text_from_pdf(filepath_or_obj, **kwargs)
    
def parse_pdf(filepath_or_obj: str | io.BytesIO, filename: Optional[str]=None, **kwargs) -> PDFResult:
    """Parse a PDF and return a structured PDFResult."""
    text_pages = get_pdf_text(filepath_or_obj, **kwargs)
    metadata = {} # todo: extract metadata if needed
    scanned = is_scanned_pdf(filepath_or_obj, **kwargs)
    images = []
    
    if scanned:
        ocr_pages = ocr_pdf(filepath_or_obj, **kwargs)
        text_pages = ocr_pages  # Replace text pages with OCR results if scanned
    else:
        images = [] # todo: extract images if needed

    filename_only = os.path.basename(filename) if filename else None
    if not filename_only: 
        if isinstance(filepath_or_obj, io.BytesIO) and hasattr(filepath_or_obj, 'name'):
            filename_only = os.path.basename(filepath_or_obj.name)

    return PDFResult(
        file_name=filename_only,
        num_pages=len(text_pages),
        num_images=len(images),
        metadata=metadata, # type: ignore
        scanned=scanned,
        content=text_pages
    )
        
