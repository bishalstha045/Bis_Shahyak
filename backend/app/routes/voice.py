import io
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.config import settings

router = APIRouter()

@router.post("/voice/transcribe")
async def transcribe_voice(
    file: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
    language: Optional[str] = Form(None),
    prompt: Optional[str] = Form(None)
):
    """
    Universal speech-to-text transcription powered by Google Gemini multimodal AI.
    Supports Hindi, English, and regional Indian languages with BIS technical terminology.
    """
    upload = file or audio
    if not upload:
        raise HTTPException(status_code=400, detail="No audio file received for transcription.")
    
    audio_bytes = await upload.read()
    if not audio_bytes or len(audio_bytes) < 50:
        raise HTTPException(status_code=400, detail="Audio file is empty or too short.")
    
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured on the server.")
    
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        tech_prompt = prompt or (
            "You are an accurate speech-to-text transcriber for Indian languages and English with domain knowledge of the "
            "Bureau of Indian Standards (BIS, IS, ISI mark, QCO, FMCS, CRS, CML licence, Indian Standards, testing labs). "
            "Transcribe the following audio recording verbatim into text in the exact language spoken. "
            + (f"The expected spoken language is {language}. " if language and language != "auto" else "")
            + "Return ONLY the transcribed plain text without any introductory commentary or markdown fences."
        )

        mime_type = upload.content_type or "audio/webm"
        models_to_try = [settings.LLM_MODEL, "gemini-3.6-flash", "gemini-flash-lite-latest"]
        response = None
        last_err = None
        for m in models_to_try:
            try:
                response = client.models.generate_content(
                    model=m,
                    contents=[
                        types.Part.from_bytes(data=audio_bytes, mime_type=mime_type),
                        tech_prompt
                    ]
                )
                if response:
                    break
            except Exception as me:
                last_err = me
                continue
        if not response:
            raise last_err or Exception("All Gemini transcription models failed.")

        transcript = (response.text or "").strip()

        return {
            "success": True,
            "transcript": transcript,
            "provider": "gemini_multimodal"
        }
    except Exception as e:
        print(f"[FastAPI Gemini Voice Error] {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
