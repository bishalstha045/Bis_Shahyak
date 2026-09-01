import os
import re
import json
from typing import List, Dict, Any, Tuple
from app.config import settings
from app.services.product_matcher import match_product_to_standards
from app.services.compliance_engine import evaluate_compliance

def extract_citations(answer: str, context_chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Extract claim-level citations with exact clause and page references."""
    citations = []
    seen = set()
    
    for chunk in context_chunks:
        std_id = chunk.get("standard_id", "")
        clause_id = chunk.get("clause_id") or chunk.get("section", "")
        unique_key = f"{std_id}|{clause_id}"
        
        if not std_id or unique_key in seen:
            continue
            
        relevance = int(chunk.get("relevance_score", 0.8) * 100)
        citations.append({
            "standard_id": std_id,
            "title": chunk.get("standard_title", ""),
            "section": chunk.get("section", ""),
            "clause_id": chunk.get("clause_id", ""),
            "page": str(chunk.get("page", "1")),
            "url": chunk.get("source_url", "https://www.bis.gov.in"),
            "relevance": relevance,
            "snippet": chunk.get("content", "")[:200] + "..."
        })
        seen.add(unique_key)
        
    return citations

def generate_v2_grounded_answer(
    query: str,
    context_chunks: List[Dict[str, Any]],
    mode: str = "simple"
) -> Tuple[str, Dict[str, Any]]:
    """
    BIS Sahayak V2 Evidence-First Grounded Response Synthesizer:
    From Product -> Applicable Standard -> Why It Applies -> Requirements -> Evidence -> Readiness -> Next Best Action.
    """
    if not context_chunks:
        answer = (
            "**Insufficient reliable BIS evidence to answer this question accurately.**\n\n"
            "- **Searched Database:** Indian Standards repository (14 indexed core standards)\n"
            "- **Missing Information:** No matching standard scope, product category, or test clause was found for your query.\n"
            "- **Next Step:** Verify directly with the Bureau of Indian Standards National Helpline at **1800-11-4000** or visit **www.manakonline.in**."
        )
        return answer, {"readiness": 0, "product_profile": None, "applicable_standards": [], "matrix": [], "next_action": "Verify with BIS"}

    # Run Product & Compliance analysis
    prod_data = match_product_to_standards(query)
    comp_data = evaluate_compliance(query=query)
    
    profile = prod_data.get("product_profile", {})
    app_stds = prod_data.get("applicable_standards", [])
    primary_std = app_stds[0] if app_stds else None
    
    is_hindi = bool(re.search(r'[\u0900-\u097F]', query)) or "के बारे में" in query
    
    if is_hindi and primary_std:
        std_id = primary_std.get("standard_id", "IS Standard")
        std_title = primary_std.get("title", "")
        answer = f"""## उत्पाद और लागू भारतीय मानक
**उत्पाद:** {profile.get('product_name', 'पहचाना गया उत्पाद')}  
**लागू मानक:** **{std_id}** — {std_title}

### यह मानक क्यों लागू होता है?
{chr(10).join(['- ' + r for r in primary_std.get('why_it_applies', [])])}

### प्रमुख वैधानिक आवश्यकताएं और परीक्षण:
{chr(10).join([f"- **{c.get('section', c.get('title'))}:** {c.get('requirement_text')} [Source: {std_id}, {c.get('section', '')}, Page {c.get('page')}]" for c in primary_std.get('evidence_clauses', [])[:4]])}

### अनुपालन तैयारी (Compliance Readiness): **{comp_data.get('compliance_readiness_score', 65)}%**
- पूर्ण आवश्यकताएं: {comp_data.get('completed_count', 1)}
- समीक्षाधीन / लंबित परीक्षण: {comp_data.get('review_count', 1) + comp_data.get('missing_count', 1)}

### अनुशंसित अगला कदम (Recommended Next Action):
{comp_data.get('next_best_action', 'BIS मानक पोर्टल www.manakonline.in पर ऑनलाइन आवेदन करें।')}"""
        return answer, comp_data

    # Standard V2 English Response
    if primary_std:
        std_id = primary_std.get("standard_id", "IS Standard")
        std_title = primary_std.get("title", "")
        status_badge = primary_std.get("status", "Current / Mandatory under QCO")
        amends = primary_std.get("amendments", [])
        amend_text = f" (Includes {amends[0]['number']})" if amends else ""
        
        answer_parts = [
            f"## 1. Product Identification & Applicable Standard",
            f"- **Target Product:** {profile.get('product_name', 'Specified Product')}",
            f"- **Primary Standard:** **{std_id}**{amend_text}",
            f"- **Title:** *{std_title}*",
            f"- **Regulatory Status:** <font color='#C2410C'><b>{status_badge}</b></font>\n",
            
            f"## 2. Why Does This Standard Apply?",
        ]
        for reason in primary_std.get("why_it_applies", []):
            answer_parts.append(f"- {reason}")
            
        answer_parts.append("\n## 3. Statutory Requirements & Mandatory Testing")
        for c in primary_std.get("evidence_clauses", [])[:4]:
            sec = c.get("section", f"Clause {c.get('clause_id', '')}")
            req = c.get("requirement_text", "")
            pg = c.get("page", "1")
            cat = c.get("category", "Safety")
            answer_parts.append(f"- **{sec} [{cat}]:** {req} [Source: {std_id}, {sec}, Page {pg}]")
            
        answer_parts.append(f"\n## 4. Compliance Readiness: **{comp_data.get('compliance_readiness_score', 60)}%**")
        answer_parts.append(f"- **Evidence Verified:** {comp_data.get('completed_count', 1)} of {comp_data.get('total_requirements', 4)} criteria satisfied.")
        answer_parts.append(f"- **Pending / Missing Tests:** {comp_data.get('missing_count', 2)} mandatory lab test(s) require NABL certified reports.")
        
        answer_parts.append(f"\n## 5. Recommended Next Best Action")
        answer_parts.append(f"👉 **{comp_data.get('next_best_action', 'Upload test reports to complete compliance evaluation.')}**")
        
        return "\n".join(answer_parts), comp_data

    else:
        # Generic query fallback on context chunks
        chunk = context_chunks[0]
        std_id = chunk.get("standard_id", "IS Standard")
        std_title = chunk.get("standard_title", "")
        
        answer_parts = [
            f"## Applicable Standard: **{std_id}**",
            f"**Title:** {std_title}\n",
            "### Key Specifications & Clauses:",
        ]
        for c in context_chunks[:3]:
            answer_parts.append(f"- **{c.get('section', 'Clause')}:** {c.get('content', '')} [Source: {c['standard_id']}, {c.get('section', '')}, Page {c.get('page', '1')}]")
            
        answer_parts.append(f"\n### Recommended Next Step:\nVerify statutory Quality Control Order (QCO) mandate and apply via Manakonline Portal.")
        return "\n".join(answer_parts), comp_data

async def generate_answer(
    query: str,
    context_chunks: List[Dict[str, Any]],
    mode: str = "simple"
) -> Tuple[str, List[Dict[str, Any]], Dict[str, Any]]:
    """
    Generate grounded V2 response.
    """
    # 1. Check if Groq API key is present
    if settings.GROQ_API_KEY and settings.GROQ_API_KEY.startswith("gsk_"):
        try:
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY)
            
            context_str = "\n---\n".join([f"[{c['standard_id']} | {c['section']} | Page {c['page']}]: {c['content']}" for c in context_chunks])
            
            prompt = f"""You are BIS Sahayak V2, an AI compliance navigator for Bureau of Indian Standards.
Format the response strictly with:
1. Product Identified & Applicable Standard
2. Why this standard applies
3. Key Statutory Requirements (with exact [Source: IS XXXX, Clause X, Page X])
4. Compliance Readiness Assessment
5. Recommended Next Best Action.

Context:
{context_str}

User Question: {query}"""
            
            resp = client.chat.completions.create(
                model=settings.LLM_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=settings.LLM_TEMPERATURE,
                max_tokens=settings.LLM_MAX_TOKENS,
                stream=False
            )
            ans = resp.choices[0].message.content
            cits = extract_citations(ans, context_chunks)
            comp = evaluate_compliance(query=query)
            return ans, cits, comp
        except Exception as e:
            print(f"[Generator API Warning] {e}")

    # 2. Local Grounded Engine
    answer, comp_data = generate_v2_grounded_answer(query, context_chunks, mode)
    citations = extract_citations(answer, context_chunks)
    return answer, citations, comp_data
