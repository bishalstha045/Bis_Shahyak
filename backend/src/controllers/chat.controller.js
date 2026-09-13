import { chatService } from '../services/chat.service.js';
import { ragService } from '../services/rag.service.js';
import { geminiService } from '../services/gemini.service.js';
import { groqService } from '../services/groq.service.js';
import { externalApiService } from '../services/api.service.js';
import { hsnService } from '../services/hsn.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { env } from '../config/env.js';

export const sendChat = async (req, res) => {
  try {
    const { query, mode = "auto", language = "auto", sector = null, session_id = null } = req.body;
    const sessionId = session_id || `ses-${Date.now()}`;
    const userId = req.user?.id || 'anonymous';

    if (!query || !query.trim()) {
      return sendError(res, "Query text is required.", 400);
    }

    const trimmedQuery = query.trim();

    // 1. Fetch recent conversation history for multi-turn context
    let history = [];
    if (sessionId) {
      try {
        const rawHistory = await chatService.getSessionHistory(sessionId);
        history = (rawHistory || [])
          .filter(m => m.content && m.content.trim() !== trimmedQuery)
          .slice(-6)
          .map(m => ({
            role: (m.role === 'assistant' || m.role === 'model') ? 'assistant' : 'user',
            content: m.content
          }));
      } catch (histErr) {
        console.warn("[Chat History Fetch Note]", histErr.message);
      }
    }

    // 2. Save current user query to DB
    await chatService.saveMessage({
      sessionId,
      userId,
      role: 'user',
      content: trimmedQuery,
      mode,
      language
    }).catch(e => console.warn("[Chat Save Error]", e.message));

    let finalResult = null;
    const effectiveMode = (mode || 'auto').toLowerCase();

    // Retrieve authentic BIS chunks for query
    let contextChunks = ragService.retrieveChunks(trimmedQuery, sector, 5);

    // Retrieve authentic HSN classification from MongoDB / HSN catalog
    try {
      const hsnDoc = await hsnService.findHsnByQuery(trimmedQuery);
      if (hsnDoc) {
        const hsnChunk = hsnService.buildHsnChunk(hsnDoc);
        if (hsnChunk) {
          contextChunks.unshift(hsnChunk);
        }
      }
    } catch (hsnErr) {
      console.warn("[HSN Context Fetch Warning in sendChat]", hsnErr.message);
    }

    const hasRelevantChunks = contextChunks.length > 0 && contextChunks[0].score >= 6;

    // ==========================================
    // Unified Routing:
    // 1. Primary Engine: GEMINI with Google Search Grounding & Gemini 3.6 Flash
    //    Answers ALL questions (general knowledge, coding, conversation, BIS standards, HSN codes).
    //    Injects authoritative statutory context if relevant chunks are matched.
    // 2. Secondary Engine (Fallback): GROQ
    //    Used if Gemini is offline, rate-limited, or encounters errors.
    // ==========================================

    if (geminiService.isAvailable()) {
      try {
        finalResult = await geminiService.chatCompletion({
          query: trimmedQuery,
          history,
          mode: hasRelevantChunks ? 'rag' : 'gemini',
          contextChunks: hasRelevantChunks ? contextChunks : [],
          enableSearch: true,
          language: language || 'auto'
        });
        finalResult.mode = hasRelevantChunks ? 'gemini (rag)' : 'gemini';
      } catch (geminiErr) {
        console.warn("[Gemini Primary Error, attempting Groq fallback]:", geminiErr.message);
        if (groqService.isAvailable()) {
          try {
            finalResult = await groqService.chatCompletion({
              query: trimmedQuery,
              history,
              contextChunks: hasRelevantChunks ? contextChunks : []
            });
            finalResult.mode = 'groq (fallback)';
          } catch (groqErr) {
            console.error("[Groq Fallback Error]:", groqErr.message);
          }
        }
      }
    } else if (groqService.isAvailable()) {
      try {
        finalResult = await groqService.chatCompletion({
          query: trimmedQuery,
          history,
          contextChunks: hasRelevantChunks ? contextChunks : []
        });
        finalResult.mode = 'groq';
      } catch (groqErr) {
        console.error("[Groq Primary Error]:", groqErr.message);
      }
    }

    // Real error feedback if LLM services failed
    if (!finalResult) {
      const errorDetail = !geminiService.isAvailable()
        ? "GEMINI_API_KEY is not configured in backend .env."
        : "Gemini API was unable to generate a response. Please check your API quota or network connection.";
      finalResult = {
        answer: `**API Notice:** ${errorDetail}`,
        response: `**API Notice:** ${errorDetail}`,
        confidence: null,
        citations: [],
        mode: effectiveMode,
        language,
        processing_time: 0.1
      };
    }

    // 4. Multi-language Translation via Official Government Bhashini NMT
    if (language && language !== 'auto' && language !== 'en') {
      try {
        const textToTranslate = finalResult.answer || finalResult.response;
        const bhashiniRes = await externalApiService.translateIndic(textToTranslate, 'en', language);
        if (bhashiniRes && bhashiniRes.translated && bhashiniRes.translated !== textToTranslate) {
          finalResult.answer = bhashiniRes.translated;
          finalResult.response = bhashiniRes.translated;
          finalResult.translated_by = bhashiniRes.provider;
          finalResult.language = language;
        }
      } catch (transErr) {
        console.warn("[Bhashini Translation Warning in chat.controller]", transErr.message);
      }
    }

    // 5. Save assistant message to DB
    const assistantContent = finalResult.answer || finalResult.response || "No answer generated.";
    await chatService.saveMessage({
      sessionId,
      userId,
      role: 'assistant',
      content: assistantContent,
      confidence: finalResult.confidence,
      citations: finalResult.citations || [],
      mode: finalResult.mode || mode,
      language: finalResult.language || language,
      processingTime: finalResult.processing_time || 0.2
    }).catch(e => console.warn("[Chat Save Asst Error]", e.message));

    return res.status(200).json(finalResult);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const streamChat = async (req, res) => {
  try {
    const { query, mode = "auto", language = "auto", sector = null, session_id = null } = req.body;
    const sessionId = session_id || `ses-${Date.now()}`;
    const userId = req.user?.id || 'anonymous';

    if (!query || !query.trim()) {
      return sendError(res, "Query text is required.", 400);
    }

    const trimmedQuery = query.trim();

    // 1. Fetch recent conversation history
    let history = [];
    if (sessionId) {
      try {
        const rawHistory = await chatService.getSessionHistory(sessionId);
        history = (rawHistory || [])
          .filter(m => m.content && m.content.trim() !== trimmedQuery)
          .slice(-6)
          .map(m => ({
            role: (m.role === 'assistant' || m.role === 'model') ? 'assistant' : 'user',
            content: m.content
          }));
      } catch (e) {}
    }

    // 2. Save user message to DB asynchronously
    chatService.saveMessage({
      sessionId,
      userId,
      role: 'user',
      content: trimmedQuery,
      mode,
      language
    }).catch(e => console.warn("[Chat Save User Msg Error]", e.message));

    const effectiveMode = (mode || 'auto').toLowerCase();
    let contextChunks = ragService.retrieveChunks(trimmedQuery, sector, 5);

    // Retrieve authentic HSN classification from MongoDB / HSN catalog
    try {
      const hsnDoc = await hsnService.findHsnByQuery(trimmedQuery);
      if (hsnDoc) {
        const hsnChunk = hsnService.buildHsnChunk(hsnDoc);
        if (hsnChunk) {
          contextChunks.unshift(hsnChunk);
        }
      }
    } catch (hsnErr) {
      console.warn("[HSN Context Fetch Warning in streamChat]", hsnErr.message);
    }

    const hasRelevantChunks = contextChunks.length > 0 && contextChunks[0].score >= 6;

    if (!res.headersSent) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
    }

    // 1. Primary: Forward to FastAPI RAG & Gemini Streaming Microservice (Port 8000)
    try {
      const fastApiStream = await fetch(`${ragService.baseUrl}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmedQuery, mode, language, sector, session_id: sessionId, history }),
        signal: AbortSignal.timeout(20000)
      });
      if (fastApiStream.ok && fastApiStream.body) {
        const reader = fastApiStream.body.getReader();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          res.write(value);
        }
        return res.end();
      }
    } catch (fastApiErr) {
      console.warn("[Node -> FastAPI Stream Fallback Notice]:", fastApiErr.message);
    }

    // 2. Secondary: Direct Node.js Gemini / Groq streaming
    if (geminiService.isAvailable()) {
      try {
        return await geminiService.streamCompletion({
          query: trimmedQuery,
          history,
          mode: hasRelevantChunks ? 'rag' : 'gemini',
          contextChunks: hasRelevantChunks ? contextChunks : [],
          res,
          enableSearch: true,
          language: language || 'auto',
          onDone: (content, meta) => {
            chatService.saveMessage({
              sessionId,
              userId,
              role: 'assistant',
              content,
              confidence: meta.confidence,
              citations: meta.citations || [],
              mode: hasRelevantChunks ? 'gemini (rag)' : 'gemini',
              language: language || 'auto'
            }).catch(e => console.warn("[Chat Save Asst Error]", e.message));
          }
        });
      } catch (geminiErr) {
        console.warn("[Gemini Stream Error, falling back to Groq stream]:", geminiErr.message);
        if (groqService.isAvailable()) {
          return await groqService.streamCompletion({
            query: trimmedQuery,
            history,
            mode: 'groq',
            contextChunks: hasRelevantChunks ? contextChunks : [],
            res,
            onDone: (content, meta) => {
              chatService.saveMessage({
                sessionId,
                userId,
                role: 'assistant',
                content,
                confidence: null,
                citations: [],
                mode: 'groq (fallback)',
                language: language || 'auto'
              }).catch(e => console.warn("[Chat Save Asst Error]", e.message));
            }
          });
        }
      }
    } else if (groqService.isAvailable()) {
      return await groqService.streamCompletion({
        query: trimmedQuery,
        history,
        mode: 'groq',
        contextChunks: hasRelevantChunks ? contextChunks : [],
        res,
        onDone: (content, meta) => {
          chatService.saveMessage({
            sessionId,
            userId,
            role: 'assistant',
            content,
            confidence: null,
            citations: [],
            mode: 'groq',
            language: language || 'auto'
          }).catch(e => console.warn("[Chat Save Asst Error]", e.message));
        }
      });
    }

    const notice = "The assistant service is temporarily busy. Please try again or visit https://www.manakonline.in.";
    res.write(`data: ${JSON.stringify({ type: 'token', content: notice })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: 'done', confidence: null, citations: [], mode: effectiveMode, done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("[Chat streaming error]", err);
    if (!res.headersSent) {
      return sendError(res, err.message, 500);
    }
    res.end();
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const sessionId = req.query.session_id || req.params.sessionId;
    if (!sessionId) {
      return sendError(res, "session_id parameter is required.", 400);
    }
    const history = await chatService.getSessionHistory(sessionId);
    return sendSuccess(res, { history });
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};
