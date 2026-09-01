import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { isDbConnected } from '../config/db.js';

const memoryMessages = [];

export class ChatService {
  async saveMessage({ sessionId, userId = 'anonymous', role, content, confidence = 85, citations = [], mode = 'simple', language = 'auto', processingTime = 0.4 }) {
    if (isDbConnected()) {
      await Conversation.findOneAndUpdate(
        { session_id: sessionId },
        { session_id: sessionId, user_id: userId, language, mode },
        { upsert: true, new: true }
      );

      const msg = await Message.create({
        session_id: sessionId,
        role,
        content,
        confidence,
        citations,
        mode,
        language,
        processing_time: processingTime
      });
      return msg;
    } else {
      const msg = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        session_id: sessionId,
        user_id: userId,
        role,
        content,
        confidence,
        citations,
        mode,
        language,
        processing_time: processingTime,
        timestamp: new Date().toISOString()
      };
      memoryMessages.push(msg);
      return msg;
    }
  }

  async getSessionHistory(sessionId) {
    if (isDbConnected()) {
      return await Message.find({ session_id: sessionId }).sort({ createdAt: 1 });
    }
    return memoryMessages.filter(m => m.session_id === sessionId);
  }
}

export const chatService = new ChatService();
