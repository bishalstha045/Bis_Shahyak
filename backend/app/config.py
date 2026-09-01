import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "BIS Sahayak V2"
    APP_VERSION: str = "2.0.0"
    
    # Security & Auth
    JWT_SECRET: str = os.getenv("JWT_SECRET", "bis_sahayak_secure_production_secret_key_2026_sih")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # LLM Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
    LLM_TEMPERATURE: float = 0.1
    LLM_MAX_TOKENS: int = 1024
    
    # Embeddings & Retrieval
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "intfloat/multilingual-e5-large")
    RERANKER_MODEL: str = os.getenv("RERANKER_MODEL", "cross-encoder/ms-marco-MiniLM-L-6-v2")
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "./data/chroma_db")
    CHROMA_COLLECTION: str = "bis_standards"
    
    TOP_K_RETRIEVAL: int = 20
    TOP_K_RERANK: int = 5
    CONFIDENCE_THRESHOLD: float = 0.6
    
    # Cache & Database
    CACHE_TTL: int = 86400  # 24 hours
    DATABASE_URL: str = "sqlite:///./data/bis_sahayak.db"
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
