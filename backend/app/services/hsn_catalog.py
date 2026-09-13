import csv
import re
from pathlib import Path
from typing import Optional, Dict, Any, List

HS_CODES_MAP: Dict[str, Any] = {}
HS_CODES_LIST: List[Dict[str, str]] = []

def _load_hsn_csv():
    global HS_CODES_MAP, HS_CODES_LIST
    if HS_CODES_MAP:
        return

    candidates = [
        Path(__file__).resolve().parent.parent.parent / "hs_codes.csv",
        Path(__file__).resolve().parent.parent.parent.parent / "hs_codes.csv",
        Path(__file__).resolve().parent.parent / "data" / "hs_codes.csv",
        Path("/Users/bishalshrestha/Documents/Hackathon/hs_codes.csv")
    ]

    csv_path = None
    for p in candidates:
        if p.exists():
            csv_path = p
            break

    if not csv_path:
        return

    try:
        with open(csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.reader(f)
            next(reader, None)  # Skip header
            for row in reader:
                if len(row) >= 2:
                    code = row[0].strip()
                    desc = row[1].strip()
                    if code:
                        hs_map_key = code
                        HS_CODES_MAP[hs_map_key] = desc
                        digits = ''.join(c for c in code if c.isdigit())
                        if digits:
                            HS_CODES_MAP[digits] = (code, desc)
                        HS_CODES_LIST.append({"hs_code": code, "description": desc})
    except Exception as e:
        print(f"[HSN Catalog Warning] Failed to load CSV: {e}")

_load_hsn_csv()

def lookup_hsn(raw_query: str) -> Optional[Dict[str, Any]]:
    """
    Search HSN directory by exact code, formatted digits, or product keywords.
    Returns matched HSN code, description, and related headings/sub-items.
    """
    _load_hsn_csv()
    if not raw_query:
        return None

    trimmed = raw_query.strip()
    clean = re.sub(r'^(hsn|hs\s*code|itc[\s-]*hs)\s*', '', trimmed, flags=re.IGNORECASE).strip()
    digits = ''.join(c for c in clean if c.isdigit())

    matched_item = None

    # 1. Exact match by formatted code (e.g. 0101.29.10 or 8432)
    if clean in HS_CODES_MAP and isinstance(HS_CODES_MAP[clean], str):
        matched_item = {"hs_code": clean, "description": HS_CODES_MAP[clean]}

    # 2. Match by raw digits (e.g. 01012910 -> 0101.29.10)
    elif digits and digits in HS_CODES_MAP:
        val = HS_CODES_MAP[digits]
        if isinstance(val, tuple):
            matched_item = {"hs_code": val[0], "description": val[1]}
        else:
            matched_item = {"hs_code": clean, "description": val}

    # 3. Prefix match on 4+ digits
    elif digits and len(digits) >= 4:
        for x in HS_CODES_LIST:
            x_digits = ''.join(c for c in x["hs_code"] if c.isdigit())
            if x_digits.startswith(digits):
                matched_item = x
                break

    # 4. Keyword search in description (e.g. 'boneless', 'horses for polo', 'tuna')
    if not matched_item and len(clean) >= 3:
        clean_kw = clean.lower()
        for x in HS_CODES_LIST:
            if clean_kw in x["description"].lower():
                matched_item = x
                break

    if not matched_item:
        return None

    # Find related items under same 4-digit heading
    matched_code = matched_item["hs_code"]
    prefix4 = matched_code[:4]
    related = []
    for item in HS_CODES_LIST:
        if item["hs_code"].startswith(prefix4) and item["hs_code"] != matched_code:
            related.append({"hs_code": item["hs_code"], "description": item["description"]})
            if len(related) >= 8:
                break

    return {
        "hs_code": matched_item["hs_code"],
        "description": matched_item["description"],
        "related_items": related
    }
