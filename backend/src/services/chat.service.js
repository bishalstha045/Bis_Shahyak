import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { isDbConnected } from '../config/db.js';

export class ChatService {
  async saveMessage({ sessionId, userId = 'anonymous', role, content, confidence = 85, citations = [], mode = 'simple', language = 'auto', processingTime = 0.4 }) {
    if (!isDbConnected()) {
      throw new Error("Database service temporarily unavailable.");
    }

    await Conversation.findOneAndUpdate(
      { session_id: sessionId },
      { session_id: sessionId, user_id: userId, language, mode },
      { upsert: true, new: true }
    );

    return await Message.create({
      session_id: sessionId,
      role,
      content,
      confidence,
      citations,
      mode,
      language,
      processing_time: processingTime
    });
  }

  async getSessionHistory(sessionId) {
    if (!isDbConnected()) {
      throw new Error("Database service temporarily unavailable.");
    }
    return await Message.find({ session_id: sessionId }).sort({ createdAt: 1 });
  }
}

export const chatService = new ChatService();
