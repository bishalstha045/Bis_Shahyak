import json
import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.services.rag_pipeline import process_query
from app.models.schemas import ChatRequest, ChatResponse

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process query synchronously and return structured response."""
    result = await process_query(
        query=request.query,
        mode=request.mode,
        language=request.language,
        sector=request.sector,
        session_id=request.session_id
    )
    return result

@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """Streaming chat endpoint via Server-Sent Events (SSE)."""
    
    async def event_generator():
        result = await process_query(
            query=request.query,
            mode=request.mode,
            language=request.language,
            sector=request.sector,
            session_id=request.session_id
        )
        
        answer_text = result["answer"]
        # Split text into tokens / small words for realistic typing stream
        words = answer_text.split(" ")
        
        for i, word in enumerate(words):
            token_chunk = {
                "type": "token",
                "content": word + (" " if i < len(words) - 1 else ""),
                "done": False
            }
            yield f"data: {json.dumps(token_chunk)}\n\n"
            # Small realistic streaming pacing
            await asyncio.sleep(0.015)
            
        final_meta = {
            "type": "done",
            "confidence": result["confidence"],
            "citations": result["citations"],
            "language": result["language"],
            "mode": result["mode"],
            "processing_time": result["processing_time"],
            "session_id": result.get("session_id"),
            "done": True
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
