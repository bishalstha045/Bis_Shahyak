import os
import json
import re
from typing import Dict, Any, List, Optional

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "standards_metadata.json")

def load_standards_metadata() -> List[Dict[str, Any]]:
    if os.path.exists(DATA_PATH):
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def extract_product_profile(query: str) -> Dict[str, Any]:
    """
    Extract product name, category, material, and characteristics from user description.
    """
    q_lower = query.lower()
    
    # Defaults
    profile = {
        "product_name": "Unspecified Product",
        "product_category": "General Goods",
        "material": "Standard Materials",
        "characteristics": [],
        "intended_use": "Commercial / Domestic use",
        "is_recognized": False
    }
    
    # 1. Stainless Steel Water Bottles / Flasks
    if any(k in q_lower for k in ["water bottle", "steel bottle", "vacuum flask", "flask", "thermo steel", "insulated bottle", "stainless steel bottle", "बोतल", "स्टील बोतल"]):
        profile["product_name"] = "Stainless Steel Water Bottle / Vacuum Flask"
        profile["product_category"] = "Consumer Goods & Utensils"
        profile["material"] = "Austenitic Stainless Steel (Grade SS 304 / SS 316 / IS 6911)"
        profile["characteristics"] = [
            "Food contact grade stainless steel (SS 304 / SS 316)",
            "Vacuum thermal insulation (if double-walled) or single-wall",
            "Cap with food-grade silicone sealing gasket",
            "Capacity range: 250 ml to 2000 ml"
        ]
        profile["intended_use"] = "Safe storage and thermal temperature retention of potable drinking water and beverages"
        profile["is_recognized"] = True

    # 2. Electric Kettles / Heating Appliances
    elif any(k in q_lower for k in ["kettle", "electric kettle", "water heater", "tea maker", "कैटल", "इलेक्ट्रिक केतली"]):
        profile["product_name"] = "Electric Kettle / Liquid Heating Appliance"
        profile["product_category"] = "Electrical & Consumer Electronics"
        profile["material"] = "Stainless Steel / Food-grade Polymer body with Concealed Stainless Steel Element"
        profile["characteristics"] = [
            "Rated voltage 230V AC, 50 Hz single phase",
            "Rated power input: 500W to 2200W",
            "Automatic shut-off and boil-dry thermal cut-out protection",
            "Cordless 360-degree connector base with grounding pin"
        ]
        profile["intended_use"] = "Rapid boiling and thermal heating of water and potable liquids for household consumption"
        profile["is_recognized"] = True

    # 3. LPG Cylinders / Gas Pressure Vessels
    elif any(k in q_lower for k in ["cylinder", "lpg", "gas bottle", "सिलेंडर", "एलपीजी", "गैस"]):
        profile["product_name"] = "Welded Low Carbon Steel LPG Cylinder"
        profile["product_category"] = "Pressure Vessels & Gas"
        profile["material"] = "Low Carbon Deep Drawing Quality Steel Sheet (IS 6240 Grade 1)"
        profile["characteristics"] = [
            "Water capacity 5 Litres to 130 Litres (14.2 kg domestic / 19 kg commercial)",
            "Welded circumferential & longitudinal seams",
            "Hydrostatic test proof pressure: 2.45 MPa (25 kgf/cm²)",
            "Integrated valve protection collar shroud"
        ]
        profile["intended_use"] = "Safe containment, transportation, and domestic/commercial storage of liquefied petroleum gas (LPG)"
        profile["is_recognized"] = True

    # 4. Packaged Drinking Water & Bottles
    elif any(k in q_lower for k in ["packaged water", "mineral water", "drinking water", "water plant", "पानी", "पैकेज्ड पानी"]):
        profile["product_name"] = "Packaged Drinking Water & Plastic Containers"
        profile["product_category"] = "Food Products & Beverages / Packaging"
        profile["material"] = "Potable Treated Water + Food-Grade PET/Polycarbonate Containers (IS 15410)"
        profile["characteristics"] = [
            "Processed via multi-barrier filtration, RO, UV, and ozonation",
            "TDS < 500 mg/L, Total Hardness < 200 mg/L, Zero heavy metals",
            "Microbiological sterility (Zero Coliforms / E. Coli in 250 ml)",
            "Packaged in tamper-evident sealed virgin food-grade containers"
        ]
        profile["intended_use"] = "Direct human consumption and retail packaged potable hydration"
        profile["is_recognized"] = True

    # 5. Toys & Children Products
    elif any(k in q_lower for k in ["toy", "toys", "children", "baby game", "खिलौने", "टॉय"]):
        profile["product_name"] = "Toys for Children (Under 14 Years)"
        profile["product_category"] = "Toys & Children Goods"
        profile["material"] = "Non-toxic Polymers, Wood, Metal, or Coated Textiles"
        profile["characteristics"] = [
            "Designed for play by children up to 14 years old",
            "No small parts for children under 36 months (choking hazard cylinder test)",
            "Smooth hemmed edges and protected sharp points",
            "Heavy element migration (Lead < 90 mg/kg, Cadmium < 75 mg/kg)"
        ]
        profile["intended_use"] = "Recreation, cognitive learning, and active play for infants and children"
        profile["is_recognized"] = True

    # 6. Gold Jewellery & Hallmarking
    elif any(k in q_lower for k in ["gold", "jewellery", "hallmark", "huid", "सोना", "आभूषण"]):
        profile["product_name"] = "Gold Jewellery & Articles"
        profile["product_category"] = "Precious Metals & Jewellery"
        profile["material"] = "Gold Alloy (24K, 22K 916, 18K 750, 14K 585)"
        profile["characteristics"] = [
            "Standard recognized Karat and fineness grade",
            "Zero negative tolerance on declared gold purity",
            "Laser engraved tripartite hallmark with 6-digit alphanumeric HUID"
        ]
        profile["intended_use"] = "Consumer retail jewellery, ornament wear, and certified bullion investment"
        profile["is_recognized"] = True

    # 7. Lithium-ion Batteries
    elif any(k in q_lower for k in ["battery", "lithium", "power bank", "cells", "बैटरी"]):
        profile["product_name"] = "Secondary Lithium-ion Cells & Battery Packs"
        profile["product_category"] = "Electronics, Energy & EV"
        profile["material"] = "Lithium Cobalt/Phosphate Chemistry with Non-Acid Electrolyte"
        profile["characteristics"] = [
            "Rechargeable secondary lithium cells for portable electronics",
            "Continuous overcharge & 55°C external short circuit protection",
            "130°C thermal abuse and 1-meter drop shock resistance"
        ]
        profile["intended_use"] = "Energy storage and power supply for smartphones, laptops, power banks, and portable tools"
        profile["is_recognized"] = True

    # 8. Helmets
    elif any(k in q_lower for k in ["helmet", "two wheeler", "motorcycle helmet", "हेलमेट"]):
        profile["product_name"] = "Protective Helmet for Two-Wheeler Riders"
        profile["product_category"] = "Automotive Safety & Consumer Goods"
        profile["material"] = "Rigid ABS/Polycarbonate Shell with Expanded Polystyrene (EPS) Liner"
        profile["characteristics"] = [
            "Impact attenuation at 7.5 m/s impact velocity (peak deceleration < 300g)",
            "Dynamic retention chinstrap system with quick-release buckle",
            "Weight limit <= 1.2 kg with anti-scratch visor"
        ]
        profile["intended_use"] = "Head protection and crash injury prevention for two-wheeler riders"
        profile["is_recognized"] = True

    # 9. Plugs & Sockets
    elif any(k in q_lower for k in ["plug", "socket", "extension cord", "plugs", "प्लग"]):
        profile["product_name"] = "Plugs and Socket-Outlets (6A / 16A, 250V)"
        profile["product_category"] = "Electrical Accessories"
        profile["material"] = "Flame-retardant Polycarbonate / Bakelite with Brass Terminals"
        profile["characteristics"] = [
            "Rated voltage up to 250V AC, current 6A to 16A",
            "Earth pin first-make last-break engagement geometry",
            "Internal safety shutters preventing single-pin insertion"
        ]
        profile["intended_use"] = "Safe power distribution and electrical mains connection for household/commercial loads"
        profile["is_recognized"] = True

    # 10. Cement
    elif any(k in q_lower for k in ["cement", "portland", "opc", "सीमेंट"]):
        profile["product_name"] = "Ordinary Portland Cement (33, 43, 53 Grade)"
        profile["product_category"] = "Civil Engineering & Building Materials"
        profile["material"] = "Synthetic Calcium Silicate Clinker with Gypsum"
        profile["characteristics"] = [
            "Specific surface (Blaine fineness) >= 225 m²/kg",
            "Initial setting time >= 30 min, Final setting time <= 600 min",
            "28-Day compressive strength: 33, 43, or 53 MPa"
        ]
        profile["intended_use"] = "Structural civil engineering, reinforced concrete, and building construction"
        profile["is_recognized"] = True

    else:
        # Generic query cleanup
        clean_name = re.sub(r'^(i\s+manufacture|we\s+make|we\s+produce|tell\s+me\s+about|what\s+is\s+the\s+standard\s+for|compliance\s+for)\s+', '', q_lower).strip()
        profile["product_name"] = clean_name.title() if clean_name else "Consumer / Industrial Product"
        profile["is_recognized"] = False

    return profile

