import { env } from '../config/env.js';

export class ExternalApiService {
  constructor() {
    this.bhashiniKey = process.env.BHASHINI_API_KEY || '';
    this.bhashiniUserId = process.env.BHASHINI_USER_ID || '';
  }

  /**
   * Translates text using Bhashini Indic Language API if configured,
   * otherwise passes through gracefully.
   */
  async translateIndic(text, sourceLang, targetLang) {
    if (!this.bhashiniKey || !this.bhashiniUserId) {
      return { translated: text, provider: 'local_passthrough' };
    }

    try {
      // If Bhashini credentials are provided, call government Bhashini endpoint
      const response = await fetch('https://dhruva-api.bhashini.gov.in/services/inference/pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.bhashiniKey,
          'userID': this.bhashiniUserId
        },
        body: JSON.stringify({
          pipelineTasks: [{ taskType: "translation", config: { language: { sourceLanguage: sourceLang, targetLanguage: targetLang } } }],
          inputData: { input: [{ source: text }] }
        })
      });

      if (!response.ok) throw new Error(`Bhashini error ${response.status}`);
      const data = await response.json();
      const output = data?.pipelineResponse?.[0]?.output?.[0]?.target || text;
      return { translated: output, provider: 'bhashini_gov_in' };
    } catch (err) {
      console.warn("External Bhashini API warning:", err.message);
      return { translated: text, provider: 'fallback' };
    }
  }

  /**
   * Dispatches mobile OTP notification
   */
  async sendMobileOtp(phone, otpCode) {
    // In hackathon / sandbox mode, logs the dispatch without exposing billing
    console.log(`📱 [External SMS Gateway] Dispatched OTP ${otpCode} to +91 ${phone}`);
    return { success: true, messageId: `msg_${Date.now()}` };
  }
}

export const externalApiService = new ExternalApiService();
