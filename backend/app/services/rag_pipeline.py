import re
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

def is_bis_question(query: str, english_query: str, retrieved_chunks: list, prod_data: dict) -> bool:
    """Determines whether a query is a BIS compliance question or a general conversation query."""
    combined = f"{query} {english_query}".lower().strip()
    
    # Pure conversational chit-chat, small talk, general questions
    if re.match(r'^(hi|hello|hey|namaste|kem cho|vanakkam|good\s*(morning|evening|afternoon)|who are you|what is your name|how are you|how is your day|tell me a joke|write a poem|write code|who won|what is the capital|explain quantum|weather|test|ping|help)[\s!.]*$', combined):
        return False
        
    # Explicit BIS compliance keywords
    bis_keywords = [
        "bis", "bureau of indian standards", "indian standard", "indian standards", "is code", "isi", "cml",
        "hsn", "hsn code", "sac code", "qco", "quality control order", "hallmark", "huid", "crs", "fmcs", "scheme-i",
        "scheme-iv", "manak", "manakonline", "nabl", "testing clause", "bursting pressure",
        "statutory requirement", "compliance readiness", "sti", "certification", "license",
        "compliance", "standard", "standards", "safety standard", "safety standards", "gazette", "testing requirement"
    ]
    if any(re.search(rf'\b{re.escape(kw)}\b', combined) for kw in bis_keywords):
        return True
        
    # Standard code format: "IS 2347", "IS 302", "IS10500", "IS 17803", etc.
    if re.search(r'\bis\s*\d{3,5}\b', combined):
        return True
        
    # Compliance question keywords often paired with products
    compliance_verbs = ["manufacture", "export", "import", "sell", "require", "mandatory", "regulation", "rule", "test", "clause", "specification", "conformance", "certificate", "safety", "apply"]
    has_compliance_context = any(re.search(rf'\b{re.escape(v)}\b', combined) for v in compliance_verbs)

    # Recognized regulated products in BIS registry
    prod_profile = prod_data.get("product_profile") or {}
    if prod_data.get("applicable_standards") and has_compliance_context:
        return True
        
    # High-relevance retrieved chunks from Indian Standards database
    if retrieved_chunks and any(c.get("relevance_score", 0) >= 0.50 for c in retrieved_chunks) and has_compliance_context:
        return True
        
    # Standard regulated product categories under mandatory BIS QCOs with compliance context
    regulated_products = [
        "pressure cooker", "water heater", "geyser", "drinking water", "vacuum flask", "water bottle",
        "lpg cylinder", "cement", "structural steel", "safety helmet", "electric iron",
        "socket", "plug", "cables", "plywood", "kettle", "electric kettle"
    ]
    if has_compliance_context and any(p in combined for p in regulated_products):
        return True
        
    return False

from app.models.database import save_chat_message, get_chat_history

async def process_query(
    query: str,
    mode: str = "simple",
    language: str = "auto",
    sector: Optional[str] = None,
    session_id: Optional[str] = None,
    history: Optional[list] = None
) -> Dict[str, Any]:
    start_time = time.time()
    
    # Retrieve multi-turn conversation history
    effective_history = list(history) if history else []
    if not effective_history and session_id:
        effective_history = get_chat_history(session_id, limit=8)
    
    # Step 1: Check cache only for first-turn queries without conversation context
    if not effective_history:
        cached = query_cache.get(query, mode=mode, language=language, sector=sector)
        if cached and "Target Product: Hello" not in cached.get("answer", "") and "Switched Socket-Outlets" not in cached.get("answer", ""):
            cached_copy = dict(cached)
            cached_copy["processing_time"] = round(time.time() - start_time, 3)
            return cached_copy
    
    # Step 2: Language detection & translation
    detected_lang, english_query = await detect_and_translate(query, target_lang=language)
    effective_lang = detected_lang if language == "auto" else language
    
    # Step 3: Check product matching and retrieve document chunks for potential RAG
    prod_data = match_product_to_standards(query)
    retrieved_chunks = await retrieve_documents(query=english_query, sector=sector)
    
    # Step 4: Determine routing:
    # - If mode is "gemini": answer via Gemini general-purpose LLM
    # - If mode is "rag": answer with BIS RAG model pipeline
    # - If mode is "auto" (or "simple"): smart classify between BIS compliance and general knowledge/coding
    if mode == "gemini":
        is_bis = False
    elif mode == "rag":
        is_bis = True
    else:
        is_bis = is_bis_question(query, english_query, retrieved_chunks, prod_data)
    
    if is_bis:
        # Use RAG with retrieved BIS evidence chunks & standards data
        answer, citations, comp_data = await generate_answer(
            query=query,
            context_chunks=retrieved_chunks,
            mode=mode,
            is_bis=True,
            history=effective_history
        )
        reported_confidence = comp_data.get("ai_confidence_score") or calculate_confidence(retrieved_chunks)
        product_profile = prod_data.get("product_profile")
        applicable_standards = prod_data.get("applicable_standards", [])
        compliance_matrix = comp_data.get("matrix", [])
        next_best_action = comp_data.get("next_best_action") or "Explore BIS standards and apply on Manakonline."
        effective_mode = "rag"
    else:
        # Direct Gemini general-purpose LLM reasoning for coding, math, science, and general chat
        answer, citations, comp_data = await generate_answer(
            query=query,
            context_chunks=[],
            mode=mode,
            is_bis=False,
            history=effective_history
        )
        reported_confidence = None
        product_profile = None
        applicable_standards = []
        compliance_matrix = []
        next_best_action = None
        effective_mode = "gemini" if mode == "gemini" else "general_llm"
    
    # Step 5: Translate answer back to user's target language using Bhashini if needed
    if effective_lang != "en":
        try:
            answer = await translate_to_target(answer, effective_lang)
        except Exception as te:
            print(f"[Pipeline Translation Note] {te}")
    
    # Step 6: Build structured response with actual data
    actual_readiness = comp_data.get("compliance_readiness_score", 0) if is_bis else 0
    response = {
        "answer": answer,
        "confidence": reported_confidence,
        "compliance_readiness": actual_readiness,
        "citations": citations,
        "language": effective_lang,
        "mode": effective_mode,
        "processing_time": round(time.time() - start_time, 2),
        "session_id": session_id or "session-1",
        "product_profile": product_profile,
        "applicable_standards": applicable_standards,
        "compliance_matrix": compliance_matrix,
        "next_best_action": next_best_action
    }
    
    # Step 7: Persist conversation turns and audit log
    if session_id:
        save_chat_message(session_id, "user", query)
        save_chat_message(session_id, "assistant", answer)

    query_cache.set(query, response, mode=mode, language=language, sector=sector)
    log_query(query, response, "success", session_id=session_id)
    
    return response

