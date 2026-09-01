from typing import List, Dict, Any

def chunk_documents(standards_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Split standards and their clause breakdowns into high-density searchable chunks with full V2 metadata.
    """
    chunks = []
    
    for std in standards_data:
        std_id = std.get("id", "Unknown")
        title = std.get("title", "")
        sector = std.get("sector", "General")
        year = std.get("year", "")
        status = std.get("status", "")
        effective_date = std.get("effective_date", "")
        superseded_status = std.get("superseded_status", "")
        amendments = std.get("amendments", [])
        applicable_products = std.get("applicable_products", [])
        characteristics = std.get("characteristics", [])
        intended_use = std.get("intended_use", [])
        source_url = std.get("source_url", "")
        
        # 1. Product mapping & Scope chunk
        prod_str = ", ".join(applicable_products)
        char_str = "; ".join(characteristics)
        use_str = "; ".join(intended_use)
        overview_text = (
            f"Standard {std_id}: {title}.\n"
            f"Sector: {sector} | Year: {year} | Status: {status} | Effective: {effective_date}.\n"
            f"Applicable Products: {prod_str}.\n"
            f"Product Characteristics: {char_str}.\n"
            f"Intended Use: {use_str}."
        )
        
        chunks.append({
            "text": overview_text,
            "metadata": {
                "standard_id": std_id,
                "standard_title": title,
                "section": "Scope, Products & Characteristics",
                "page": "1",
                "category": "Scope",
                "year": year,
                "status": status,
                "sector": sector,
                "source_url": source_url,
                "applicable_products": prod_str,
                "characteristics": char_str,
                "intended_use": use_str
            }
        })
        
        # 2. Structured Clause Chunks
        for clause in std.get("key_clauses", []):
            clause_id = clause.get("clause_id", "")
            clause_sec = clause.get("section", f"Clause {clause_id}")
            clause_title = clause.get("title", "")
            clause_page = str(clause.get("page", "1"))
            category = clause.get("category", "General Requirement")
            req_text = clause.get("requirement_text", "")
            test_method = clause.get("test_method", "")
            required_evidence = clause.get("required_evidence", "")
            mandatory_qco = "Yes (Mandatory QCO)" if clause.get("mandatory_qco", True) else "Voluntary"
            
            chunk_text = (
                f"Standard {std_id} ({title}) - {clause_sec}: {clause_title}.\n"
                f"Category: {category} | Page: {clause_page} | Status: {mandatory_qco}.\n"
                f"Requirement Details: {req_text}\n"
                f"Test Method: {test_method}\n"
                f"Required Compliance Evidence: {required_evidence}"
            )
            
            chunks.append({
                "text": chunk_text,
                "metadata": {
                    "standard_id": std_id,
                    "standard_title": title,
                    "clause_id": clause_id,
                    "section": f"{clause_sec} ({clause_title})",
                    "page": clause_page,
                    "category": category,
                    "year": year,
                    "status": status,
                    "sector": sector,
                    "source_url": source_url,
                    "test_method": test_method,
                    "required_evidence": required_evidence
                }
            })
            
    print(f"Created {len(chunks)} high-density semantic chunks from {len(standards_data)} standards.")
    return chunks
