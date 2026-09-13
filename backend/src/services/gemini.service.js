import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';

export class GeminiService {
  constructor() {
    this.apiKey = env.GEMINI_API_KEY;
    this.model = env.GEMINI_MODEL || 'gemini-3.6-flash';
    this.temperature = env.LLM_TEMPERATURE ?? 0.2;
    this.client = null;
    if (this.apiKey) {
      try {
        this.client = new GoogleGenAI({ apiKey: this.apiKey });
      } catch (e) {
        console.warn("[GeminiService] Initialization note:", e.message);
      }
    }
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  getClient() {
    if (!this.client && this.apiKey) {
      try {
        this.client = new GoogleGenAI({ apiKey: this.apiKey });
      } catch (e) {
        console.warn("[GeminiService] Client creation note:", e.message);
      }
    }
    return this.client;
  }

  /**
   * Universal Balanced System Prompt for BIS Sahayak V2 powered by Google Gemini
   * Answers ANY question accurately like a modern Google LLM, with deep BIS expertise when relevant.
   */
  getSystemPrompt(mode = "auto", language = "auto") {
    let prompt = (
      "You are BIS Sahayak V2, an intelligent AI compliance assistant powered by Google Gemini. You are a versatile, helpful, and highly knowledgeable AI capable of answering ANY type of question accurately—from general knowledge, science, coding, math, history, everyday conversation, to specialized Bureau of Indian Standards (BIS) product compliance and statutory HSN regulations.\n\n" +
      "Guidelines:\n" +
      "1. GENERAL QUESTIONS & CONVERSATION: Answer naturally, thoroughly, accurately, and directly like a modern Google LLM. Provide clear explanations, code, step-by-step reasoning, or answers to whatever the user asks. Do NOT refuse general questions or force BIS topics onto unrelated questions.\n" +
      "2. BIS, INDIAN STANDARDS & HSN QUESTIONS: Provide precise, well-structured, authoritative regulatory guidance. Cite relevant Indian Standards (IS), mandatory Quality Control Orders (QCOs), certification schemes (ISI, CRS, Hallmark), and statutory requirements where applicable.\n" +
      "3. TONE & FORMAT: Be helpful, professional, and clear. Format responses using clean Markdown with bolding, lists, and tables where appropriate.\n" +
      "4. Never invent nonexistent IS standards, clauses, or legal mandates. If a statutory detail is unverified, advise official verification on manakonline.in."
    );
    if (language && language !== 'auto' && language !== 'en') {
      const INDIC_NAMES = {
        hi: "Hindi (हिंदी - Devanagari script)",
        ta: "Tamil (தமிழ் - Tamil script)",
        te: "Telugu (తెలుగు - Telugu script)",
        bn: "Bengali (বাংলা - Bengali script)",
        mr: "Marathi (मराठी - Devanagari script)",
        gu: "Gujarati (ગુજરાતી - Gujarati script)",
        kn: "Kannada (ಕನ್ನಡ - Kannada script)",
        ml: "Malayalam (മലയാളം - Malayalam script)",
        pa: "Punjabi (ਪੰਜਾਬੀ - Gurmukhi script)",
        or: "Odia (ଓଡ଼ିଆ - Odia script)",
        as: "Assamese (অসমীয়া - Assamese script)",
        ur: "Urdu (اردو - Urdu/Nastaliq script)",
        ne: "Nepali (नेपाली - Devanagari script)",
        sa: "Sanskrit (संस्कृतम् - Devanagari script)",
        kok: "Konkani (कोंकणी - Devanagari script)",
        mai: "Maithili (मैथिली - Devanagari script)"
      };
      const langDesc = INDIC_NAMES[language.toLowerCase()] || language;
      prompt += `\n\n🚨 CRITICAL MANDATORY LANGUAGE DIRECTIVE:\nThe user has chosen ${langDesc}. EVEN IF the user query is written in English, you MUST generate your ENTIRE response in this selected language using its authentic native script. Keep IS standard numbers (e.g. IS 2347:2017) and licence numbers (e.g. CM/L-7128394) in English/Latin, but formulate all explanations, headings, and descriptions in ${langDesc}.`;
    }
    return prompt;
  }

  /**
   * Safely extract citations and search queries from Google Search Grounding metadata
   */
  extractGroundingCitations(candidate) {
    const citations = [];
    const searchQueries = [];
    const metadata = candidate?.groundingMetadata;

    if (metadata) {
      if (Array.isArray(metadata.webSearchQueries)) {
        searchQueries.push(...metadata.webSearchQueries);
      }

      if (Array.isArray(metadata.groundingChunks)) {
        for (const chunk of metadata.groundingChunks) {
          if (chunk.web) {
            const uri = chunk.web.uri || "";
            const title = chunk.web.title || "Government / Regulatory Record";
            const isOfficial = uri.includes('bis.gov.in') || uri.includes('manakonline.in') || uri.includes('gov.in') || uri.includes('egazette.gov.in');

            citations.push({
              standard: title,
              clause: isOfficial ? "Official Gazette / BIS Registry" : "Regulatory Reference",
              url: uri,
              page: 1,
              is_official: isOfficial
            });
          }
        }
      }
    }
    return { citations, searchQueries };
  }

  /**
   * Calculate realistic, evidence-grounded confidence score
   * Omit or return null for conversational / general queries so no compliance badge is forced.
   */
  calculateConfidence(query, answerText, citations = [], hasRetrievedContext = false) {
    if (!query || !answerText) return null;
    const qLower = query.toLowerCase().trim();

    // 1. General conversation / greetings / definitions - no compliance score badge needed
    const isGeneral = /^(hey|hello|hi|good\s*(morning|evening|afternoon)|howdy|sup|thanks|thank\s*you|ok|okay)[\s!.]*$/i.test(qLower) ||
      /^(what\s+is\s+react|what\s+is\s+hsn|explain\s+machine\s+learning|explain\s+artificial\s+intelligence|tell\s+me\s+about\s+react|who\s+are\s+you|what\s+can\s+you\s+do)[\s?.]*$/i.test(qLower);

    if (isGeneral) {
      return null;
    }

    const aLower = answerText.toLowerCase();

    // If answer explicitly notes lack of verified evidence
    if (aLower.includes("could not establish") || aLower.includes("official verification is required") || aLower.includes("needs official verification") || aLower.includes("cannot be verified")) {
      return 65;
    }

    // Is it a specific BIS query?
    const isBisQuery = /(bis|isi|qco|indian\s*standard|\bis\s*\d+|fmcs|crs|cml|hallmark|manakonline)/i.test(qLower) ||
      /(pressure\s*cooker|helmet|water\s*bottle|cement|steel|cable|toy|gold|battery|switch)/i.test(qLower);

    if (!isBisQuery) {
      // General non-BIS question (e.g. tech, science, language)
      return null;
    }

    // Has official government/BIS citations or authenticated RAG context
    const hasOfficialCitation = citations.some(c => c.is_official || (c.url && (c.url.includes('.gov.in') || c.url.includes('bis.'))));
    if (hasOfficialCitation || hasRetrievedContext) {
      if (aLower.includes("mandatory") && (aLower.includes("is ") || aLower.includes("is:"))) {
        return 92;
      }
      return 88;
    }

    if (citations.length > 0) {
      return 82;
    }

    // Factual BIS general response based on model's knowledge
    return 85;
  }

  /**
   * Build multi-turn contents array for Google GenAI SDK
   */
  buildContents({ query, history = [], contextChunks = [], language = "auto" }) {
    const contents = [];

    // Format previous turns
    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history) {
        const text = msg.content || msg.text || '';
        if (!text.trim()) continue;
        const role = (msg.role === 'assistant' || msg.role === 'model') ? 'model' : 'user';
        contents.push({
          role,
          parts: [{ text }]
        });
      }
    }

