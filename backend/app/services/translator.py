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
    "ur": "Urdu (اردو)",
    "ne": "Nepali (नेपाली)",
    "sa": "Sanskrit (संस्कृतम्)",
    "kok": "Konkani (कोंकणी)",
    "mai": "Maithili (मैथिली)"
}

# Server-side in-memory translation cache: (target_lang, text) -> translated_text
SERVER_TRANSLATION_CACHE = {}

# Common Indic script Unicode range detection
def detect_script_language(text: str) -> str:
    # Devanagari (Hindi, Marathi, Nepali, Sanskrit, Konkani, Maithili)
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
    # Urdu / Arabic
    if re.search(r'[\u0600-\u06FF]', text):
        return "ur"
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

import asyncio
import logging
from app.config import settings

logger = logging.getLogger("bis_sahayak.translator")

def clean_gemini_translation(raw: str) -> str:
    """Strip any conversational preamble, intro or markdown fencing from Gemini translation."""
    if not raw:
        return ""
    text = raw.strip()
    # Strip markdown code blocks
    if text.startswith("```") and text.endswith("```"):
        lines = text.split("\n")
        text = "\n".join(lines[1:-1]).strip()
    # Strip common preambles like "Here is the translation:"
    preamble_pattern = r'^(here\s+(is|are)\s+the\s+translat[^\n:]*[:\n]+|translation[:\n]+)'
    text = re.sub(preamble_pattern, '', text, flags=re.IGNORECASE).strip()
    return text

async def translate_to_target(text: str, target_lang: str) -> str:
    """
    Translate text/batch into target language using ultra-fast gemini-flash-lite-latest
    with line-level and text-level in-memory caching.
    """
    if not text or target_lang in ("en", "auto"):
        return text
    
    clean_input = text.strip()
    cache_key = (target_lang, clean_input)
    if cache_key in SERVER_TRANSLATION_CACHE:
        return SERVER_TRANSLATION_CACHE[cache_key]

    # Check if text is already in the target script
    detected = detect_script_language(clean_input)
    if detected == target_lang and detected != "en":
        SERVER_TRANSLATION_CACHE[cache_key] = clean_input
        return clean_input

    # Multi-line batch optimization: check individual lines in cache
    if "\n" in clean_input:
        lines = clean_input.split("\n")
        missing_indices = []
        translated_lines = [None] * len(lines)
        
        for idx, line in enumerate(lines):
            l_strip = line.strip()
            if not l_strip:
                translated_lines[idx] = line
                continue
            line_key = (target_lang, l_strip)
            if line_key in SERVER_TRANSLATION_CACHE:
                translated_lines[idx] = line.replace(l_strip, SERVER_TRANSLATION_CACHE[line_key])
            else:
                missing_indices.append((idx, l_strip))

        if not missing_indices:
            assembled = "\n".join(translated_lines)
            SERVER_TRANSLATION_CACHE[cache_key] = assembled
            return assembled

    lang_name = INDIC_LANGUAGES.get(target_lang, target_lang)
    if settings.GEMINI_API_KEY:
        try:
            from google import genai
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            
            prompt = (
                f"Translate the following text into {lang_name} using authentic script.\n"
                f"CRITICAL RULES:\n"
                f"1. Return ONLY the translated text. Absolutely NO preamble, greeting, markdown code block, or explanation (e.g. NEVER say 'Here is the translation:').\n"
                f"2. Maintain line-by-line correspondence if the text has multiple lines.\n"
                f"3. Preserve all standard numbers (e.g. IS 2347:2017, IS 17803:2022), licence numbers (e.g. CM/L-7128394), and clause references verbatim in English/Roman characters.\n\n"
                f"{clean_input}"
            )
            
            # Use gemini-flash-lite-latest for millisecond responses, fallback to gemini-3.6-flash
            models_to_try = ["gemini-flash-lite-latest", settings.LLM_MODEL or "gemini-3.6-flash"]
            response_text = None
            
            for model_candidate in models_to_try:
                try:
                    response = await asyncio.to_thread(
                        client.models.generate_content,
                        model=model_candidate,
                        contents=prompt
                    )
                    if response and response.text:
                        response_text = clean_gemini_translation(response.text)
                        if response_text:
                            break
                except Exception as model_err:
                    logger.debug(f"Translation candidate {model_candidate} failed: {model_err}")
            
            if response_text:
                SERVER_TRANSLATION_CACHE[cache_key] = response_text
                # Also cache individual lines if multi-line
                if "\n" in clean_input and "\n" in response_text:
                    orig_l = clean_input.split("\n")
                    trans_l = response_text.split("\n")
                    if len(orig_l) == len(trans_l):
                        for ol, tl in zip(orig_l, trans_l):
                            if ol.strip() and tl.strip():
                                SERVER_TRANSLATION_CACHE[(target_lang, ol.strip())] = tl.strip()
                return response_text

        except Exception as e:
            logger.warning(f"Translation to {target_lang} fallback error: {e}")
    return text
