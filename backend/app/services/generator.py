import os
import re
import json
import asyncio
import logging
from typing import List, Dict, Any, Tuple, Optional
from app.config import settings
from app.services.product_matcher import match_product_to_standards
from app.services.compliance_engine import evaluate_compliance

logger = logging.getLogger("bis_sahayak.generator")

GENERAL_SYSTEM_INSTRUCTION = (
    "You are BIS Sahayak, an intelligent, helpful, and highly versatile general-purpose AI assistant powered by Google Gemini.\n\n"
    "CAPABILITIES:\n"
    "You can answer ANY question across all subjects, disciplines, and formats with excellence:\n"
    "- Programming & Software Development: Write clean, modular, production-ready code with syntax highlighting, fix bugs, explain architectures, and suggest optimizations in any language (Python, JavaScript, TypeScript, C++, Rust, Go, SQL, HTML/CSS, etc.).\n"
    "- Mathematics & Calculations: Provide step-by-step proofs, algebra, calculus, discrete math, statistics, and clear numerical solutions.\n"
    "- Science, Engineering & Technology: Explain physics, chemistry, biology, electrical/mechanical engineering, AI/ML, and computing concepts clearly.\n"
    "- Everyday Conversation & Reasoning: Chat naturally, politely, and engage in logical dialogue and problem solving.\n"
    "- Writing & Communication: Draft emails, essays, summaries, documentation, technical specs, and creative content.\n"
    "- Bureau of Indian Standards (BIS) & Statutory Compliance: When users ask about Indian Standards (IS codes), Quality Control Orders (QCOs), ISI/CML certification, or statutory compliance, provide authoritative, accurate guidance.\n\n"
    "RESPONSE GUIDELINES:\n"
    "1. Give direct, comprehensive, and helpful answers formatted in clean GitHub-flavored Markdown.\n"
    "2. For general questions (coding, science, math, chat), answer directly like a modern state-of-the-art LLM. DO NOT inject unwanted BIS disclaimers or force standards onto unrelated questions.\n"
    "3. Maintain context across conversation history so follow-up queries feel cohesive and natural.\n"
    "4. Never hallucinate or invent Indian Standards, legal mandates, or false citations."
)

BIS_RAG_SYSTEM_INSTRUCTION = (
    "You are BIS Sahayak (बीआईएस सहायक), the official AI compliance navigator for the Bureau of Indian Standards (BIS), Ministry of Consumer Affairs, Food & Public Distribution, Government of India.\n\n"
    "Your objective is to provide authoritative, grounded, evidence-first answers on Indian Standards (IS codes), Quality Control Orders (QCOs), testing requirements, and certification schemes.\n\n"
    "CRITICAL GROUNDING & ACCURACY RULES:\n"
    "1. Base your answer strictly on the provided verified BIS context and official standard catalog evidence. NEVER extrapolate, fabricate, or invent IS standard numbers, clauses, test limits, or page numbers.\n"
    "2. When citing verified clauses, cite in the exact format [Source: IS XXXX, Clause X, Page X] only if confirmed in the context.\n"
    "3. Report actual compliance readiness figures and requirement metrics provided by the compliance engine.\n"
    "4. Maintain conversational context from previous turns if the user asks follow-up compliance questions.\n"
    "5. Structure your response with clean markdown headings:\n"
    "   - 1. Product Identification & Applicable Indian Standard(s)\n"
    "   - 2. Scope & Regulatory Mandate (Quality Control Orders)\n"
    "   - 3. Statutory Requirements & Mandatory Testing\n"
    "   - 4. Compliance Readiness Assessment\n"
    "   - 5. Recommended Next Best Action"
)

INDIC_LANGUAGES_MAP = {
    "hi": ("Hindi", "हिंदी", "Devanagari"),
    "ta": ("Tamil", "தமிழ்", "Tamil"),
    "te": ("Telugu", "తెలుగు", "Telugu"),
    "bn": ("Bengali", "বাংলা", "Bengali"),
    "mr": ("Marathi", "मराठी", "Devanagari"),
    "gu": ("Gujarati", "ગુજરાતી", "Gujarati"),
    "kn": ("Kannada", "ಕನ್ನಡ", "Kannada"),
    "ml": ("Malayalam", "മലയാളം", "Malayalam"),
    "pa": ("Punjabi", "ਪੰਜਾਬੀ", "Gurmukhi"),
    "or": ("Odia", "ଓଡ଼ିଆ", "Odia"),
    "as": ("Assamese", "অসমীয়া", "Assamese"),
    "ur": ("Urdu", "اردو", "Urdu"),
    "ne": ("Nepali", "नेपाली", "Devanagari"),
    "sa": ("Sanskrit", "संस्कृतम्", "Devanagari"),
    "kok": ("Konkani", "कोंकणी", "Devanagari"),
    "mai": ("Maithili", "मैथिली", "Devanagari"),
    "en": ("English", "English", "Latin")
}