async def stream_process_query(
    query: str,
    mode: str = "simple",
    language: str = "auto",
    sector: Optional[str] = None,
    session_id: Optional[str] = None,
    history: Optional[list] = None
):
    """
    Streaming query processor:
    Determines query classification (general vs BIS), yields SSE data tokens in real-time as Gemini streams,
    and concludes with the complete done metadata matching frontend expectations.
    """
    import json
    start_time = time.time()
    effective_history = list(history) if history else []
    if not effective_history and session_id:
        effective_history = get_chat_history(session_id, limit=8)

    detected_lang, english_query = await detect_and_translate(query, target_lang=language)
    effective_lang = detected_lang if language == "auto" else language

    prod_data = match_product_to_standards(query)
    retrieved_chunks = await retrieve_documents(query=english_query, sector=sector)

    if mode == "gemini":
        is_bis = False
    elif mode == "rag":
        is_bis = True
    else:
        is_bis = is_bis_question(query, english_query, retrieved_chunks, prod_data)

    accumulated_chunks = []

    if is_bis:
        from app.services.generator import stream_rag_answer, extract_citations
        comp_data = evaluate_compliance(query=query)
        primary_std = (prod_data.get("applicable_standards") or [None])[0]

        async for token in stream_rag_answer(
            query=query,
            context_chunks=retrieved_chunks,
            mode=mode,
            history=effective_history
        ):
            accumulated_chunks.append(token)
            yield f"data: {json.dumps({'type': 'token', 'content': token, 'done': False})}\n\n"

        full_answer = "".join(accumulated_chunks)
        citations = extract_citations(full_answer, retrieved_chunks, primary_std=primary_std)
        reported_confidence = comp_data.get("ai_confidence_score") or calculate_confidence(retrieved_chunks)
        actual_readiness = comp_data.get("compliance_readiness_score", 0)
        effective_mode = "rag"
    else:
        from app.services.generator import stream_general_llm_answer
        async for token in stream_general_llm_answer(query=query, history=effective_history):
            accumulated_chunks.append(token)
            yield f"data: {json.dumps({'type': 'token', 'content': token, 'done': False})}\n\n"

        full_answer = "".join(accumulated_chunks)
        citations = []
        reported_confidence = None
        actual_readiness = 0
        effective_mode = "gemini" if mode == "gemini" else "general_llm"

    # Persist conversation turn in SQLite database
    if session_id:
        save_chat_message(session_id, "user", query)
        save_chat_message(session_id, "assistant", full_answer)

    processing_time = round(time.time() - start_time, 2)
    final_meta = {
        "type": "done",
        "confidence": reported_confidence,
        "compliance_readiness": actual_readiness,
        "citations": citations,
        "language": effective_lang,
        "mode": effective_mode,
        "processing_time": processing_time,
        "session_id": session_id or "session-1",
        "done": True
    }
    yield f"data: {json.dumps(final_meta)}\n\n"



