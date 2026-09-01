from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
from app.models.schemas import (
    ProductToStandardRequest,
    ComplianceEvaluateRequest,
    DocumentAnalyzeRequest,
    StandardCompareRequest
)
from app.services.product_matcher import match_product_to_standards, load_standards_metadata
from app.services.compliance_engine import evaluate_compliance
from app.services.document_analyzer import analyze_document_content
from app.services.standard_comparator import compare_standards

router = APIRouter()

@router.post("/product-to-standard")
async def api_product_to_standard(request: ProductToStandardRequest):
    """
    Map user product description to applicable Indian Standards with explainability and clause evidence.
    """
    result = match_product_to_standards(request.product_query)
    return result

@router.post("/compliance/evaluate")
async def api_compliance_evaluate(request: ComplianceEvaluateRequest):
    """
    Evaluate compliance requirement matrix, readiness score (0-100%), and next best action.
    """
    result = evaluate_compliance(
        query=request.product_query,
        standard_id=request.standard_id,
        user_evidence_items=request.user_evidence_items
    )
    return result

@router.post("/document/analyze")
async def api_document_analyze(request: DocumentAnalyzeRequest):
    """
    Analyze uploaded test reports or declarations against standard requirements with prompt injection defense.
    """
    result = analyze_document_content(
        file_name=request.file_name,
        content_text=request.content_text,
        standard_id=request.standard_id
    )
    return result

@router.post("/standards/compare")
async def api_standards_compare(request: StandardCompareRequest):
    """
    Structured side-by-side comparison of two Indian Standards.
    """
    result = compare_standards(request.standard_a, request.standard_b)
    return result

@router.get("/dataset-stats")
async def api_dataset_stats():
    """
    Return authentic count and list of indexed standards for verified data honesty.
    """
    standards = load_standards_metadata()
    return {
        "indexed_count": len(standards),
        "standards": [{"id": s["id"], "title": s["title"], "sector": s.get("sector", ""), "year": s.get("year", "")} for s in standards],
        "message": f"Verified Knowledge Base: {len(standards)} core Indian Standards indexed with full clause breakdown."
    }