def get_target_language_instruction(target_language: str) -> str:
    """
    Build strong language directive for Google Gemini and other LLMs.
    Guarantees that if user selects Hindi, Tamil, Telugu, etc., Gemini responds
    in that exact language and script, even if the user message was typed in English.
    """
    if not target_language or target_language.lower() in ("en", "auto"):
        return ""
    
    lang_info = INDIC_LANGUAGES_MAP.get(target_language.lower())
    if not lang_info:
        return ""
    
    eng_name, native_name, script = lang_info
    return (
        f"\n\n========================================\n"
        f"🚨 MANDATORY LANGUAGE DIRECTIVE:\n"
        f"The user has actively selected {eng_name} ({native_name}) as their interface and response language.\n"
        f"EVEN IF the user's message is written entirely in English, you MUST generate your ENTIRE response in {eng_name} ({native_name}) using authentic {script} script.\n"
        f"DO NOT generate the response in English.\n"
        f"STRICT EXCEPTIONS TO LEAVE IN ENGLISH/LATIN SCRIPT:\n"
        f"- Standard designations: e.g., 'IS 2347:2017', 'IS 17803:2022', 'IS 302-2-15'\n"
        f"- Licence and clause IDs: e.g., 'CM/L-7128394', 'Clause 4.1', 'Clause 6.1'\n"
        f"- Official portals and terms: e.g., 'www.manakonline.in', 'NABL', 'QCO', 'BIS'\n"
        f"All other sentences, explanations, bullet points, recommendations, and analysis MUST be written fluently and idiomatically in {native_name}.\n"
        f"========================================\n"
    )

def _build_gemini_contents(
    query: str,
    history: Optional[List[Dict[str, Any]]] = None,
    context_prefix: Optional[str] = None
) -> List[Any]:
    """
    Build multi-turn conversation contents for Google GenAI SDK.
    Strictly alternates user and model turns, merges consecutive same-role turns,
    and ensures the first and final turns are 'user' turns for Gemini API compliance.
    """
    from google.genai import types
    raw_turns = []

    # 1. Format previous turns for conversation memory
    if history:
        for msg in history:
            text = (msg.get("content") or msg.get("text") or "").strip()
            if not text:
                continue
            role = "model" if msg.get("role") in ["assistant", "model"] else "user"
            raw_turns.append((role, text))

    current_text = f"{context_prefix}\n\nUser Question: {query}" if context_prefix else query
    raw_turns.append(("user", current_text.strip()))

    # Clean and alternate turns for Gemini API compliance
    merged_turns = []
    for role, text in raw_turns:
        if not merged_turns:
            if role == "model":
                # Skip model turn if it comes before the first user turn
                continue
            merged_turns.append({"role": role, "texts": [text]})
        else:
            prev = merged_turns[-1]
            if prev["role"] == role:
                prev["texts"].append(text)
            else:
                merged_turns.append({"role": role, "texts": [text]})

    if not merged_turns:
        merged_turns = [{"role": "user", "texts": [current_text]}]

    contents = []
    for item in merged_turns:
        combined_text = "\n\n".join(item["texts"])
        contents.append(types.Content(
            role=item["role"],
            parts=[types.Part.from_text(text=combined_text)]
        ))
    return contents

def _extract_chunk_text(chunk: Any) -> str:
    """
    Safely extract text content from streaming GenerateContentResponse chunk.
    Handles thought tokens, empty chunks, and safety blocks without raising ValueError.
    """
    if not chunk:
        return ""
    try:
        if hasattr(chunk, "text") and chunk.text:
            return chunk.text
    except Exception:
        pass
    try:
        candidates = getattr(chunk, "candidates", None) or []
        if candidates:
            content = getattr(candidates[0], "content", None)
            if content:
                parts = getattr(content, "parts", None) or []
                collected = []
                for part in parts:
                    txt = getattr(part, "text", None)
                    if txt:
                        collected.append(txt)
                if collected:
                    return "".join(collected)
    except Exception:
        pass
    return ""

def _parse_gemini_response(response: Any) -> str:
    """
    Safely extract text content from Google GenAI response object.
    Handles safety filters, multi-part contents, and blocks without raising ValueError.
    """
    if not response:
        return ""
    try:
        if hasattr(response, "text") and response.text:
            return response.text.strip()
    except Exception as e:
        logger.debug(f"Direct response.text read note: {e}")

    try:
        candidates = getattr(response, "candidates", None) or []
        if candidates:
            content = getattr(candidates[0], "content", None)
            if content:
                parts = getattr(content, "parts", None) or []
                collected = []
                for part in parts:
                    txt = getattr(part, "text", None)
                    if txt:
                        collected.append(txt)
                if collected:
                    return "".join(collected).strip()
    except Exception as ce:
        logger.debug(f"Candidate parts parsing note: {ce}")
    return ""

