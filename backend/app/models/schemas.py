from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ChatRequest(BaseModel):
    query: str = Field(..., description="User's question or product description")
    mode: str = Field(default="simple", description="simple or expert")
    language: str = Field(default="auto", description="Target language code (e.g. en, hi, ta, te)")
    sector: Optional[str] = Field(default=None, description="Optional sector filter")
    session_id: Optional[str] = Field(default=None, description="Chat session ID")

class Citation(BaseModel):
    standard_id: str
    title: str
    section: str = ""
    page: str = ""
    url: str = ""
    relevance: int = 80
    snippet: Optional[str] = None
    clause_id: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    confidence: int
    compliance_readiness: Optional[int] = None
    citations: List[Citation]
    language: str
    mode: str
    processing_time: float
    session_id: Optional[str] = None
    product_profile: Optional[Dict[str, Any]] = None
    applicable_standards: Optional[List[Dict[str, Any]]] = None
    compliance_matrix: Optional[List[Dict[str, Any]]] = None
    next_best_action: Optional[str] = None

class FeedbackRequest(BaseModel):
    session_id: Optional[str] = "default-session"
    message_id: str
    rating: str  # "up" or "down"
    comment: Optional[str] = None

class VerifyRequest(BaseModel):
    isi_number: str
    product_type: Optional[str] = None
    image_base64: Optional[str] = None

class VerifyResponse(BaseModel):
    is_valid: bool
    isi_number: str
    cml_number: Optional[str] = None
    standard_id: str
    standard_title: str
    manufacturer_name: Optional[str] = None
    product_category: str
    valid_up_to: str
    status: str
    details: str
    message: str
    verification_source: str = "BIS Manakonline Official Registry Database"

class ExportRequest(BaseModel):
    product_description: str
    standards: List[str]
    language: str = "en"
    company_name: Optional[str] = "Applicant / MSME"
    contact_person: Optional[str] = None

class ProductToStandardRequest(BaseModel):
    product_query: str = Field(..., description="Product description e.g. 'I manufacture stainless steel water bottles'")
    language: str = "en"

class ComplianceEvaluateRequest(BaseModel):
    product_query: Optional[str] = None
    standard_id: Optional[str] = None
    user_evidence_items: Optional[List[Dict[str, Any]]] = None

class DocumentAnalyzeRequest(BaseModel):
    file_name: str
    content_text: str
    standard_id: Optional[str] = None

class StandardCompareRequest(BaseModel):
    standard_a: str
    standard_b: str