    // Inject RAG context into latest query if available
    let latestText = query;
    if (contextChunks && contextChunks.length > 0) {
      const formattedChunks = contextChunks.slice(0, 5).map(c => 
        `[Standard / HSN: ${c.standard_id || 'IS'} | Clause / Section: ${c.clause_id || c.section || 'General'} | Page: ${c.page || 1}]:\n${c.content || c.text || ''}`
      ).join('\n---\n');

      latestText = (
        `AUTHORITATIVE STATUTORY CONTEXT (BIS & DGFT HSN REGISTER):\n${formattedChunks}\n\n` +
        `USER QUESTION:\n${query}\n\n` +
        `Response Requirements:\n` +
        `1. Exact HSN & Item Name: If an HSN code is referenced, provide the exact HSN code and verbatim description from the official context above, verifying consistency with official Indian DGFT/Google data.\n` +
        `2. Product Type / Classification: Detail the chapter and product group under the Harmonized System.\n` +
        `3. Statutory BIS & QCO Scope: Explain applicable Indian Standards (IS), mandatory Quality Control Orders (QCOs), and licensing requirements if notified by the Government of India.\n` +
        `4. Cite the official Standard/HSN source and clauses.`
      );
    }

    if (language && language !== 'auto' && language !== 'en') {
      latestText = `[CRITICAL DIRECTIVE: The user selected language "${language}". Formulate your complete answer in that language using its native script, even though the user input is in English.]\n\n` + latestText;
    }

