import json
import os
import re
from typing import Dict, Any, List, Optional
from app.services.product_matcher import load_standards_metadata
from app.services.hsn_catalog import lookup_hsn

def normalize_code(s: str) -> str:
    return re.sub(r'[^a-zA-Z0-9]', '', s).lower()

def _format_standard_for_comparison(std: Dict[str, Any]) -> Dict[str, Any]:
    clauses = std.get("key_clauses", [])
    test_clauses = [c["title"] for c in clauses if "test" in c.get("category", "").lower() or "safety" in c.get("category", "").lower()]
    marking_clauses = [c["title"] for c in clauses if "marking" in c.get("category", "").lower()]
    amends = [f"{a.get('number', '')} ({a.get('date', '')})" for a in std.get("amendments", [])]

    scope_val = "; ".join(std.get("intended_use", ["General standard scope"])) if isinstance(std.get("intended_use"), list) else str(std.get("intended_use") or "General standard scope")
    prod_val = ", ".join(std.get("applicable_products", ["Specific appliances/goods"])) if isinstance(std.get("applicable_products"), list) else str(std.get("applicable_products") or "Regulated commodities")
    mat_val = ", ".join(std.get("characteristics", ["Specified industrial raw materials"])) if isinstance(std.get("characteristics"), list) else str(std.get("characteristics") or "Specified raw materials")

    return {
        "id": std.get("id", "Indian Standard"),
        "title": std.get("title", ""),
        "type": "Indian Standard (IS)",
        "year": str(std.get("year", "Current Gazetted Edition")),
        "status": std.get("status", "Mandatory ISI Marking under QCO"),
        "sector": std.get("sector", "Bureau of Indian Standards Specification"),
        "scope": scope_val,
        "products": prod_val,
        "materials": mat_val,
        "testing": "; ".join(test_clauses) if test_clauses else "Type testing, safety performance & batch conformity tests",
        "marking": "; ".join(marking_clauses) if marking_clauses else "Standard ISI Mark, CM/L license number, statutory manufacturer labeling",
        "amendments": ", ".join(amends) if amends else "None reported"
    }

def _format_hsn_for_comparison(hsn: Dict[str, Any]) -> Dict[str, Any]:
    code = hsn.get("hs_code", "")
    desc = hsn.get("description", "")
    related = hsn.get("related_items", [])
    related_str = ", ".join([f"{r['hs_code']} ({r['description'][:25]}...)" for r in related[:3]]) if related else "None"
    chapter = code[:2] if len(code) >= 2 else "Tariff"

    return {
        "id": f"HSN {code}",
        "title": f"HSN Tariff Classification - {desc}",
        "type": "Harmonized System of Nomenclature (HSN)",
        "year": "Current Indian Customs Tariff (ITC-HS)",
        "status": "Statutory Customs & GST Tariff Classification",
        "sector": f"Customs Tariff Chapter {chapter} — Harmonized Nomenclature",
        "scope": f"Statutory commodity and trade classification under HS Code {code}: {desc}.",
        "products": desc,
        "materials": f"Classified under Chapter {chapter} of Indian Customs Tariff",
        "testing": "Conformity to notified DGFT import/export conditions and linked mandatory BIS QCO orders",
        "marking": f"HS Code {code} on commercial shipping invoices, GST returns, and customs clearance bills",
        "amendments": f"Related Tariff Headings: {related_str}"
    }

