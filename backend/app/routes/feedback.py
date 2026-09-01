from fastapi import APIRouter
from app.models.schemas import FeedbackRequest
from app.services.audit import record_feedback

router = APIRouter()

@router.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    """Collect user feedback for continuous improvement and audit."""
    success = record_feedback(
        session_id=request.session_id,
        message_id=request.message_id,
        rating=request.rating,
        comment=request.comment
    )
    return {
        "status": "success" if success else "error",
        "message": "Feedback recorded successfully. Thank you for making BIS Sahayak better!"
    }