def extract_citations(
    answer: str,
    context_chunks: List[Dict[str, Any]],
    primary_std: Optional[Dict[str, Any]] = None
) -> List[Dict[str, Any]]:
    """
    Extract claim-level citations with exact clause and page references.
    Conforms strictly to app.models.schemas.Citation schema.
    Strictly grounded in provided context chunks or verified standard catalog evidence.
    """
    citations = []
    seen = set()

    # 1. Prioritize primary standard verified evidence clauses if present
    if primary_std:
        std_id = primary_std.get("standard_id", "")
        std_title = primary_std.get("title") or f"Indian Standard {std_id}"
        evidence_clauses = primary_std.get("evidence_clauses", [])

        if evidence_clauses:
            for c in evidence_clauses[:4]:
                sec = c.get("section") or f"Clause {c.get('clause_id', '')}"
                cid = str(c.get("clause_id") or "")
                unique_key = f"{std_id}|{sec}"
                if unique_key in seen:
                    continue
                citations.append({
                    "standard_id": std_id,
                    "title": std_title,
                    "section": sec,
                    "clause_id": cid,
                    "page": str(c.get("page") or "1"),
                    "url": "https://www.manakonline.in",
                    "relevance": 95,
                    "snippet": str(c.get("requirement_text") or "")[:200]
                })
                seen.add(unique_key)
        else:
            unique_key = f"{std_id}|scope"
            citations.append({
                "standard_id": std_id,
                "title": std_title,
                "section": "Scope & Statutory Requirements",
                "clause_id": "",
                "page": "1",
                "url": "https://www.manakonline.in",
                "relevance": 95,
                "snippet": str(primary_std.get("description") or f"Statutory Indian Standard for {std_title}")[:200]
            })
            seen.add(unique_key)

    # 2. Add retrieved semantic context chunks (if not already added)
    for chunk in (context_chunks or []):
        std_id = chunk.get("standard_id", "")
        clause_id = chunk.get("clause_id") or chunk.get("section", "")
        unique_key = f"{std_id}|{clause_id}"

        if not std_id or unique_key in seen:
            continue

        raw_rel = chunk.get("relevance_score", 0.8)
        if isinstance(raw_rel, (int, float)):
            relevance = int(raw_rel * 100) if raw_rel <= 1.0 else int(raw_rel)
        else:
            relevance = 80
        relevance = max(1, min(100, relevance))

        snippet_text = chunk.get("content") or chunk.get("snippet") or ""
        citations.append({
            "standard_id": std_id,
            "title": chunk.get("standard_title") or chunk.get("title") or f"Indian Standard {std_id}",
            "section": chunk.get("section", "") or (f"Clause {clause_id}" if clause_id else "Statutory Requirements"),
            "clause_id": str(clause_id or ""),
            "page": str(chunk.get("page") or "1"),
            "url": chunk.get("source_url") or chunk.get("url") or "https://www.manakonline.in",
            "relevance": relevance,
            "snippet": snippet_text[:200] + ("..." if len(snippet_text) > 200 else "")
        })
        seen.add(unique_key)

    # 3. If citations is still empty, infer strictly from recognized product catalog
    if not citations and answer:
        try:
            inferred = match_product_to_standards(answer)
            app_list = inferred.get("applicable_standards", [])
            if app_list:
                top_std = app_list[0]
                s_id = top_std.get("standard_id", "BIS Standard")
                citations.append({
                    "standard_id": s_id,
                    "title": top_std.get("title") or f"Indian Standard {s_id}",
                    "section": "Statutory Requirements",
                    "clause_id": "",
                    "page": "1",
                    "url": "https://www.manakonline.in",
                    "relevance": 90,
                    "snippet": str(top_std.get("description") or f"Applicable BIS standard {s_id}")[:200]
                })
        except Exception as e:
            logger.debug(f"Citation inference note: {e}")

    return citations

