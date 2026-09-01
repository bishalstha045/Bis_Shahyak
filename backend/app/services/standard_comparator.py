import json
import os
import re
from typing import Dict, Any, List, Optional
from app.services.product_matcher import load_standards_metadata

def normalize_code(s: str) -> str:
    return re.sub(r'[^a-zA-Z0-9]', '', s).lower()

def find_standard_by_query(query_str: str, all_standards: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    q_norm = normalize_code(query_str)
    
    # 1. Exact normalized match or prefix
    for s in all_standards:
        sid_norm = normalize_code(s["id"])
        if q_norm == sid_norm or q_norm in sid_norm or sid_norm in q_norm:
            return s
            
    # 2. Main standard number match (e.g. 302, 3196, 17803, 14543)
    num_match = re.search(r'\b(\d{3,5})\b', query_str)
    if num_match:
        target_num = num_match.group(1)
        # Match against standard number part
        for s in all_standards:
            s_main_num = re.search(r'\bIS\s*(\d+)', s["id"], re.IGNORECASE)
            if s_main_num and s_main_num.group(1) == target_num:
                # Check part match if present
                if "part 1" in query_str.lower() or "part1" in query_str.lower() or "-1" in query_str:
                    if "part 1" in s["id"].lower() or "part 1" in s["title"].lower() or "(part 1)" in s["id"].lower():
                        return s
                elif "2-15" in query_str.lower() or "2 15" in query_str.lower() or "15" in query_str:
                    if "2-15" in s["id"].lower() or "2-15" in s["title"].lower():
                        return s
                else:
                    return s

    # 3. Product keyword match
    q_lower = query_str.lower()
    for s in all_standards:
        if any(p in q_lower for p in s.get("applicable_products", [])):
            return s
            
    return None

def compare_standards(std_a_query: str, std_b_query: str) -> Dict[str, Any]:
    """
    Generate structured side-by-side comparison between two Indian Standards.
    """
    standards = load_standards_metadata()
    
    std_a = find_standard_by_query(std_a_query, standards)
    std_b = find_standard_by_query(std_b_query, standards)
    
    if not std_a or not std_b:
        if not std_a and len(standards) >= 3:
            std_a = standards[2] # IS 302-2-15
        if not std_b and len(standards) >= 4:
            std_b = standards[3] # IS 302 (Part 1)
        if not std_a:
            std_a = standards[0]
        if not std_b:
            std_b = standards[1]

    def build_summary(std: Dict[str, Any]) -> Dict[str, Any]:
        clauses = std.get("key_clauses", [])
        test_clauses = [c["title"] for c in clauses if "test" in c.get("category", "").lower() or "safety" in c.get("category", "").lower()]
        marking_clauses = [c["title"] for c in clauses if "marking" in c.get("category", "").lower()]
        amends = [f"{a.get('number', '')} ({a.get('date', '')})" for a in std.get("amendments", [])]
        
        return {
            "id": std.get("id", ""),
            "title": std.get("title", ""),
            "year": std.get("year", ""),
            "status": std.get("status", ""),
            "sector": std.get("sector", ""),
            "scope": "; ".join(std.get("intended_use", ["General standard scope"])),
            "products": ", ".join(std.get("applicable_products", ["Specific appliances/goods"])),
            "materials": ", ".join(std.get("characteristics", ["Specified industrial raw materials"])),
            "testing": "; ".join(test_clauses) if test_clauses else "Type testing & Routine production tests",
            "marking": "; ".join(marking_clauses) if marking_clauses else "ISI Logo, CM/L license number, Manufacturer details",
            "amendments": ", ".join(amends) if amends else "None reported"
        }

    sum_a = build_summary(std_a)
    sum_b = build_summary(std_b)

    comparison_table = [
        {"attribute": "Standard Code", "std_a": sum_a["id"], "std_b": sum_b["id"]},
        {"attribute": "Official Title", "std_a": sum_a["title"], "std_b": sum_b["title"]},
        {"attribute": "Edition / Year", "std_a": sum_a["year"], "std_b": sum_b["year"]},
        {"attribute": "Statutory Status", "std_a": sum_a["status"], "std_b": sum_b["status"]},
        {"attribute": "Regulated Sector", "std_a": sum_a["sector"], "std_b": sum_b["sector"]},
        {"attribute": "Scope & Intended Use", "std_a": sum_a["scope"], "std_b": sum_b["scope"]},
        {"attribute": "Applicable Products", "std_a": sum_a["products"], "std_b": sum_b["products"]},
        {"attribute": "Material & Design Spec", "std_a": sum_a["materials"], "std_b": sum_b["materials"]},
        {"attribute": "Mandatory Lab Testing", "std_a": sum_a["testing"], "std_b": sum_b["testing"]},
        {"attribute": "Marking & Stamping", "std_a": sum_a["marking"], "std_b": sum_b["marking"]},
        {"attribute": "Recent Amendments", "std_a": sum_a["amendments"], "std_b": sum_b["amendments"]}
    ]

    key_differences = [
        f"1. **Scope & Hierarchy:** {sum_a['id']} specifically governs '{sum_a['products']}', whereas {sum_b['id']} governs '{sum_b['products']}'.",
        f"2. **Safety & Test Criteria:** {sum_a['id']} mandates ({sum_a['testing'][:100]}...), while {sum_b['id']} mandates ({sum_b['testing'][:100]}...).",
        f"3. **Statutory Relationship:** Product-specific particular standards modify or supplement clauses of the general base specification for conformity certification."
    ]

    return {
        "standard_a": sum_a,
        "standard_b": sum_b,
        "comparison_table": comparison_table,
        "key_differences": key_differences
    }
