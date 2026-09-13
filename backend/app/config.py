# pyrefly: ignore [missing-import]
import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings  # type: ignore

# Load .env from backend directory or parent directories
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

class Settings(BaseSettings):
    APP_NAME: str = "BIS Sahayak V2"
    APP_VERSION: str = "2.0.0"
    
    # Security & Auth
    JWT_SECRET: str = os.getenv("JWT_SECRET", "bis_sahayak_secure_production_secret_key_2026_sih")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # LLM Configuration (Google Gemini and Groq)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gemini-3.6-flash")
    LLM_TEMPERATURE: float = 0.2
    LLM_MAX_TOKENS: int = 1024
    
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")

    
    # Bhashini Indic Translation Configuration
    BHASHINI_API_KEY: str = os.getenv("BHASHINI_API_KEY", "")
    BHASHINI_USER_ID: str = os.getenv("BHASHINI_USER_ID", "")
    
    # Embeddings & Retrieval
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "intfloat/multilingual-e5-large")
    RERANKER_MODEL: str = os.getenv("RERANKER_MODEL", "cross-encoder/ms-marco-MiniLM-L-6-v2")
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "./data/chroma_db")
    CHROMA_COLLECTION: str = os.getenv("CHROMA_COLLECTION", "bis_documents")
    
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
