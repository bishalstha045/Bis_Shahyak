import { Router } from 'express';
import multer from 'multer';
import { geminiService } from '../services/gemini.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB max audio file
  }
});

/**
 * POST /api/voice/transcribe
 * Transcribes spoken audio (speech-to-text) using Gemini Multimodal Audio model.
 */
router.post('/transcribe', optionalAuth, upload.single('audio'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return sendError(res, "No audio file uploaded. Please provide an audio file with form key 'audio'.", 400);
    }

    const { language = 'auto', prompt = null } = req.body;

    const result = await geminiService.transcribeAudio({
      fileBuffer: file.buffer,
      fileName: file.originalname || 'audio.webm',
      mimeType: file.mimetype || 'audio/webm',
      language,
      prompt
    });

    return sendSuccess(res, result, "Audio transcribed successfully.");
  } catch (err) {
    console.error("[Voice Route Error]", err);
    return sendError(res, err.message || "Failed to transcribe audio.", 500);
  }
});

export default router;
