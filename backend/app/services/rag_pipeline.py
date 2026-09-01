import time
from typing import Dict, Any, Optional
from app.services.retriever import retrieve_documents
from app.services.generator import generate_answer
from app.services.translator import detect_and_translate, translate_to_target
from app.services.confidence import calculate_confidence
from app.services.cache import query_cache
from app.services.audit import log_query
from app.services.product_matcher import match_product_to_standards
from app.services.compliance_engine import evaluate_compliance

def get_low_confidence_message(lang: str) -> str:
    messages = {
        "en": "**Insufficient reliable BIS evidence to answer this question accurately.**\n\n- **Database Scope:** 14 core Indian Standards indexed.\n- **Missing Information:** The query did not match any indexed standard scope, product category, or test clause.\n- **Recommended Action:** Please verify with the Bureau of Indian Standards Helpline at 1800-11-4000 or visit www.manakonline.in.",
        "hi": "**इस प्रश्न का सटीक उत्तर देने के लिए आधिकारिक BIS रिकॉर्ड्स में पर्याप्त जानकारी नहीं है।**\n\n- **डेटाबेस कवरेज:** 14 मुख्य भारतीय मानक इंडेक्स्ड हैं।\n- **अनुशंसित कार्रवाई:** कृपया BIS राष्ट्रीय हेल्पलाइन 1800-11-4000 पर संपर्क करें या www.manakonline.in पर देखें।"
    }
    return messages.get(lang, messages["en"])

async def process_query(
    query: str,
    mode: str = "simple",
    language: str = "auto",
    sector: Optional[str] = None,
    session_id: Optional[str] = None
) -> Dict[str, Any]:
    start_time = time.time()
    
    # Step 1: Check cache
    cached = query_cache.get(query, mode=mode, language=language, sector=sector)
    if cached:
        cached_copy = dict(cached)
        cached_copy["processing_time"] = round(time.time() - start_time, 3)
        return cached_copy
    
    # Step 2: Language detection & translation
    detected_lang, english_query = await detect_and_translate(query, target_lang=language)
    effective_lang = detected_lang if language == "auto" else language
    
    # Step 3: Retrieve relevant BIS document chunks
    retrieved_chunks = await retrieve_documents(
        query=english_query,
        sector=sector
    )
    
    # Step 4: Calculate confidence score
    confidence_float = calculate_confidence(retrieved_chunks)
    
    # Step 5: Handle low confidence / non-BIS question
    if confidence_float < 0.20 or not retrieved_chunks:
        response = {
            "answer": get_low_confidence_message(effective_lang),
            "confidence": round(confidence_float * 100),
            "compliance_readiness": 0,
            "citations": [],
            "language": effective_lang,
            "mode": mode,
            "processing_time": round(time.time() - start_time, 2),
            "session_id": session_id or "session-1",
            "product_profile": None,
            "applicable_standards": [],
            "compliance_matrix": [],
            "next_best_action": "Verify directly with BIS National Helpline at 1800-11-4000."
        }
        log_query(query, response, "low_confidence", session_id=session_id)
        return response
    
    # Step 6: Generate grounded answer with citations & compliance evaluation
    answer, citations, comp_data = await generate_answer(
        query=query,
        context_chunks=retrieved_chunks,
        mode=mode
    )
    
    # Step 7: Translate answer back if needed
    if effective_lang != "en" and effective_lang != "hi":
        answer = await translate_to_target(answer, effective_lang)
    
    # Step 8: Build complete V2 response
    prod_data = match_product_to_standards(query)
    
    response = {
        "answer": answer,
        "confidence": round(confidence_float * 100),
        "compliance_readiness": comp_data.get("compliance_readiness_score", 60),
        "citations": citations,
        "language": effective_lang,
        "mode": mode,
        "processing_time": round(time.time() - start_time, 2),
        "session_id": session_id or "session-1",
        "product_profile": prod_data.get("product_profile"),
        "applicable_standards": prod_data.get("applicable_standards", []),
        "compliance_matrix": comp_data.get("matrix", []),
        "next_best_action": comp_data.get("next_best_action")
    }
    
    # Step 9: Cache & log
    query_cache.set(query, response, mode=mode, language=language, sector=sector)
    log_query(query, response, "success", session_id=session_id)
    
    return response
