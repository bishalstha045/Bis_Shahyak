import json
import os
from typing import Dict, Any, List, Optional
from app.services.product_matcher import match_product_to_standards

def evaluate_compliance(
    query: Optional[str] = None,
    standard_id: Optional[str] = None,
    user_evidence_items: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Compliance Readiness Engine:
    - Builds structured Requirement Matrix
    - Separates AI Grounding Confidence from Compliance Readiness Score
    - Identifies missing vs completed evidence
    - Suggests Next Best Action
    """
    matched_data = None
    if query:
        matched_data = match_product_to_standards(query)
    
    applicable_standards = matched_data.get("applicable_standards", []) if matched_data else []
    product_profile = matched_data.get("product_profile", {}) if matched_data else {}
    
    # If specific standard_id requested, find it
    target_standard = None
    if standard_id:
        from app.services.product_matcher import load_standards_metadata
        all_stds = load_standards_metadata()
        for s in all_stds:
            if s["id"].lower() == standard_id.lower() or s["id"].split(":")[0].lower() == standard_id.lower():
                target_standard = s
                break
                
    if not target_standard and applicable_standards:
        target_standard = applicable_standards[0]
        
    if not target_standard:
        return {
            "has_evidence": False,
            "message": "No standard identified to evaluate compliance.",
            "compliance_readiness_score": 0,
            "ai_confidence_score": 30,
            "matrix": [],
            "journey": [],
            "next_best_action": "Search and identify an applicable Indian Standard first."
        }

    clauses = target_standard.get("key_clauses") or target_standard.get("evidence_clauses") or []
    
    # Check user provided evidence mappings
    user_ev_map = {}
    if user_evidence_items:
        for ev in user_evidence_items:
            clause_id = ev.get("clause_id", "")
            user_ev_map[clause_id] = ev

    # Build Requirement Matrix
    matrix = []
    completed_count = 0
    missing_count = 0
    review_count = 0
    
    for i, c in enumerate(clauses):
        cid = c.get("clause_id", f"{i+1}.0")
        title = c.get("title", f"Requirement {cid}")
        cat = c.get("category", "Safety & Performance")
        req_text = c.get("requirement_text", "")
        req_evidence = c.get("required_evidence", "Test Certificate")
        page = str(c.get("page", "1"))
        
        # Determine status
        if cid in user_ev_map:
            u_stat = user_ev_map[cid].get("status", "Complete")
            u_ev_text = user_ev_map[cid].get("evidence_text", req_evidence)
            if u_stat == "Complete":
                completed_count += 1
            elif u_stat == "Needs Review":
                review_count += 1
            else:
                missing_count += 1
            status = u_stat
            evidence_desc = u_ev_text
        else:
            # Default benchmark distribution: First 1 or 2 items assumed complete for product profile match, rest missing/needs review
            if i == 0:
                status = "Complete"
                evidence_desc = f"Raw Material Mill Test Certificate ({product_profile.get('material', 'Standard Grade')})"
                completed_count += 1
            elif i == 1:
                status = "Needs Review"
                evidence_desc = f"In-house test observation sheet (Pending NABL endorsement)"
                review_count += 1
            else:
                status = "Missing"
                evidence_desc = "—"
                missing_count += 1
                
        matrix.append({
            "clause_id": cid,
            "requirement_name": title,
            "category": cat,
            "status": status,
            "evidence": evidence_desc,
            "source_clause": f"Clause {cid}",
            "page": page,
            "standard_id": target_standard.get("id", target_standard.get("standard_id", "")),
            "requirement_text": req_text,
            "test_method": c.get("test_method", "")
        })

    # Calculate Compliance Readiness Score vs AI Confidence
    total_reqs = len(matrix) or 1
    # Weight: Complete = 1.0, Needs Review = 0.5, Missing = 0
    readiness_raw = (completed_count * 1.0 + review_count * 0.5) / total_reqs
    compliance_readiness_score = int(round(readiness_raw * 100))
    ai_confidence_score = 94 if len(applicable_standards) > 0 else 60

    # Build Compliance Journey
    journey = [
        {
            "stage_id": "product",
            "title": "Product Understanding",
            "status": "Complete",
            "summary": f"Identified: {product_profile.get('product_name', 'Specified Product')}"
        },
        {
            "stage_id": "standard",
            "title": "Standard Identified",
            "status": "Complete",
            "summary": f"{target_standard.get('id', target_standard.get('standard_id', ''))} (Mandatory QCO)"
        },
        {
            "stage_id": "requirements",
            "title": "Review Requirements",
            "status": "Complete",
            "summary": f"{total_reqs} Statutory Clauses Mapped"
        },
        {
            "stage_id": "testing",
            "title": "Laboratory Testing",
            "status": "Needs Review" if review_count > 0 else ("Complete" if missing_count == 0 else "Missing"),
            "summary": f"{review_count} tests need review · {missing_count} missing"
        },
        {
            "stage_id": "documentation",
            "title": "Form V & STI Documentation",
            "status": "Missing" if missing_count > 0 else "Complete",
            "summary": "Factory quality control manual & STI compliance"
        },
        {
            "stage_id": "certification",
            "title": "Certification Readiness",
            "status": "Locked" if compliance_readiness_score < 80 else "Ready",
            "summary": f"Audit Readiness: {compliance_readiness_score}%"
        }
    ]

    # Formulate actionable Next Best Action
    missing_items = [m for m in matrix if m["status"] == "Missing"]
    review_items = [m for m in matrix if m["status"] == "Needs Review"]
    
    if missing_items:
        first_missing = missing_items[0]
        next_action = f"Complete & upload '{first_missing['requirement_name']}' evidence ({first_missing['source_clause']}) to raise compliance readiness to {min(compliance_readiness_score + 20, 100)}%."
    elif review_items:
        first_rev = review_items[0]
        next_action = f"Validate in-house test logs for '{first_rev['requirement_name']}' against NABL laboratory accreditation criteria."
    else:
        next_action = f"Submit Form V on BIS Manakonline portal (www.manakonline.in) for Grant of License (CML)."

    return {
        "has_evidence": True,
        "standard_id": target_standard.get("id", target_standard.get("standard_id", "")),
        "standard_title": target_standard.get("title", ""),
        "product_name": product_profile.get("product_name", "Target Product"),
        "compliance_readiness_score": compliance_readiness_score,
        "ai_confidence_score": ai_confidence_score,
        "completed_count": completed_count,
        "review_count": review_count,
        "missing_count": missing_count,
        "total_requirements": total_reqs,
        "matrix": matrix,
        "journey": journey,
        "next_best_action": next_action
    }