def generate_v2_grounded_answer(
    query: str,
    context_chunks: List[Dict[str, Any]],
    mode: str = "simple",
    target_language: str = "en"
) -> Tuple[str, Dict[str, Any]]:
    """
    Local Evidence-First Grounded Response Synthesizer:
    Grounded in actual product data and compliance engine outputs (no hardcoded fake values).
    Used as an emergency fallback if Gemini API is unreachable.
    """
    prod_data = match_product_to_standards(query)
    comp_data = evaluate_compliance(query=query)

    profile = prod_data.get("product_profile", {})
    app_stds = prod_data.get("applicable_standards", [])
    primary_std = app_stds[0] if app_stds else None

    is_hindi = (target_language == "hi") or bool(re.search(r'[\u0900-\u097F]', query)) or "के बारे में" in query

    # Handle smalltalk / greeting or questions with no matched standard
    if not primary_std and not context_chunks:
        clean_q = query.strip().lower()
        greeting_words = [
            "hi", "hello", "hey", "namaste", "नमस्ते", "नमस्कार", "प्रणाम", "हैलो",
            "kem cho", "vanakkam", "who are you", "what can you do",
            "good morning", "good evening", "good afternoon"
        ]
        is_greeting = any(w in clean_q for w in greeting_words)
        if is_greeting:
            if is_hindi:
                answer = (
                    "नमस्ते! 🙏 मैं **BIS सहायक V2** हूँ, भारतीय मानक ब्यूरो (BIS) के लिए आपका आधिकारिक AI अनुपालन नेविगेटर।\n\n"
                    "मैं निम्नलिखित विषयों में आपकी सहायता कर सकता हूँ:\n"
                    "- आपके उत्पाद के लिए लागू भारतीय मानक (IS कोड) खोजना\n"
                    "- अनिवार्य गुणवत्ता नियंत्रण आदेश (QCOs) और समय-सीमा समझना\n"
                    "- अनिवार्य परीक्षण आवश्यकताएँ, सुरक्षा खंड और NABL लैब प्रक्रियाएँ\n"
                    "- ISI / CML लाइसेंस सत्यापन और Manakonline पर ऑनलाइन आवेदन\n\n"
                    "आज मैं आपकी किस प्रकार सहायता कर सकता हूँ?"
                )
            else:
                answer = (
                    "Namaste! 🙏 I am **BIS Sahayak V2** (बीआईएस सहायक), your AI-powered Bureau of Indian Standards compliance navigator.\n\n"
                    "I can assist you with:\n"
                    "- Finding applicable Indian Standards (IS codes) for your manufactured products\n"
                    "- Understanding mandatory Quality Control Orders (QCOs) and compliance deadlines\n"
                    "- Testing requirements, safety clauses, and NABL lab protocols\n"
                    "- Verifying ISI / CML mark licenses and applying on Manakonline\n\n"
                    "How can I assist you with quality standards and compliance today?"
                )
        else:
            if is_hindi:
                answer = (
                    f"### भारतीय मानक ब्यूरो (BIS) मार्गदर्शन\n\n"
                    f"विषय: **{query}**\n\n"
                    f"**भारतीय मानक ब्यूरो (BIS)** बीआईएस अधिनियम, 2016 के तहत राष्ट्रीय मानक तैयार करता है, अनिवार्य गुणवत्ता नियंत्रण आदेश (QCOs) लागू करता है, और उत्पाद प्रमाणन (ISI मार्क, CRS, हॉलमार्किंग) की निगरानी करता है।\n\n"
                    f"**प्रमुख अगले कदम:**\n"
                    f"- **मानक खोजें:** [www.manakonline.in](https://www.manakonline.in) पर 22,000+ मानकों की निर्देशिका देखें\n"
                    "- **उत्पाद प्रमाणन:** अनिवार्य ISI मार्किंग हेतु स्कीम-I के तहत आवेदन करें\n"
                    "- **MSME लाभ:** पात्र उद्यमों को लाइसेंसिंग शुल्क में 50% छूट प्राप्त होती है\n"
                    "- **राष्ट्रीय हेल्पलाइन:** निःशुल्क सहायता के लिए **1800-11-4000** पर संपर्क करें।"
                )
            else:
                answer = (
                    f"### Bureau of Indian Standards (BIS) Guidance\n\n"
                    f"Regarding: **{query}**\n\n"
                    f"The **Bureau of Indian Standards (BIS)** operates under the BIS Act, 2016 to formulate national standards, implement mandatory Quality Control Orders (QCOs), and oversee product certification schemes (ISI Mark, CRS, Hallmarking).\n\n"
                    f"**Key Next Steps:**\n"
                    f"- **Search Standards:** Search the comprehensive 22,000+ standards directory at [www.manakonline.in](https://www.manakonline.in)\n"
                    f"- **Product Certification:** Apply under Scheme-I for mandatory ISI marking\n"
                    f"- **MSME & Startup Benefits:** Eligible enterprises receive a 50% concession on marking and audit fees\n"
                    f"- **National BIS Helpline:** Call toll-free **1800-11-4000** for direct support."
                )
        return answer, comp_data

    # Real compliance metrics from compliance engine
    readiness_score = comp_data.get("compliance_readiness_score", 0)
    completed_c = comp_data.get("completed_count", 0)
    review_c = comp_data.get("review_count", 0)
    missing_c = comp_data.get("missing_count", 0)
    total_reqs = comp_data.get("total_requirements", len(comp_data.get("matrix", [])))
    next_step = comp_data.get("next_best_action") or ("BIS मानक पोर्टल www.manakonline.in पर ऑनलाइन आवेदन करें।" if is_hindi else "Verify standards on Manakonline.")

    if is_hindi and primary_std:
        std_id = primary_std.get("standard_id", "IS Standard")
        std_title = primary_std.get("title", "")

        why_lines = [f"- {r}" for r in primary_std.get("why_it_applies", [])]
        why_text = "\n".join(why_lines) if why_lines else "- उत्पाद विनिर्देश एवं सुरक्षा आवश्यकताओं के अनुरूप अनिवार्य।"

        clause_lines = []
        for c in primary_std.get("evidence_clauses", [])[:4]:
            sec = c.get("section") or c.get("title") or "Clause"
            req = c.get("requirement_text", "")
            pg = c.get("page") or "1"
            clause_lines.append(f"- **{sec}:** {req} [Source: {std_id}, {sec}, Page {pg}]")
        clauses_text = "\n".join(clause_lines) if clause_lines else f"- {std_id} के तहत सुरक्षा एवं गुणवत्ता परीक्षण अनिवार्य हैं।"

        answer = (
            f"## उत्पाद और लागू भारतीय मानक\n"
            f"**उत्पाद:** {profile.get('product_name', 'पहचाना गया उत्पाद')}  \n"
            f"**लागू मानक:** **{std_id}** — {std_title}\n\n"
            f"### यह मानक क्यों लागू होता है?\n"
            f"{why_text}\n\n"
            f"### प्रमुख वैधानिक आवश्यकताएं और परीक्षण:\n"
            f"{clauses_text}\n\n"
            f"### अनुपालन तैयारी (Compliance Readiness): **{readiness_score}%**\n"
            f"- पूर्ण आवश्यकताएं: {completed_c} / {total_reqs}\n"
            f"- समीक्षाधीन परीक्षण: {review_c}\n"
            f"- लंबित आवश्यकताएं: {missing_c}\n\n"
            f"### अनुशंसित अगला कदम (Recommended Next Action):\n"
            f"{next_step}"
        )
        return answer, comp_data

    # Standard V2 English Response
    if primary_std:
        std_id = primary_std.get("standard_id", "IS Standard")
        std_title = primary_std.get("title", "")
        status_badge = primary_std.get("status", "Current / Mandatory under QCO")
        amends = primary_std.get("amendments", [])
        amend_text = ""
        if amends and isinstance(amends[0], dict):
            amend_text = f" (Includes {amends[0].get('number', '')})"
        elif amends and isinstance(amends[0], str):
            amend_text = f" (Includes {amends[0]})"

        answer_parts = [
            "## 1. Product Identification & Applicable Standard",
            f"- **Target Product:** {profile.get('product_name', 'Specified Product')}",
            f"- **Primary Standard:** **{std_id}**{amend_text}",
            f"- **Title:** *{std_title}*",
            f"- **Regulatory Status:** <font color='#C2410C'><b>{status_badge}</b></font>\n",
            "## 2. Why Does This Standard Apply?"
        ]
        for reason in primary_std.get("why_it_applies", []):
            answer_parts.append(f"- {reason}")

        answer_parts.append("\n## 3. Statutory Requirements & Mandatory Testing")
        for c in primary_std.get("evidence_clauses", [])[:4]:
            sec = c.get("section") or f"Clause {c.get('clause_id', '')}"
            req = c.get("requirement_text", "")
            pg = c.get("page") or "1"
            cat = c.get("category", "Safety")
            answer_parts.append(f"- **{sec} [{cat}]:** {req} [Source: {std_id}, {sec}, Page {pg}]")

        answer_parts.append(f"\n## 4. Compliance Readiness: **{readiness_score}%**")
        answer_parts.append(f"- **Evidence Verified:** {completed_c} of {total_reqs} criteria satisfied.")
        if review_c > 0:
            answer_parts.append(f"- **Under Review:** {review_c} test observation(s) awaiting NABL lab endorsement.")
        if missing_c > 0:
            answer_parts.append(f"- **Pending / Missing Tests:** {missing_c} mandatory test(s) require accredited reports.")

        answer_parts.append("\n## 5. Recommended Next Best Action")
        answer_parts.append(f"👉 **{next_step}**")

        return "\n".join(answer_parts), comp_data

    elif context_chunks:
        # Context chunk fallback
        chunk = context_chunks[0]
        std_id = chunk.get("standard_id", "IS Standard")
        std_title = chunk.get("standard_title", "")

        answer_parts = [
            f"## Applicable Standard: **{std_id}**",
            f"**Title:** {std_title}\n",
            "### Key Specifications & Clauses:"
        ]
        for c in context_chunks[:3]:
            sec = c.get("section") or "Clause"
            pg = c.get("page") or "1"
            std = c.get("standard_id") or "BIS"
            answer_parts.append(f"- **{sec}:** {c.get('content', '')} [Source: {std}, {sec}, Page {pg}]")

        answer_parts.append(f"\n### Compliance Readiness: **{readiness_score}%**")
        answer_parts.append(f"### Recommended Next Step:\n{next_step}")
        return "\n".join(answer_parts), comp_data
    else:
        greeting = (
            "Namaste! I am **BIS Sahayak V2** (बीआईएस सहायक), your AI-powered Bureau of Indian Standards compliance navigator.\n\n"
            "I can help you with:\n"
            "- Finding applicable Indian Standards (IS codes) for your manufactured products\n"
            "- Understanding statutory testing, safety clauses, and lab reports\n"
            "- Verifying ISI / CML mark licenses and mandatory QCO deadlines\n\n"
            "**Try asking:**\n"
            "- *\"What standards apply to electric storage water heaters?\"*\n"
            "- *\"IS 2347 requirements for domestic pressure cookers\"*\n"
            "- *\"How to verify an ISI license number?\"*"
        )
        return greeting, comp_data

