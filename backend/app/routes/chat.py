import json
import asyncio
import logging
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.services.rag_pipeline import process_query, stream_process_query
from app.models.schemas import ChatRequest, ChatResponse

logger = logging.getLogger("bis_sahayak.routes.chat")
router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process query synchronously and return structured response."""
    result = await process_query(
        query=request.query,
        mode=request.mode,
        language=request.language,
        sector=request.sector,
        session_id=request.session_id,
        history=request.history
    )
    return result

@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """Streaming chat endpoint via Server-Sent Events (SSE)."""
    
    async def event_generator():
        try:
            async for sse_chunk in stream_process_query(
                query=request.query,
                mode=request.mode,
                language=request.language,
                sector=request.sector,
                session_id=request.session_id,
                history=request.history
            ):
                yield sse_chunk
        except Exception as e:
            logger.error(f"[Chat Stream Exception in SSE Generator]: {e}", exc_info=True)
            err_msg = str(e)
            token_chunk = {
                "type": "token",
                "content": f"\n\n**Service Error:** {err_msg}",
                "done": False
            }
            yield f"data: {json.dumps(token_chunk)}\n\n"
            final_meta = {
                "type": "done",
                "confidence": 0,
                "citations": [],
                "language": request.language,
                "mode": request.mode,
                "processing_time": 0.1,
                "session_id": request.session_id,
                "done": True,
                "error": err_msg
            }
            yield f"data: {json.dumps(final_meta)}\n\n"
        
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

