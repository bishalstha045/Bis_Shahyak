import json
import os
from fastapi import APIRouter, Query
from typing import Optional, List
from app.services.retriever import retrieve_documents

router = APIRouter()

@router.get("/search")
async def search_standards(
    q: str = Query(..., description="Keyword or standard number to search"),
    sector: Optional[str] = Query(None, description="Optional sector filter"),
    limit: int = Query(10, description="Max results")
):
    """Direct search for BIS standards, titles, and clauses."""
    chunks = await retrieve_documents(query=q, sector=sector)
    
    # Format distinct standards
    standards_map = {}
    for c in chunks:
        sid = c["standard_id"]
        if sid not in standards_map:
            standards_map[sid] = {
                "standard_id": sid,
                "title": c["standard_title"],
                "relevance": int(c["relevance_score"] * 100),
                "url": c["source_url"],
                "clauses": []
            }
        standards_map[sid]["clauses"].append({
            "section": c["section"],
            "page": c["page"],
            "snippet": c["content"][:200] + "..."
        })
        
    return {
        "query": q,
        "count": len(standards_map),
        "results": list(standards_map.values())[:limit]
    }
