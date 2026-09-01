from fastapi import APIRouter, Response
from app.models.schemas import ExportRequest
from app.utils.pdf_generator import generate_compliance_pdf
from app.services.retriever import retrieve_documents

router = APIRouter()

@router.post("/export/pdf")
async def export_checklist_pdf(request: ExportRequest):
    """
    Generate and download a ready-to-use Compliance Checklist PDF.
    """
    # Retrieve details for the standards
    standards_list = []
    for std_id in request.standards:
        chunks = await retrieve_documents(std_id)
        if chunks:
            standards_list.append({
                "standard_id": chunks[0]["standard_id"],
                "title": chunks[0]["standard_title"],
                "section": chunks[0]["section"]
            })
        else:
            standards_list.append({
                "standard_id": std_id,
                "title": f"Specification for {request.product_description}",
                "section": "General Safety & Performance"
            })
            
    pdf_bytes = generate_compliance_pdf(
        product_description=request.product_description,
        standards=standards_list,
        company_name=request.company_name or "Applicant Organization",
        contact_person=request.contact_person or "Quality Lead",
        language=request.language
    )
    
    filename = f"BIS_Compliance_Checklist_{request.product_description.replace(' ', '_')[:25]}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache"
        }
    )
