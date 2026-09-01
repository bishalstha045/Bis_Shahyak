from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import chat, search, verify, feedback, export, navigator, auth
from app.services.retriever import initialize_retriever
from app.models.database import init_db

app = FastAPI(
    title="BIS Sahayak V2 API (बीआईएस सहायक)",
    description="AI-Powered BIS Compliance Navigator & Standards Decision Platform — SIH 2026",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup hook
@app.on_event("startup")
async def startup_event():
    init_db()
    initialize_retriever()
    print("BIS Sahayak V2 Backend initialized successfully with 21 standards.")

# Register API routes
app.include_router(auth.router, prefix="/api", tags=["Authentication & Profile"])
app.include_router(navigator.router, prefix="/api", tags=["Compliance Navigator"])
app.include_router(chat.router, prefix="/api", tags=["Chat & Voice"])
app.include_router(search.router, prefix="/api", tags=["Search"])
app.include_router(verify.router, prefix="/api", tags=["Verify"])
app.include_router(feedback.router, prefix="/api", tags=["Feedback"])
app.include_router(export.router, prefix="/api", tags=["Export"])

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "BIS Sahayak V2 — AI Compliance Navigator",
        "version": "2.0.0",
        "indexed_standards_count": 21,
        "features": [
            "JWT Authentication & Organization Profiles",
            "Product-to-Standard Mapping",
            "Why-This-Standard Explainability",
            "Evidence-First RAG",
            "Compliance Readiness Engine",
            "Document & Test Report Analyzer",
            "Standard Comparator",
            "ISI / CML License Verifier",
            "Official ReportLab Form V PDF Export",
            "Multilingual & Voice Input"
        ]
    }
