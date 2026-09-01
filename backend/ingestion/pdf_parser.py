import os
from typing import List, Dict, Any

def extract_text_from_pdf(pdf_path: str) -> List[Dict[str, Any]]:
    """Extract text from a BIS standard PDF using pypdf."""
    pages = []
    try:
        from pypdf import PdfReader
        reader = PdfReader(pdf_path)
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text and len(text.strip()) > 30:
                pages.append({
                    "page_number": i + 1,
                    "content": text.strip()
                })
    except Exception as e:
        print(f"[PDF Parser Notice] Error reading {pdf_path}: {e}")
    return pages

def parse_all_pdfs(pdf_directory: str) -> List[Dict[str, Any]]:
    """Parse all PDFs in a directory."""
    all_documents = []
    if not os.path.exists(pdf_directory):
        os.makedirs(pdf_directory, exist_ok=True)
        return all_documents
        
    for filename in os.listdir(pdf_directory):
        if filename.endswith('.pdf'):
            filepath = os.path.join(pdf_directory, filename)
            standard_id = filename.replace('.pdf', '')
            pages = extract_text_from_pdf(filepath)
            for page in pages:
                all_documents.append({
                    "standard_id": standard_id,
                    "page": str(page["page_number"]),
                    "content": page["content"],
                    "source_file": filename
                })
    return all_documents