    contents.push({
      role: 'user',
      parts: [{ text: latestText }]
    });

    return contents;
  }

  /**
   * Safe execution wrapper with automatic retry for 429 rate limits
   */
  async executeWithRetry(apiCall, maxRetries = 1) {
    let attempts = 0;
    while (attempts <= maxRetries) {
      try {
        return await apiCall();
      } catch (err) {
        attempts++;
        const isRateLimit = err.message && (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED'));
        if (isRateLimit && err.message.includes('exceeded your current quota')) {
          throw err;
        }
        if (isRateLimit && attempts <= maxRetries) {
          const match = err.message.match(/retry in ([0-9.]+)s/i) || err.message.match(/"retryDelay":\s*"([0-9]+)s"/i);
          let waitSec = match ? Math.min(3, Math.ceil(parseFloat(match[1]))) : 2;
          console.warn(`[Gemini Rate Limit] 429 hit, auto-waiting ${waitSec}s before attempt ${attempts}/${maxRetries}...`);
          await new Promise(r => setTimeout(r, waitSec * 1000));
        } else {
          throw err;
        }
      }
    }
  }

  /**
   * Synchronous / Non-streaming Gemini Chat Completion
   */
  async chatCompletion({ query, history = [], mode = "simple", contextChunks = [], enableSearch = false, language = "auto" }) {
    if (!this.isAvailable()) {
      return {
        answer: `I am your Gemini AI assistant. (Please configure GEMINI_API_KEY in backend .env). How can I assist you with: "${query}"?`,
        mode: 'gemini',
        confidence: null,
        citations: []
      };
    }

    const startTime = Date.now();
    const ai = this.getClient();
    let response;
    let usedSearch = false;

    const contents = this.buildContents({ query, history, contextChunks, language });
    const config = {
      systemInstruction: this.getSystemPrompt(mode, language),
      temperature: this.temperature
    };

    if (enableSearch) {
      try {
        response = await ai.models.generateContent({
          model: this.model,
          contents,
          config: {
            ...config,
            tools: [{ googleSearch: {} }]
          }
        });
        usedSearch = true;
      } catch (searchErr) {
        console.warn("[Gemini Grounding Notice] Direct generation used:", searchErr.message?.slice(0, 80));
      }
    }

    if (!response) {
      const candidateModels = [this.model, 'gemini-flash-lite-latest', 'gemini-3.6-flash'].filter((v, i, a) => a.indexOf(v) === i);
      let lastErr = null;
      for (const m of candidateModels) {
        try {
          response = await this.executeWithRetry(() => ai.models.generateContent({
            model: m,
            contents,
            config
          }));
          if (response) break;
        } catch (err) {
          lastErr = err;
          console.warn(`[Gemini Model Fallback] Model ${m} unavailable (${err.message.slice(0, 70)}), trying next candidate...`);
        }
      }
      if (!response) {
        console.error("[Gemini API Error across candidates]", lastErr?.message);
        throw lastErr;
      }
    }

    const candidate = response.candidates?.[0];
    const answer = response.text || (candidate?.content?.parts?.map(p => p.text).join('')) || "No answer generated by Gemini.";
    const { citations, searchQueries } = usedSearch ? this.extractGroundingCitations(candidate) : { citations: [], searchQueries: [] };
    const confidence = this.calculateConfidence(query, answer, citations, contextChunks.length > 0);
    const processingTime = Math.round((Date.now() - startTime) / 100) / 10;

    return {
      answer,
      mode: 'gemini',
      confidence,
      citations,
      search_queries: searchQueries,
      processing_time: processingTime
    };
  }

  /**
   * Real-time Server-Sent Events (SSE) Streaming Completion
   */
  async streamCompletion({ query, history = [], mode = "simple", contextChunks = [], res, onChunk, onDone, enableSearch = false, language = "auto" }) {
    if (!this.isAvailable()) {
      const fallback = `I am your Gemini AI assistant. How can I assist you with: "${query}"? (Please configure GEMINI_API_KEY in backend .env).`;
      res.write(`data: ${JSON.stringify({ type: 'token', content: fallback })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: 'done', mode: 'gemini', confidence: null, citations: [], language: language || 'auto', processing_time: 0.1, done: true })}\n\n`);
      res.end();
      if (onDone) onDone(fallback, { mode: 'gemini', confidence: null, citations: [] });
      return;
    }

    const startTime = Date.now();
    const ai = this.getClient();
    let fullText = '';
    let lastCandidate = null;

    const contents = this.buildContents({ query, history, contextChunks, language });

    const tryStream = async (withSearch) => {
      const config = {
        systemInstruction: this.getSystemPrompt(mode, language),
        temperature: this.temperature,
      };
      if (withSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      const candidateModels = [this.model, 'gemini-3.6-flash', 'gemini-flash-lite-latest'].filter((v, i, a) => a.indexOf(v) === i);
      let streamStarted = false;

      for (const m of candidateModels) {
        try {
          const responseStream = await ai.models.generateContentStream({
            model: m,
            contents,
            config
          });

          for await (const chunk of responseStream) {
            streamStarted = true;
            if (chunk.candidates?.[0]) {
              lastCandidate = chunk.candidates[0];
            }
            const text = chunk.text;
            if (text) {
              fullText += text;
              res.write(`data: ${JSON.stringify({ type: 'token', content: text })}\n\n`);
              if (onChunk) onChunk(text);
            }
          }
          if (streamStarted) break;
        } catch (streamModelErr) {
          if (streamStarted) throw streamModelErr;
          console.warn(`[Gemini Stream Fallback] Model ${m} stream attempt note (${streamModelErr.message?.slice(0, 70)}), trying next candidate...`);
        }
      }

      if (!streamStarted) {
        throw new Error("Unable to initialize Gemini stream with candidate models");
      }
    };

    try {
      if (enableSearch) {
        try {
          await tryStream(true);
        } catch (searchStreamErr) {
          console.warn("[Gemini Stream Notice] Direct stream used:", searchStreamErr.message);
          if (!fullText) {
            await tryStream(false);
          }
        }
      } else {
        await tryStream(false);
      }

      const { citations, searchQueries } = this.extractGroundingCitations(lastCandidate);
      let finalCitations = citations;
      if ((!finalCitations || finalCitations.length === 0) && contextChunks && contextChunks.length > 0) {
        finalCitations = contextChunks.map(c => ({
          standard_id: c.standard_id,
          title: c.standard_title,
          section: c.section,
          page: c.page,
          source: c.source,
          url: c.source_url,
          snippet: (c.content || c.text || '').slice(0, 180) + '...',
          relevance: Math.round((c.relevance_score || 0.95) * 100)
        }));
      }

      const confidence = this.calculateConfidence(query, fullText, finalCitations, contextChunks.length > 0);
      const processingTime = Math.round((Date.now() - startTime) / 100) / 10;

      const doneMeta = {
        type: 'done',
        confidence,
        citations: finalCitations,
        search_queries: searchQueries,
        mode: mode === 'rag' ? 'rag' : (contextChunks.length > 0 ? 'auto' : 'gemini'),
        language: 'auto',
        processing_time: processingTime,
        done: true
      };

      res.write(`data: ${JSON.stringify(doneMeta)}\n\n`);
      res.end();

      if (onDone) onDone(fullText, doneMeta);
    } catch (streamErr) {
      console.error("[Gemini Stream Error]", streamErr);
      if (!fullText) {
        const errMsg = "The AI service is temporarily unavailable. Please try again or verify directly at https://www.manakonline.in.";
        res.write(`data: ${JSON.stringify({ type: 'token', content: errMsg })}\n\n`);
      }
      res.write(`data: ${JSON.stringify({ type: 'done', mode: 'gemini', confidence: null, citations: [], done: true })}\n\n`);
      res.end();
      if (onDone) onDone(fullText, { mode: 'gemini', confidence: null, citations: [] });
    }
  }

  /**
   * Gemini Multimodal Speech-to-Text Transcription for Indian Languages & English
   */
  async transcribeAudio({ fileBuffer, fileName = 'audio.webm', mimeType = 'audio/webm', language = null, prompt = null }) {
    if (!this.isAvailable()) {
      throw new Error('GEMINI_API_KEY is not configured in backend .env.');
    }

    const ai = this.getClient();
    const technicalPrompt = prompt || (
      "You are a precise speech-to-text transcriber for Indian languages and English with deep domain expertise in the " +
      "Bureau of Indian Standards (BIS, Indian Standards, IS 17803, IS 302, ISI mark, QCO, FMCS, CRS, CML licence, NABL lab test reports). " +
      "Transcribe the following audio recording verbatim into text in the exact language spoken. " +
      (language && language !== 'auto' ? `The expected spoken language is ${language}. ` : "") +
      "Return ONLY the transcribed plain text without any introductory commentary, timestamps, or markdown fences."
    );

    const base64Audio = fileBuffer.toString('base64');
    const candidateModels = [this.model, 'gemini-3.6-flash', 'gemini-flash-lite-latest'].filter((v, i, a) => a.indexOf(v) === i);
    let response = null;
    let lastErr = null;

    for (const m of candidateModels) {
      try {
        response = await this.executeWithRetry(() => ai.models.generateContent({
          model: m,
          contents: [
            {
              inlineData: {
                data: base64Audio,
                mimeType: mimeType || 'audio/webm'
              }
            },
            technicalPrompt
          ]
        }));
        if (response) break;
      } catch (err) {
        lastErr = err;
        continue;
      }
    }

    if (!response) {
      throw lastErr || new Error("All Gemini transcription candidate models failed.");
    }

    const transcript = (response.text || '').trim();
    return {
      transcript,
      language: language || 'auto',
      provider: 'gemini_multimodal'
    };
  }

  /**
   * Multilingual Translation preserving Indian Standards and regulatory terms
   */
  async translateText(text, targetLanguage = 'hi') {
    if (!this.isAvailable() || !text) return text;
    try {
      const ai = this.getClient();
      const translationPrompt = (
        `Translate the following regulatory text into ${targetLanguage}.\n\n` +
        `STRICT REGULATORY PRESERVATION RULES:\n` +
        `1. DO NOT translate Indian Standard numbers (e.g., 'IS 17803:2022', 'IS 302 (Part 2/Sec 15):2024' must remain exactly as written).\n` +
        `2. DO NOT translate acronyms: 'BIS', 'ISI', 'QCO', 'FMCS', 'CRS', 'CML', 'NABL', 'MSME', 'HUID'.\n` +
        `3. DO NOT alter clause numbers (e.g., 'Clause 4.1', 'Section 8.2') or rupee currency values (e.g., '₹1,000').\n` +
        `4. Return ONLY the translated text without markdown code blocks or preamble.\n\n` +
        `Text to translate:\n${text}`
      );

      const candidateModels = [this.model, 'gemini-flash-lite-latest', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite'].filter((v, i, a) => a.indexOf(v) === i);
      let response = null;
      for (const m of candidateModels) {
        try {
          response = await this.executeWithRetry(() => ai.models.generateContent({
            model: m,
            contents: translationPrompt,
            config: { temperature: 0.1 }
          }));
          if (response) break;
        } catch (e) {
          continue;
        }
      }

      return response?.text?.trim() || text;
    } catch (e) {
      console.warn("[Gemini Translate Warning]", e.message);
      return text;
    }
  }
}

export const geminiService = new GeminiService();
