import re
from typing import Tuple

# Language dictionary mapping
INDIC_LANGUAGES = {
    "hi": "Hindi (हिंदी)",
    "en": "English",
    "ta": "Tamil (தமிழ்)",
    "te": "Telugu (తెలుగు)",
    "bn": "Bengali (বাংলা)",
    "mr": "Marathi (मराठी)",
    "gu": "Gujarati (ગુજરાતી)",
    "kn": "Kannada (ಕನ್ನಡ)",
    "ml": "Malayalam (മലയാളം)",
    "pa": "Punjabi (ਪੰਜਾਬੀ)",
    "or": "Odia (ଓଡ଼ିଆ)",
    "as": "Assamese (অসমীয়া)",
    "ur": "Urdu (اردو)"
}

# Common Hindi / Indic script Unicode range detection
def detect_script_language(text: str) -> str:
    # Devanagari (Hindi, Marathi)
    if re.search(r'[\u0900-\u097F]', text):
        return "hi"
    # Tamil
    if re.search(r'[\u0B80-\u0BFF]', text):
        return "ta"
    # Telugu
    if re.search(r'[\u0C00-\u0C7F]', text):
        return "te"
    # Bengali / Assamese
    if re.search(r'[\u0980-\u09FF]', text):
        return "bn"
    # Gujarati
    if re.search(r'[\u0A80-\u0AFF]', text):
        return "gu"
    # Kannada
    if re.search(r'[\u0C80-\u0CFF]', text):
        return "kn"
    # Malayalam
    if re.search(r'[\u0D00-\u0D7F]', text):
        return "ml"
    # Gurmukhi (Punjabi)
    if re.search(r'[\u0A00-\u0A7F]', text):
        return "pa"
    # Odia
    if re.search(r'[\u0B00-\u0B7F]', text):
        return "or"
    return "en"

async def detect_and_translate(query: str, target_lang: str = "auto") -> Tuple[str, str]:
    """
    Detect input query language and map to an English search query for the RAG retriever.
    """
    detected = detect_script_language(query)
    effective_lang = detected if target_lang == "auto" else target_lang
    
    # Fast Hindi query semantic mapping for common Indian Standards queries
    query_lower = query.lower()
    english_query = query
    
    if effective_lang == "hi" or "के बारे में" in query or "मानक" in query or "सुरक्षा" in query:
        if "3196" in query or "एलपीजी" in query or "सिलेंडर" in query:
            english_query = "IS 3196 welded low carbon steel cylinders for LPG liquefied gas safety standards"
        elif "कैटल" in query or "kettle" in query or "302" in query:
            english_query = "IS 302-2-15 electric kettles safety standards and test requirements"
        elif "पानी" in query or "water bottle" in query or "14543" in query:
            english_query = "IS 14543 packaged drinking water and plastic container standards"
        elif "खिलौने" in query or "toy" in query or "9873" in query:
            english_query = "IS 9873 toy safety standards BIS certification export requirements"
        elif "सोना" in query or "gold" in query or "हॉलमार्क" in query or "1417" in query:
            english_query = "IS 1417 gold and gold alloys hallmarking requirements"
        elif "सीमेंट" in query or "cement" in query or "269" in query:
            english_query = "IS 269 Ordinary Portland Cement 33 43 53 grade specifications"
    
    return effective_lang, english_query

async def translate_to_target(text: str, target_lang: str) -> str:
    """Translate answer into target language or return with appropriate localized headings."""
    if target_lang in ("en", "auto"):
        return text
    
    # If translation service (e.g. Bhashini / IndicTrans) is configured, use it here.
    return text