def match_product_to_standards(query: str) -> Dict[str, Any]:
    """
    Core Product -> Applicable BIS Standards Mapper with explainability and clause evidence.
    """
    standards = load_standards_metadata()
    profile = extract_product_profile(query)
    
    q_lower = query.lower()
    candidate_standards = []
    
    for std in standards:
        std_id = std["id"]
        title = std["title"]
        sector = std.get("sector", "")
        app_prods = std.get("applicable_products", [])
        std_chars = std.get("characteristics", [])
        std_uses = std.get("intended_use", [])
        clauses = std.get("key_clauses", [])
        
        # Match checks
        prod_match = any(p in q_lower or p in profile["product_name"].lower() for p in app_prods)
        category_match = sector.lower() in profile["product_category"].lower() or profile["product_category"].lower() in sector.lower()
        keyword_match = any(word in title.lower() for word in q_lower.split() if len(word) > 3)
        std_id_match = std_id.split(":")[0].lower() in q_lower or std_id.lower() in q_lower
        
        relevance_score = 0
        relevance_label = "Low"
        why_reasons = []
        
        if std_id_match or prod_match:
            relevance_score = 95
            relevance_label = "High"
            why_reasons.append(f"Direct product scope match: Specifically covers '{profile['product_name']}' under BIS gazette scope.")
            why_reasons.append(f"Material specification matches: Requires {profile['material']}.")
            why_reasons.append(f"Mandatory Quality Control Order (QCO) statutory compliance applies.")
        elif category_match and keyword_match:
            relevance_score = 75
            relevance_label = "Medium"
            why_reasons.append(f"Product category match: Governs {sector} category.")
            why_reasons.append(f"Base reference requirements for design, safety, and testing apply.")
        elif keyword_match:
            relevance_score = 55
            relevance_label = "Medium"
            why_reasons.append(f"Related standard in {sector} covering general parameters.")
            
        if relevance_score >= 50:
            evidence_clauses = []
            for c in clauses:
                evidence_clauses.append({
                    "clause_id": c.get("clause_id", ""),
                    "section": c.get("section", ""),
                    "title": c.get("title", ""),
                    "page": str(c.get("page", "1")),
                    "category": c.get("category", "Requirement"),
                    "requirement_text": c.get("requirement_text", ""),
                    "test_method": c.get("test_method", ""),
                    "required_evidence": c.get("required_evidence", ""),
                    "mandatory_qco": c.get("mandatory_qco", True)
                })
                
            candidate_standards.append({
                "standard_id": std_id,
                "title": title,
                "sector": sector,
                "year": std.get("year", "2022"),
                "status": std.get("status", "Current"),
                "effective_date": std.get("effective_date", "Active"),
                "superseded_status": std.get("superseded_status", "Active"),
                "amendments": std.get("amendments", []),
                "relevance_label": relevance_label,
                "relevance_score": relevance_score,
                "why_it_applies": why_reasons,
                "evidence_clauses": evidence_clauses,
                "source_url": std.get("source_url", "https://www.bis.gov.in")
            })
            
    candidate_standards.sort(key=lambda x: x["relevance_score"], reverse=True)
    
    has_evidence = len(candidate_standards) > 0
    message = "Successfully matched applicable Indian Standards from official BIS records." if has_evidence else "Insufficient evidence in the current indexed standards dataset to determine applicability. Please verify with BIS directly at 1800-11-4000 or manakonline.in."
    
    return {
        "has_evidence": has_evidence,
        "message": message,
        "product_profile": profile,
        "applicable_standards": candidate_standards,
        "total_matches": len(candidate_standards)
    }