async def _call_gemini_with_fallback(client, contents, config):
    """
    Execute Gemini generate_content asynchronously across valid fallback model names.
    Raises the last error if all models fail, logging detailed diagnostics.
    """
    raw_models = [
        settings.LLM_MODEL,
        "gemini-flash-lite-latest",
        "gemini-2.5-flash",
        "gemini-flash-latest",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-3.6-flash"
    ]
    candidate_models = []
    for m in raw_models:
        if m and m not in candidate_models:
            candidate_models.append(m)

    last_err = None
    for model_name in candidate_models:
        try:
            if hasattr(client, "aio") and hasattr(client.aio, "models"):
                return await client.aio.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=config
                )
            else:
                return client.models.generate_content(
                    model=model_name,
                    contents=contents,
                    config=config
                )
        except Exception as e:
            last_err = e
            err_msg = str(e)
            logger.warning(f"[Gemini Model {model_name} Error]: {err_msg}")
            if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg:
                await asyncio.sleep(0.5)
            continue

    logger.error(f"[Gemini API All Models Failed] Last Error: {last_err}", exc_info=True)
    raise last_err

async def _stream_gemini_with_fallback(client, contents, config):
    """
    Execute Gemini generate_content_stream asynchronously across valid fallback models.
    Yields chunks from the first working model. If a model fails during stream initiation,
    it catches the error and seamlessly falls back to the next model in candidate_models.
    """
    raw_models = [
        settings.LLM_MODEL,
        "gemini-flash-lite-latest",
        "gemini-2.5-flash",
        "gemini-flash-latest",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-3.6-flash"
    ]
    candidate_models = []
    for m in raw_models:
        if m and m not in candidate_models:
            candidate_models.append(m)

    last_err = None
    for model_name in candidate_models:
        try:
            stream = await client.aio.models.generate_content_stream(
                model=model_name,
                contents=contents,
                config=config
            )
            yielded_any = False
            async for chunk in stream:
                txt = _extract_chunk_text(chunk)
                if txt:
                    yield txt
                    yielded_any = True
            if yielded_any:
                return
        except Exception as e:
            last_err = e
            logger.warning(f"[Gemini Stream Model {model_name} Error]: {e}")
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                await asyncio.sleep(0.5)
            continue

    logger.error(f"[Gemini Stream All Models Failed] Last Error: {last_err}", exc_info=True)
    raise last_err

