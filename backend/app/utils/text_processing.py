import re
from typing import List, Dict, Any

def clean_text(text: str) -> str:
    """Normalize whitespace and remove unwanted control characters."""
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[\r\n\t]+', ' ', text)
    return text.strip()

def extract_is_codes(text: str) -> List[str]:
    """Extract Indian Standard codes like IS 302, IS 3196, IS 14543:2004 from text."""
    pattern = r'\bIS\s*(?:[A-Z/]*\s*)?\d+(?:\s*(?:Part|Pt|\(Part\s*\d+\))?\s*\d*)?(?:[-–]\d+)*(?::\d{4})?\b'
    matches = re.findall(pattern, text, re.IGNORECASE)
    cleaned = []
    for m in matches:
        norm = re.sub(r'\s+', ' ', m).strip().upper()
        if norm not in cleaned:
            cleaned.append(norm)
    return cleaned

def format_bilingual_snippet(snippet: str, max_len: int = 200) -> str:
    """Trim snippet cleanly with ellipsis."""
    if len(snippet) <= max_len:
        return snippet
    return snippet[:max_len].rsplit(' ', 1)[0] + "..."
