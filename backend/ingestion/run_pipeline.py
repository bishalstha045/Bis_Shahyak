import os
import json
from ingestion.scraper import scrape_bis_standards
from ingestion.chunker import chunk_documents
from ingestion.embedder import embed_and_store

def run_full_pipeline():
    print("=" * 60)
    print("BIS Sahayak — Data Ingestion Pipeline")
    print("=" * 60)
    
    print("\n[1/3] Loading BIS Standards & Clauses...")
    standards = scrape_bis_standards()
    print(f"Found {len(standards)} BIS standards definitions.")
    
    print("\n[2/3] Chunking documents into semantic sections...")
    chunks = chunk_documents(standards)
    
    print("\n[3/3] Generating vector embeddings & storing...")
    embed_and_store(chunks)
    
    print("\n" + "=" * 60)
    print("Pipeline Complete! BIS Sahayak knowledge base ready.")
    print("=" * 60)

if __name__ == "__main__":
    run_full_pipeline()
