from typing import List, Dict, Any

def calculate_confidence(chunks: List[Dict[str, Any]]) -> float:
    """
    Calculate confidence score based on multi-factor retrieval quality:
    1. Number of relevant chunks retrieved (weight 0.3)
    2. Average relevance / cosine similarity score of top chunks (weight 0.5)
    3. Source diversity (distinct standard IDs cited) (weight 0.2)
    """
    if not chunks:
        return 0.15
    
    # Factor 1: Chunk count (up to 5 chunks is optimal)
    count_factor = min(len(chunks) / 5.0, 1.0) * 0.30
    
    # Factor 2: Average relevance score
    avg_relevance = sum(float(c.get("relevance_score", 0.7)) for c in chunks) / len(chunks)
    relevance_factor = min(max(avg_relevance, 0.0), 1.0) * 0.50
    
    # Factor 3: Source diversity
    unique_standards = len(set(c.get("standard_id", "") for c in chunks if c.get("standard_id")))
    diversity_factor = min(unique_standards / 2.0, 1.0) * 0.20
    
    total = count_factor + relevance_factor + diversity_factor
    # Bound between 0.40 and 0.99 for good matches
    return round(min(max(total, 0.25), 0.98), 2)