async def stream_general_llm_answer(
    query: str,
    history: Optional[List[Dict[str, Any]]] = None,
    target_language: str = "en"
):
    """
    Real-time streaming from Google Gemini for ANY general question:
    Coding, mathematics, science, writing, conversation, reasoning, etc.
    Yields text chunks as they arrive from Gemini.
    """
    if not settings.GEMINI_API_KEY:
        yield "Error: `GEMINI_API_KEY` is not configured in backend `.env`. Please provide a valid Gemini API key."
        return

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        lang_instruction = get_target_language_instruction(target_language)
        system_instruction = GENERAL_SYSTEM_INSTRUCTION + lang_instruction

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
            automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)
        )
        prefix_block = None
        if lang_instruction:
            lang_info = INDIC_LANGUAGES_MAP.get(target_language.lower(), ("the selected language", "स्थानीय भाषा", ""))
            prefix_block = f"[IMPORTANT DIRECTIVE: Respond completely in {lang_info[0]} ({lang_info[1]}) using native script, even though the query is in English.]"

        contents = _build_gemini_contents(query=query, history=history, context_prefix=prefix_block)
        async for token in _stream_gemini_with_fallback(client, contents, config):
            yield token
    except Exception as e:
        logger.error(f"[General Gemini Stream Exception]: {e}", exc_info=True)
        yield f"\n\n**Gemini API Error:** {str(e)}"

async def stream_rag_answer(
    query: str,
    context_chunks: List[Dict[str, Any]],
    mode: str = "simple",
    history: Optional[List[Dict[str, Any]]] = None,
    target_language: str = "en"
):
    """
    Real-time streaming RAG-augmented Google Gemini response for BIS queries.
    Yields text chunks as they arrive from Gemini.
    """
    context_chunks = context_chunks or []
    prod_data = match_product_to_standards(query)
    comp_data = evaluate_compliance(query=query)
    app_stds = prod_data.get("applicable_standards", [])
    primary_std = app_stds[0] if app_stds else None

    if settings.GEMINI_API_KEY:
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            evidence_lines = []
            if context_chunks:
                evidence_lines.append("### Indexed Official Document Chunks:")
                for i, c in enumerate(context_chunks[:5]):
                    std = c.get("standard_id") or "BIS Standard"
                    sec = c.get("section") or c.get("clause_id") or "General"
                    pg = c.get("page") or "1"
                    evidence_lines.append(f"[Evidence {i+1} | Standard: {std} | Section/Clause: {sec} | Page {pg}]:\n{c.get('content', '')}")

            if primary_std:
                evidence_lines.append(f"\n### Verified Standard Catalog Data:")
                evidence_lines.append(f"Standard: {primary_std.get('standard_id')} — {primary_std.get('title')}")
                evidence_lines.append(f"Regulatory Status: {primary_std.get('status', 'Mandatory under QCO')}")
                for clause in primary_std.get("evidence_clauses", [])[:5]:
                    c_sec = clause.get("section") or f"Clause {clause.get('clause_id', '')}"
                    evidence_lines.append(f"- {c_sec}: {clause.get('requirement_text', '')} (Page {clause.get('page', '1')})")

            readiness = comp_data.get("compliance_readiness_score", 0)
            completed_c = comp_data.get("completed_count", 0)
            review_c = comp_data.get("review_count", 0)
            missing_c = comp_data.get("missing_count", 0)
            total_reqs = comp_data.get("total_requirements", len(comp_data.get("matrix", [])))
            next_action = comp_data.get("next_best_action") or "Verify standards on Manakonline."

            compliance_summary = (
                f"\n### Real Compliance Engine Assessment:\n"
                f"- Compliance Readiness Score: {readiness}%\n"
                f"- Requirements Breakdown: {completed_c} satisfied, {review_c} under review, {missing_c} missing (out of {total_reqs} total mapped clauses)\n"
                f"- Recommended Next Best Action: {next_action}"
            )
            context_block = "\n\n".join(evidence_lines) + compliance_summary

            lang_instruction = get_target_language_instruction(target_language)
            system_instruction = BIS_RAG_SYSTEM_INSTRUCTION + lang_instruction

            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=settings.LLM_TEMPERATURE,
                automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)
            )

            prefix_block = f"Verified Evidence Context:\n{context_block}"
            if lang_instruction:
                lang_info = INDIC_LANGUAGES_MAP.get(target_language.lower(), ("the selected language", "स्थानीय भाषा", ""))
                prefix_block += f"\n\n[IMPORTANT DIRECTIVE: Respond completely in {lang_info[0]} ({lang_info[1]}) using native script, even though the query is in English.]"

            contents = _build_gemini_contents(
                query=query,
                history=history,
                context_prefix=prefix_block
            )

            async for token in _stream_gemini_with_fallback(client, contents, config):
                yield token
            return
        except Exception as e:
            logger.error(f"[RAG Gemini Stream Exception]: {e}", exc_info=True)
            if primary_std or context_chunks:
                logger.info("[RAG Fallback]: Streaming local grounded synthesizer response.")
                answer, _ = generate_v2_grounded_answer(query, context_chunks, mode, target_language=target_language)
                words = answer.split(" ")
                for i, w in enumerate(words):
                    yield w + (" " if i < len(words) - 1 else "")
                    await asyncio.sleep(0.015)
                return
            else:
                yield f"\n\n**Gemini API Error:** {str(e)}"
                return

    # Fallback if no API key
    answer, _ = generate_v2_grounded_answer(query, context_chunks, mode, target_language=target_language)
    words = answer.split(" ")
    for i, w in enumerate(words):
        yield w + (" " if i < len(words) - 1 else "")
        await asyncio.sleep(0.015)