def find_item_for_comparison(query_str: str, all_standards: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not query_str:
        return None

    trimmed = query_str.strip()
    q_norm = normalize_code(trimmed)

    # 1. Check if explicitly an HSN query (e.g. "HSN 8432", "0101.29.10", "8432", "0201.30.00")
    if re.search(r'\b(hsn|hs\s*code|itc[\s-]*hs)\b', trimmed, re.IGNORECASE) or re.match(r'^\d{4}(?:[.\s]?\d{2}){0,2}$', trimmed):
        hsn = lookup_hsn(trimmed)
        if hsn:
            return _format_hsn_for_comparison(hsn)

    # 2. Check Indian Standards by ID
    for s in all_standards:
        sid_norm = normalize_code(s.get("id", ""))
        if q_norm == sid_norm or q_norm in sid_norm or sid_norm in q_norm:
            return _format_standard_for_comparison(s)

    # 3. Check Indian Standards by numeric code (e.g. 302, 2347, 17803)
    num_match = re.search(r'\b(\d{3,5})\b', trimmed)
    if num_match:
        target_num = num_match.group(1)
        for s in all_standards:
            s_main_num = re.search(r'\bIS\s*(\d+)', s.get("id", ""), re.IGNORECASE)
            if s_main_num and s_main_num.group(1) == target_num:
                return _format_standard_for_comparison(s)

    # 4. Check HSN catalog by code or description keywords
    hsn = lookup_hsn(trimmed)
    if hsn:
        return _format_hsn_for_comparison(hsn)

    # 5. Check Indian Standards by product keywords
    q_lower = trimmed.lower()
    for s in all_standards:
        if any(p in q_lower for p in s.get("applicable_products", [])):
            return _format_standard_for_comparison(s)
        if q_lower in s.get("title", "").lower():
            return _format_standard_for_comparison(s)

    return None

def compare_standards(std_a_query: str, std_b_query: str) -> Dict[str, Any]:
    """
    Generate structured side-by-side comparison between two Indian Standards,
    two HSN Codes, or cross-comparison of an Indian Standard with an HSN Code.
    """
    standards = load_standards_metadata()

    item_a = find_item_for_comparison(std_a_query, standards)
    item_b = find_item_for_comparison(std_b_query, standards)

    # Fallbacks if an entry was not resolved
    if not item_a or not item_b:
        if not item_a and standards:
            item_a = _format_standard_for_comparison(standards[0])
        if not item_b and standards:
            item_b = _format_standard_for_comparison(standards[1] if len(standards) > 1 else standards[0])

    sum_a = item_a
    sum_b = item_b

    comparison_table = [
        {"attribute": "Classification / Standard Code", "std_a": sum_a["id"], "std_b": sum_b["id"]},
        {"attribute": "Official Title / Description", "std_a": sum_a["title"], "std_b": sum_b["title"]},
        {"attribute": "Regulatory Regime Type", "std_a": sum_a["type"], "std_b": sum_b["type"]},
        {"attribute": "Edition / Tariff Version", "std_a": sum_a["year"], "std_b": sum_b["year"]},
        {"attribute": "Statutory Enforcement Status", "std_a": sum_a["status"], "std_b": sum_b["status"]},
        {"attribute": "Regulated Sector / Chapter", "std_a": sum_a["sector"], "std_b": sum_b["sector"]},
        {"attribute": "Scope & Application", "std_a": sum_a["scope"], "std_b": sum_b["scope"]},
        {"attribute": "Applicable Products / Commodity", "std_a": sum_a["products"], "std_b": sum_b["products"]},
        {"attribute": "Material & Classification Base", "std_a": sum_a["materials"], "std_b": sum_b["materials"]},
        {"attribute": "Mandatory Testing & Conformity", "std_a": sum_a["testing"], "std_b": sum_b["testing"]},
        {"attribute": "Marking, Stamping & Invoicing", "std_a": sum_a["marking"], "std_b": sum_b["marking"]},
        {"attribute": "Recent Amendments / Tariff Links", "std_a": sum_a["amendments"], "std_b": sum_b["amendments"]}
    ]

    is_cross = sum_a["type"] != sum_b["type"]
    if is_cross:
        key_differences = [
            f"1. **Regulatory Scope:** {sum_a['id']} is an {sum_a['type']}, whereas {sum_b['id']} is a {sum_b['type']}.",
            f"2. **Harmonization Relationship:** Indian Standards define mandatory domestic safety, durability, and testing criteria under BIS QCOs, while HSN codes govern customs tariff classification, GST rates, and DGFT import/export policies.",
            f"3. **Compliance Requirement:** Manufacturers require BIS ISI certification under the relevant IS standard and must declare the corresponding HSN code on tax invoices and shipping bills."
        ]
        harmonization = "Cross-regulatory mapping: Compliance with Indian Standards ensures conformity for domestic manufacture and sale, while HSN classification ensures correct customs duties and statutory GST compliance."
    else:
        key_differences = [
            f"1. **Scope & Commodity Focus:** {sum_a['id']} governs '{sum_a['products'][:60]}', while {sum_b['id']} governs '{sum_b['products'][:60]}'.",
            f"2. **Statutory Status:** {sum_a['id']} mandates '{sum_a['status']}', whereas {sum_b['id']} mandates '{sum_b['status']}'.",
            f"3. **Marking & Verification:** {sum_a['id']} requires {sum_a['marking'][:80]}, compared to {sum_b['id']} which requires {sum_b['marking'][:80]}."
        ]
        harmonization = f"Both entries are harmonized under official Indian regulatory frameworks (Bureau of Indian Standards and Directorate General of Foreign Trade)."

    return {
        "success": True,
        "standard_a": sum_a,
        "standard_b": sum_b,
        "comparison_table": comparison_table,
        "differences": [
            {"feature": row["attribute"], "a_val": row["std_a"], "b_val": row["std_b"]}
            for row in comparison_table
        ],
        "key_differences": key_differences,
        "harmonization": harmonization
    }
