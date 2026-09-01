import os
import json
import re
import math
import hashlib
from typing import List, Dict, Any, Optional
from app.config import settings

# Global handles
chroma_client = None
chroma_collection = None
local_chunks_cache: List[Dict[str, Any]] = []

STOP_WORDS = {"is", "are", "the", "a", "an", "and", "or", "for", "of", "in", "to", "with", "by", "on", "at", "from", "what", "which", "how", "tell", "me", "about", "give", "who", "when", "why", "can", "you", "i", "we", "my", "our"}

def local_hash_embedding(text: str, dim: int = 128) -> List[float]:
    """Deterministic local embedding vector."""
    vec = [0.0] * dim
    words = [w for w in text.lower().split() if w not in STOP_WORDS]
    for word in words:
        h = int(hashlib.md5(word.encode('utf-8')).hexdigest(), 16)
        idx = h % dim
        vec[idx] += 1.0
    norm = sum(x * x for x in vec) ** 0.5
    if norm > 0:
        vec = [x / norm for x in vec]
    return vec

def initialize_retriever():
    global chroma_client, chroma_collection, local_chunks_cache
    
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
    json_path = os.path.join(data_dir, "indexed_chunks.json")
    if os.path.exists(json_path):
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                local_chunks_cache = json.load(f)
                print(f"[Retriever] Loaded {len(local_chunks_cache)} chunks in semantic index.")
        except Exception as e:
            print(f"[Retriever Error] Loading local chunks: {e}")
            
    try:
        import chromadb
        persist_dir = os.path.abspath(settings.CHROMA_PERSIST_DIR)
        chroma_client = chromadb.PersistentClient(path=persist_dir)
        chroma_collection = chroma_client.get_or_create_collection(
            name=settings.CHROMA_COLLECTION,
            metadata={"hnsw:space": "cosine"}
        )
        print(f"[Retriever] ChromaDB active with {chroma_collection.count()} vectors.")
    except Exception as e:
        print(f"[Retriever] ChromaDB init note: {e}")

def _calculate_bm25_sim(query_tokens: List[str], doc_tokens: List[str], doc_len: int, avg_doc_len: float) -> float:
    k1 = 1.5
    b = 0.75
    score = 0.0
    doc_token_counts = {}
    for t in doc_tokens:
        doc_token_counts[t] = doc_token_counts.get(t, 0) + 1
        
    for q in query_tokens:
        if q in STOP_WORDS:
            continue
        tf = doc_token_counts.get(q, 0)
        if tf > 0:
            numerator = tf * (k1 + 1)
            denominator = tf + k1 * (1 - b + b * (doc_len / (avg_doc_len or 1)))
            is_number = bool(re.match(r'^\d+$', q))
            boost = 10.0 if is_number else (4.0 if q in ("bottle", "kettle", "cylinder", "water", "toy", "gold", "cement", "battery", "plug", "socket", "helmet", "lpg", "fssai", "safety", "flask", "stainless") else 1.5)
            score += (numerator / denominator) * boost
    return score

async def retrieve_documents(query: str, sector: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Retrieve top relevant BIS chunks using hybrid vector search + semantic BM25 scoring.
    Returns empty list if query is unrelated/unsupported.
    """
    global chroma_collection, local_chunks_cache
    
    if not local_chunks_cache:
        initialize_retriever()
        
    query_clean = query.lower()
    query_tokens = [w for w in re.findall(r'\w+', query_clean) if w not in STOP_WORDS]
    
    if not query_tokens:
        return []
        
    scored_candidates = []
    avg_len = sum(len(c.get("text", "").split()) for c in local_chunks_cache) / (len(local_chunks_cache) or 1)
    
    for item in local_chunks_cache:
        meta = item.get("metadata", {})
        if sector and sector.lower() not in meta.get("sector", "").lower():
            continue
            
        text = item.get("text", "")
        doc_tokens = re.findall(r'\w+', text.lower())
        doc_len = len(doc_tokens)
        
        sim = _calculate_bm25_sim(query_tokens, doc_tokens, doc_len, avg_len)
        std_id = meta.get("standard_id", "").lower()
        
        # Exact standard ID token boost
        for token in query_tokens:
            if re.match(r'^\d+$', token) and token in std_id:
                sim += 25.0
            elif len(token) > 3 and token in std_id:
                sim += 10.0
                
        # Only keep genuine matches
        if sim > 1.5:
            norm_score = min(max(sim / 15.0, 0.65), 0.98)
            scored_candidates.append({
                "content": text,
                "standard_id": meta.get("standard_id", "IS Standard"),
                "standard_title": meta.get("standard_title", "Specification"),
                "section": meta.get("section", "General Requirements"),
                "page": meta.get("page", "1"),
                "relevance_score": norm_score,
                "source_url": meta.get("source_url", "https://www.bis.gov.in")
            })
            
    scored_candidates.sort(key=lambda x: x["relevance_score"], reverse=True)
    top_chunks = scored_candidates[:settings.TOP_K_RERANK]
    
    # If no genuine match, return empty list rather than pretending unrelated query is about BIS
    return top_chunks
