import os
import io
import pymupdf
import pytesseract
from pdf2image import convert_from_path, convert_from_bytes
from app.schemas.llm import PDFResult

def extract_text_from_pdf(filename: str | None = None, stream: io.BytesIO | None=None, **kwargs) -> list[str]:
    """Extract text from a PDF file using PyMuPDF."""
    with pymupdf.open(filename=filename, stream=stream, **kwargs) as doc:
        pages = [page.get_text() for page in doc.pages()]
    return pages

def extract_images_from_pdf(filename: str | None = None, stream: io.BytesIO | None=None, **kwargs) -> list:
    """Extract images from a PDF file using PyMuPDF."""
    images = []
    with pymupdf.open(filename) as doc:
        for page in doc.pages():
            for img in page.get_images(full=True):
                xref = img[0]
                base_image = doc.extract_image(xref)
                images.append(base_image["image"])
    return images

def extract_metadata_from_pdf(filename: str | None = None, stream: io.BytesIO | None=None, **kwargs):
    """Extract metadata from a PDF file using PyMuPDF."""
    with pymupdf.open(filename) as doc:
        metadata = doc.metadata
    print('metadata:', metadata)
    return metadata or {}

def is_scanned_pdf(filename: str | None = None, stream: io.BytesIO | None=None, **kwargs) -> bool:
    """Check if a PDF is scanned (i.e., contains no text)."""
    text = extract_text_from_pdf(filename, stream, **kwargs)
    if all(not page.strip() for page in text):
        return True
    return False

def ocr_pdf(filename: str | None = None, stream: io.BytesIO | None=None, **kwargs) -> list[str]:
    """Perform OCR on a scanned PDF and extract text."""
    if filename is None and stream is None:
        raise ValueError("Either filename or stream must be provided.")
    pages: list[str] = []
    if filename:
        images = convert_from_path(filename, **kwargs)
    elif stream:
        images = convert_from_bytes(stream.read(), **kwargs)
        pages = [pytesseract.image_to_string(image) for image in images]
    return pages

def get_pdf_text(filename: str | None = None, stream: io.BytesIO | None=None, **kwargs) -> list[str]:
    """Get text from a PDF, using OCR if it's scanned."""
    if is_scanned_pdf(filename, stream, **kwargs):
        return ocr_pdf(filename, stream, **kwargs)
    else:
        return extract_text_from_pdf(filename, stream, **kwargs)
    
def parse_pdf(filename: str | None = None, stream: io.BytesIO | None=None, **kwargs) -> PDFResult:
    """Parse a PDF and return a structured PDFResult."""
    text_pages = get_pdf_text(filename, stream, **kwargs)
    metadata = extract_metadata_from_pdf(filename, stream, **kwargs)
    scanned = is_scanned_pdf(filename, stream, **kwargs)
    images = []
    
    if scanned:
        ocr_pages = ocr_pdf(filename, stream, **kwargs)
        text_pages = ocr_pages  # Replace text pages with OCR results if scanned
    else:
        images = extract_images_from_pdf(filename, stream, **kwargs)

    filename_only = os.path.basename(filename) if filename else None
    if not filename_only: 
        if stream and hasattr(stream, 'name'):
            filename_only = os.path.basename(stream.name)

    return PDFResult(
        file_name=filename_only,
        num_pages=len(text_pages),
        num_images=len(images),
        metadata=metadata, # type: ignore
        scanned=scanned,
        content=text_pages
    )
        
