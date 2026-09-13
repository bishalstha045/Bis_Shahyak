from typing import List, Dict, Any, Optional

def calculate_confidence(
    chunks: Optional[List[Dict[str, Any]]] = None,
    *args,
    **kwargs
) -> int:
    """
    Calculate confidence score (0 - 100 percentage) based on multi-factor retrieval quality:
    1. Number of relevant chunks retrieved (weight 0.3)
    2. Average relevance / cosine similarity score of top chunks (weight 0.5)
    3. Source diversity (distinct standard IDs cited) (weight 0.2)
    Accepts variable arguments (*args, **kwargs) for backward compatibility across pipeline callers.
    """
    # Resolve chunks if passed as positional arguments
    target_chunks = chunks
    if target_chunks is None and args:
        for arg in args:
            if isinstance(arg, list):
                target_chunks = arg
                break

    if not target_chunks or not isinstance(target_chunks, list) or len(target_chunks) == 0:
        return 30
    
    # Factor 1: Chunk count (up to 5 chunks is optimal)
    count_factor = min(len(target_chunks) / 5.0, 1.0) * 0.30
    
    # Factor 2: Average relevance score
    avg_relevance = sum(float(c.get("relevance_score", 0.7)) for c in target_chunks) / len(target_chunks)
    relevance_factor = min(max(avg_relevance, 0.0), 1.0) * 0.50
    
    # Factor 3: Source diversity
    unique_standards = len(set(c.get("standard_id", "") for c in target_chunks if c.get("standard_id")))
    diversity_factor = min(unique_standards / 2.0, 1.0) * 0.20
    
    total = count_factor + relevance_factor + diversity_factor
    # Return integer percentage 25% - 98%
    score_pct = int(round(min(max(total, 0.25), 0.98) * 100))
    return score_pct

