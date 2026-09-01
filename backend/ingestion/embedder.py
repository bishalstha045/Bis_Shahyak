import os
import json
import uuid
import hashlib
from typing import List, Dict, Any
from app.config import settings

def local_hash_embedding(text: str, dim: int = 128) -> List[float]:
    """Fast, deterministic local embedding vector for offline ChromaDB indexing."""
    vec = [0.0] * dim
    words = text.lower().split()
    for word in words:
        h = int(hashlib.md5(word.encode('utf-8')).hexdigest(), 16)
        idx = h % dim
        vec[idx] += 1.0
    # L2 normalize
    norm = sum(x * x for x in vec) ** 0.5
    if norm > 0:
        vec = [x / norm for x in vec]
    return vec

def embed_and_store(chunks: List[Dict[str, Any]]):
    """
    Store chunks in ChromaDB and save local semantic index.
    """
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    os.makedirs(data_dir, exist_ok=True)
    json_index_path = os.path.join(data_dir, "indexed_chunks.json")
    
    # 1. Save local JSON index
    with open(json_index_path, "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)
    print(f"[Index] Saved {len(chunks)} chunks to {json_index_path}")
    
    # 2. ChromaDB indexing with custom deterministic embeddings
    try:
        import chromadb
        persist_dir = os.path.abspath(settings.CHROMA_PERSIST_DIR)
        os.makedirs(persist_dir, exist_ok=True)
        
        client = chromadb.PersistentClient(path=persist_dir)
        try:
            client.delete_collection(settings.CHROMA_COLLECTION)
        except Exception:
            pass
            
        collection = client.create_collection(
            name=settings.CHROMA_COLLECTION,
            metadata={"hnsw:space": "cosine"}
        )
        
        texts = [c["text"] for c in chunks]
        metadatas = [c["metadata"] for c in chunks]
        ids = [f"chunk-{i}-{uuid.uuid4().hex[:6]}" for i in range(len(chunks))]
        embeddings = [local_hash_embedding(t) for t in texts]
        
        collection.add(
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )
        print(f"[ChromaDB] Successfully inserted {collection.count()} chunks into collection '{settings.CHROMA_COLLECTION}'.")
    except Exception as e:
        print(f"[Embedder Notice] ChromaDB storage note: {e}")