async def generate_general_llm_answer(
    query: str,
    history: Optional[List[Dict[str, Any]]] = None,
    target_language: str = "en"
) -> Tuple[str, List[Dict[str, Any]], Dict[str, Any]]:
    """
    Direct Google Gemini LLM answering for ANY general question:
    Coding, mathematics, science, writing, conversation, reasoning, etc.
    Maintains multi-turn conversation memory when history is provided.
    """
    if not settings.GEMINI_API_KEY:
        return (
            "Error: `GEMINI_API_KEY` is not configured in backend `.env`. Please provide a valid Gemini API key.",
            [],
            {}
        )

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        lang_instruction = get_target_language_instruction(target_language)
        system_instruction = GENERAL_SYSTEM_INSTRUCTION + lang_instruction

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
            automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)
        )

        prefix_block = None
        if lang_instruction:
            lang_info = INDIC_LANGUAGES_MAP.get(target_language.lower(), ("the selected language", "स्थानीय भाषा", ""))
            prefix_block = f"[IMPORTANT DIRECTIVE: Respond completely in {lang_info[0]} ({lang_info[1]}) using native script, even though the query is in English.]"

        contents = _build_gemini_contents(query=query, history=history, context_prefix=prefix_block)
        response = await _call_gemini_with_fallback(client, contents, config)
        ans = _parse_gemini_response(response)
        if ans:
            return ans, [], {}

        raise ValueError("Empty response received from Gemini API.")

    except Exception as e:
        logger.error(f"[General Gemini LLM Exception]: {e}", exc_info=True)
        err_msg = str(e).split("\n")[0]
        return f"**Gemini API Error:** {err_msg}. Please check your Gemini API key or connection.", [], {}

