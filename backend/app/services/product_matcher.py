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
    
    # 1. Domestic Pressure Cookers
    if any(k in q_lower for k in ["pressure cooker", "cooker", "aluminium cooker", "steel cooker", "कुकर", "प्रेशर कुकर"]):
        profile["product_name"] = "Domestic Pressure Cooker"
        profile["product_category"] = "Consumer Goods & Utensils"
        profile["material"] = "Wrought Aluminium Alloy (IS 21) or Austenitic Stainless Steel SS 304 (IS 6911)"
        profile["characteristics"] = [
            "Food-contact grade body with steam-tight lid",
            "Operating pressure regulating vent weight (90-110 kPa)",
            "Fusible safety relief plug and gasket release mechanism",
            "Hydrostatic burst pressure resistance >= 300 kPa"
        ]
        profile["intended_use"] = "Rapid pressure-cooking and steam preparation of food items in households"
        profile["is_recognized"] = True

    # 2. Electric Storage Water Heaters (Geysers)
    elif any(k in q_lower for k in ["water heater", "geyser", "electric geyser", "storage geyser", "गीजर", "वाटर हीटर"]):
        profile["product_name"] = "Stationary Storage Electric Water Heater (Geyser)"
        profile["product_category"] = "Household Electrical & Electronics"
        profile["material"] = "Corrosion-resistant steel pressure tank with polyurethane foam insulation & mineral-insulated element"
        profile["characteristics"] = [
            "Operating pressure vessel up to 0.8 MPa (8 bar)",
            "Non-self-resetting thermal cut-out and adjustable thermostat",
            "Hydrostatic test withstanding 1.5x working pressure (min 1.2 MPa)",
            "Dielectric flashover resistance at 1250V AC and leakage current < 0.75 mA"
        ]
        profile["intended_use"] = "Safe domestic heating and pressurized storage of potable hot water"
        profile["is_recognized"] = True

    # 3. Sports Footwear
    elif any(k in q_lower for k in ["sports footwear", "sports shoes", "footwear", "sneakers", "running shoes", "athletic shoes", "जूते", "जूता"]):
        profile["product_name"] = "Sports Footwear (General Purpose / Professional)"
        profile["product_category"] = "Footwear & Sports Goods"
        profile["material"] = "Synthetic leather/textile upper with molded EVA/rubber outsole"
        profile["characteristics"] = [
            "Chemical harmlessness: free from banned azo dyes (<30 mg/kg) and heavy metals",
            "Sole abrasion resistance <= 250 mm³ on DIN drum",
            "Flexing resistance >= 50,000 cycles without crack propagation",
            "Upper-to-sole bonding strength >= 3.0 N/mm"
        ]
        profile["intended_use"] = "Recreational athletics, running, gym workouts, and daily fitness activities"
        profile["is_recognized"] = True

    # 4. Automated Blood Pressure Monitors
    elif any(k in q_lower for k in ["blood pressure", "sphygmomanometer", "bp monitor", "bp apparatus", "बीपी मशीन", "रक्तचाप"]):
        profile["product_name"] = "Automated Non-Invasive Sphygmomanometer (BP Monitor)"
        profile["product_category"] = "Medical & Healthcare Devices"
        profile["material"] = "Medical-grade polymer casing, nylon cuff, and oscillometric pressure transducer"
        profile["characteristics"] = [
            "Cuff pressure indication accuracy within ±3 mmHg (±0.4 kPa)",
            "Clinical accuracy validation conforming to ISO 81060-2",
            "Type BF applied part patient electrical isolation (< 500 uA leakage)",
            "Automatic secondary overpressure safety venting limit > 300 mmHg"
        ]
        profile["intended_use"] = "Clinical and domestic diagnostic measurement of human arterial blood pressure"
        profile["is_recognized"] = True

    # 5. Medical Respirators
    elif any(k in q_lower for k in ["respirator", "n95", "ffp2", "medical mask", "मास्क", "श्वसन मास्क"]):
        profile["product_name"] = "Medical Respirator (N95 / FFP2)"
        profile["product_category"] = "Medical & Healthcare Devices"
        profile["material"] = "Multi-layer non-woven polypropylene with electrostatic meltblown filtration layer"
        profile["characteristics"] = [
            "Particulate filtration efficiency >= 95% at 0.3 micron aerosol",
            "Bacterial filtration efficiency >= 98% with Staphylococcus aureus",
            "Total inward leakage of face seal <= 8%",
            "Synthetic blood splash penetration resistance at 120 mmHg"
        ]
        profile["intended_use"] = "Respiratory infection control and barrier protection against pathogenic biological aerosols"
        profile["is_recognized"] = True

    # 6. Sterile Surgical Gloves
    elif any(k in q_lower for k in ["surgical glove", "rubber glove", "sterile glove", "latex glove", "दस्ताने"]):
        profile["product_name"] = "Single-Use Sterile Rubber Surgical Gloves"
        profile["product_category"] = "Medical & Healthcare Devices"
        profile["material"] = "Natural Rubber Latex or Synthetic Polyisoprene / Nitrile"
        profile["characteristics"] = [
            "Pre-sterilized by ethylene oxide (EtO) or radiation (SAL 10^-6)",
            "Water tightness barrier integrity conforming to AQL 0.65",
            "Tensile strength >= 24 MPa (before aging) and >= 18 MPa (after aging)",
            "Biocompatible with zero primary skin irritation"
        ]
        profile["intended_use"] = "Invasive surgical procedures to prevent microbial cross-contamination"
        profile["is_recognized"] = True

    # 7. Drinking Water & Milk
    elif any(k in q_lower for k in ["milk", "pasteurized milk", "दूध"]):
        profile["product_name"] = "Packaged Pasteurized Milk"
        profile["product_category"] = "Food, Dairy & Public Health"
        profile["material"] = "Pure bovine liquid milk (HTST pasteurized, 72°C for 15s)"
        profile["characteristics"] = [
            "Milk fat: Toned >= 3.0%, Standardized >= 4.5%, Full Cream >= 6.0%",
            "Solids-Not-Fat (SNF) >= 8.5%",
            "Negative alkaline phosphatase enzyme activity",
            "Zero chemical adulterants (neutralizers, urea, detergent, starch)"
        ]
        profile["intended_use"] = "Direct human fluid nutrition and culinary preparation"
        profile["is_recognized"] = True

    elif any(k in q_lower for k in ["drinking water", "potable water", "पानी", "पेयजल"]):
        profile["product_name"] = "Drinking Water (Potable)"
        profile["product_category"] = "Food, Beverages & Public Health"
        profile["material"] = "Treated Potable Water"
        profile["characteristics"] = [
            "TDS < 500 mg/L, Turbidity < 1 NTU, pH 6.5-8.5",
            "Toxic heavy metals: Lead < 0.01 mg/L, Arsenic < 0.01 mg/L, Mercury < 0.001 mg/L",
            "Zero Coliform and E. coli in any 100 ml sample",
            "Residual free chlorine 0.2 to 1.0 mg/L"
        ]
        profile["intended_use"] = "Human consumption, cooking, and food processing"
        profile["is_recognized"] = True

    # 8. Textiles & Bed Linen
    elif any(k in q_lower for k in ["bedsheet", "pillow", "blanket", "bed linen", "बेडशीट"]):
        profile["product_name"] = "Bedsheet, Pillow Cover & Blanket Cover"
        profile["product_category"] = "Textiles & Apparels"
        profile["material"] = "100% Woven Cotton or Cotton-Polyester Blend"
        profile["characteristics"] = [
            "Aqueous extract pH strictly 5.5 to 7.5 for skin contact safety",
            "Color fastness to washing and perspiration rating >= 4",
            "Shrinkage stability: maximum 3.0% warp / 2.0% weft",
            "Free from banned carcinogenic aromatic azo dyes"
        ]
        profile["intended_use"] = "Domestic and institutional hospital/hospitality bed covering"
        profile["is_recognized"] = True

    # 9. Cement & Concrete Moulds
    elif any(k in q_lower for k in ["cement", "portland", "opc", "lc3", "सीमेंट"]):
        profile["product_name"] = "Portland Cement (OPC / Calcined Clay LC3)"
        profile["product_category"] = "Civil Engineering & Construction"
        profile["material"] = "Hydraulic Calcium Silicate Clinker with Gypsum & Mineral Additions"
        profile["characteristics"] = [
            "Blaine fineness >= 225 m²/kg (OPC) or >= 350 m²/kg (LC3)",
            "Soundness: Le-Chatelier < 10 mm, Autoclave < 0.8%",
            "Setting time: Initial >= 30 min, Final <= 600 min",
            "28-Day compressive strength: >= 33, 43, or 53 MPa"
        ]
        profile["intended_use"] = "Reinforced concrete structures, bridges, highways, and residential infrastructure"
        profile["is_recognized"] = True

    # 10. Protective Helmets
    elif any(k in q_lower for k in ["helmet", "two wheeler", "motorcycle helmet", "crash helmet", "हेलमेट"]):
        profile["product_name"] = "Protective Helmet for Two-Wheeler Riders"
        profile["product_category"] = "Automotive Safety & Personal Protection"
        profile["material"] = "Rigid ABS/Polycarbonate Shell with Expanded Polystyrene (EPS) Liner"
        profile["characteristics"] = [
            "Impact attenuation at 7.5 m/s (peak deceleration <= 300g)",
            "Dynamic retention chinstrap elongation <= 25 mm under 10 kg drop",
            "Total helmet mass <= 1500 grams with scratch-resistant visor",
            "Conical striker penetration resistance"
        ]
        profile["intended_use"] = "Head injury mitigation and crash safety for motorcycle and scooter riders"
        profile["is_recognized"] = True

    # 11. Switched Sockets & Electrical Accessories
    elif any(k in q_lower for k in ["socket", "switch socket", "switched socket", "plug", "सॉकेट"]):
        profile["product_name"] = "Switched Socket-Outlet for Fixed Installations"
        profile["product_category"] = "Electrical Accessories & Home Safety"
        profile["material"] = "Flame-retardant Polycarbonate with Phosphor Bronze Terminals"
        profile["characteristics"] = [
            "Automatic child-proof safety shutters over live and neutral apertures",
            "Plug withdrawal retention force between 5 N and 54 N",
            "Terminal temperature rise < 45K at 1.1x rated current (17.6A)",
            "Glow-wire resistance at 850°C without sustaining fire"
        ]
        profile["intended_use"] = "Fixed domestic and commercial electrical installations"
        profile["is_recognized"] = True

    # 12. Electric Irons & Washing Machines
    elif any(k in q_lower for k in ["iron", "electric iron", "steam iron", "इस्त्री"]):
        profile["product_name"] = "Electric Iron (Dry / Steam)"
        profile["product_category"] = "Household Electrical & Electronics"
        profile["material"] = "Die-cast aluminium soleplate with bimetallic thermostat and thermal fuse"
        profile["characteristics"] = [
            "Ground bond earthing resistance <= 0.1 ohm at 25A current",
            "Soleplate temperature regulation <= 250°C and handle touch rise < 30K",
            "Mechanical drop endurance: 100 drops from 150 mm on soleplate",
            "Power cord flexing endurance >= 20,000 cycles"
        ]
        profile["intended_use"] = "Domestic and commercial garment pressing and ironing"
        profile["is_recognized"] = True

    elif any(k in q_lower for k in ["washing machine", "washer", "वाशिंग मशीन"]):
        profile["product_name"] = "Household Washing Machine"
        profile["product_category"] = "Household Electrical & Electronics"
        profile["material"] = "Motorized agitator/drum assembly with IPX4 splash-proof enclosure"
        profile["characteristics"] = [
            "Moisture ingress protection (IPX4) with 1250V dielectric insulation",
            "Spin lid mechanical interlock braking drum within 4 seconds",
            "Water inlet hose pressure resistance >= 1.0 MPa"
        ]
        profile["intended_use"] = "Domestic laundry washing and spin extraction"
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
