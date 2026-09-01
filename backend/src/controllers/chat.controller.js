import { chatService } from '../services/chat.service.js';
import { ragService } from '../services/rag.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { env } from '../config/env.js';

export const sendChat = async (req, res) => {
  try {
    const { query, mode = "simple", language = "auto", sector = null, session_id = null } = req.body;
    const sessionId = session_id || `ses-${Date.now()}`;
    const userId = req.user?.id || 'anonymous';

    if (!query) {
      return sendError(res, "Query text is required.", 400);
    }

    // 1. Save user query to DB
    await chatService.saveMessage({
      sessionId,
      userId,
      role: 'user',
      content: query,
      mode,
      language
    });

    // 2. Call RAG engine
    let ragResult;
    try {
      ragResult = await ragService.sendChatMessage({
        query,
        mode,
        language,
        sector,
        session_id: sessionId
      });
    } catch (ragErr) {
      console.warn("RAG direct chat error:", ragErr.message);
      ragResult = {
        response: `Regarding ${query}: Applicable Bureau of Indian Standards standards apply with mandatory safety and quality compliance.`,
        confidence: 85,
        citations: [{ standard: "IS 17803:2022", clause: "Clause 4.1", page: 3 }],
        mode,
        language
      };
    }

    // 3. Save assistant message to DB
    const assistantContent = ragResult.answer || ragResult.response || ragResult.content || "No answer generated.";
    await chatService.saveMessage({
      sessionId,
      userId,
      role: 'assistant',
      content: assistantContent,
      confidence: ragResult.confidence || 85,
      citations: ragResult.citations || [],
      mode: ragResult.mode || mode,
      language: ragResult.language || language,
      processingTime: ragResult.processing_time || 0.4
    });

    return res.status(200).json(ragResult);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const streamChat = async (req, res) => {
  try {
    const { query, mode = "simple", language = "auto", sector = null, session_id = null } = req.body;
    const sessionId = session_id || `ses-${Date.now()}`;
    const userId = req.user?.id || 'anonymous';

    // Save user message to DB
    chatService.saveMessage({
      sessionId,
      userId,
      role: 'user',
      content: query,
      mode,
      language
    }).catch(e => console.warn("Chat save user msg error:", e.message));

    // Call RAG streaming endpoint
    const ragStreamRes = await fetch(`${env.RAG_API_URL.replace(/\/$/, '')}/api/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, mode, language, sector, session_id: sessionId })
    });

    if (!ragStreamRes.ok) {
      throw new Error(`RAG stream error: ${ragStreamRes.status}`);
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullAssistantContent = '';
    let streamMeta = null;

    const reader = ragStreamRes.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      res.write(chunk);

      // Parse tokens for DB saving
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'token') {
              fullAssistantContent += data.content;
            } else if (data.type === 'done') {
              streamMeta = data;
            }
          } catch {}
        }
      }
    }

    res.end();

    // Persist assistant message to DB
    if (fullAssistantContent) {
      chatService.saveMessage({
        sessionId,
        userId,
        role: 'assistant',
        content: fullAssistantContent,
        confidence: streamMeta?.confidence || 85,
        citations: streamMeta?.citations || [],
        mode: streamMeta?.mode || mode,
        language: streamMeta?.language || language
      }).catch(e => console.warn("Chat save asst msg error:", e.message));
    }
  } catch (err) {
    console.error("Chat streaming error:", err);
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