async def generate_rag_answer(
    query: str,
    context_chunks: List[Dict[str, Any]],
    mode: str = "simple",
    history: Optional[List[Dict[str, Any]]] = None,
    target_language: str = "en"
) -> Tuple[str, List[Dict[str, Any]], Dict[str, Any]]:
    """
    RAG-augmented Google Gemini response for Bureau of Indian Standards (BIS) queries.
    Strictly grounded in retrieved evidence chunks and real compliance engine metrics.
    Maintains multi-turn conversation memory when history is provided.
    """
    prod_data = match_product_to_standards(query)
    comp_data = evaluate_compliance(query=query)
    app_stds = prod_data.get("applicable_standards", [])
    primary_std = app_stds[0] if app_stds else None

    if settings.GEMINI_API_KEY:
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            # Build evidence context block
            evidence_lines = []
            if context_chunks:
                evidence_lines.append("### Indexed Official Document Chunks:")
                for i, c in enumerate(context_chunks[:5]):
                    std = c.get("standard_id") or "BIS Standard"
                    sec = c.get("section") or c.get("clause_id") or "General"
                    pg = c.get("page") or "1"
                    evidence_lines.append(f"[Evidence {i+1} | Standard: {std} | Section/Clause: {sec} | Page {pg}]:\n{c.get('content', '')}")

            if primary_std:
                evidence_lines.append(f"\n### Verified Standard Catalog Data:")
                evidence_lines.append(f"Standard: {primary_std.get('standard_id')} — {primary_std.get('title')}")
                evidence_lines.append(f"Regulatory Status: {primary_std.get('status', 'Mandatory under QCO')}")
                for clause in primary_std.get("evidence_clauses", [])[:5]:
                    c_sec = clause.get("section") or f"Clause {clause.get('clause_id', '')}"
                    evidence_lines.append(f"- {c_sec}: {clause.get('requirement_text', '')} (Page {clause.get('page', '1')})")

            # Real compliance metrics from compliance engine
            readiness = comp_data.get("compliance_readiness_score", 0)
            completed_c = comp_data.get("completed_count", 0)
            review_c = comp_data.get("review_count", 0)
            missing_c = comp_data.get("missing_count", 0)
            total_reqs = comp_data.get("total_requirements", len(comp_data.get("matrix", [])))
            next_action = comp_data.get("next_best_action") or "Verify standards on Manakonline."

            compliance_summary = (
                f"\n### Real Compliance Engine Assessment:\n"
                f"- Compliance Readiness Score: {readiness}%\n"
                f"- Requirements Breakdown: {completed_c} satisfied, {review_c} under review, {missing_c} missing (out of {total_reqs} total mapped clauses)\n"
                f"- Recommended Next Best Action: {next_action}"
            )
            context_block = "\n\n".join(evidence_lines) + compliance_summary

            lang_instruction = get_target_language_instruction(target_language)
            system_instruction = BIS_RAG_SYSTEM_INSTRUCTION + lang_instruction

            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=settings.LLM_TEMPERATURE,
                automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)
            )

            prefix_block = f"Verified Evidence Context:\n{context_block}"
            if lang_instruction:
                lang_info = INDIC_LANGUAGES_MAP.get(target_language.lower(), ("the selected language", "स्थानीय भाषा", ""))
                prefix_block += f"\n\n[IMPORTANT DIRECTIVE: Respond completely in {lang_info[0]} ({lang_info[1]}) using native script, even though the query is in English.]"

            contents = _build_gemini_contents(
                query=query,
                history=history,
                context_prefix=prefix_block
            )

            response = await _call_gemini_with_fallback(client, contents, config)
            ans = _parse_gemini_response(response)
            if ans:
                cits = extract_citations(ans, context_chunks, primary_std=primary_std)
                return ans, cits, comp_data

            raise ValueError("Empty response received from Gemini API.")

        except Exception as e:
            logger.error(f"[RAG Gemini Generation Error]: {e}", exc_info=True)
            err_msg = str(e).split("\n")[0]
            # Fallback to local grounded synthesizer if standard or context chunks exist, else report real API error
            if primary_std or context_chunks:
                logger.info("[RAG Fallback]: Using local grounded synthesizer.")
                answer, comp_data = generate_v2_grounded_answer(query, context_chunks, mode, target_language=target_language)
                citations = extract_citations(answer, context_chunks, primary_std=primary_std)
                return answer, citations, comp_data
            else:
                return f"**Gemini API Error:** {err_msg}. Please check your connection or Gemini API key.", [], comp_data

    # Fallback to local grounded synthesizer if API key is missing
    answer, comp_data = generate_v2_grounded_answer(query, context_chunks, mode, target_language=target_language)
    citations = extract_citations(answer, context_chunks, primary_std=primary_std)
    return answer, citations, comp_data

async def generate_groq_answer(
    query: str,
    history: Optional[List[Dict[str, Any]]] = None,
    target_language: str = "en"
) -> Tuple[str, List[Dict[str, Any]], Dict[str, Any]]:
    """Groq LLM answering for general conversational / smalltalk queries."""
    groq_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
    if groq_key:
        try:
            import httpx
            headers = {
                "Authorization": f"Bearer {groq_key}",
                "Content-Type": "application/json"
            }
            models_to_try = [settings.GROQ_MODEL, "llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"]
            valid_models = []
            for m in models_to_try:
                if m and m not in valid_models:
                    valid_models.append(m)

            lang_instruction = get_target_language_instruction(target_language)
            system_msg = GENERAL_SYSTEM_INSTRUCTION + lang_instruction

            messages = [{"role": "system", "content": system_msg}]
            if history:
                for h in history:
                    messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
            messages.append({"role": "user", "content": query})

            async with httpx.AsyncClient(timeout=10.0) as client:
                for m in valid_models:
                    try:
                        res = await client.post(
                            "https://api.groq.com/openai/v1/chat/completions",
                            headers=headers,
                            json={
                                "model": m,
                                "messages": messages,
                                "temperature": 0.3,
                                "max_tokens": 1024
                            }
                        )
                        if res.status_code == 200:
                            data = res.json()
                            raw_content = data["choices"][0]["message"]["content"]
                            clean_ans = re.sub(r'<think>[\s\S]*?</think>', '', raw_content).strip()
                            return clean_ans, [], {}
                    except Exception as model_err:
                        logger.warning(f"[Groq model {m} note] {model_err}")
                        continue
        except Exception as ge:
            logger.warning(f"[Groq API warning] {ge}")

    # Fallback directly to general Gemini
    return await generate_general_llm_answer(query, history=history, target_language=target_language)

async def generate_answer(
    query: str,
    context_chunks: List[Dict[str, Any]],
    mode: str = "simple",
    is_bis: bool = True,
    history: Optional[List[Dict[str, Any]]] = None,
    target_language: str = "en"
) -> Tuple[str, List[Dict[str, Any]], Dict[str, Any]]:
    """
    Universal Gemini entry point:
    1. If is_bis is True -> Use Gemini RAG pipeline (grounded in indexed BIS standards + clauses).
    2. If is_bis is False -> Use general-purpose Gemini answering (coding, math, general knowledge, etc.).
    Maintains multi-turn conversation memory when history is provided.
    """
    if is_bis:
        return await generate_rag_answer(query, context_chunks, mode, history=history, target_language=target_language)
    else:
        return await generate_general_llm_answer(query, history=history, target_language=target_language)
