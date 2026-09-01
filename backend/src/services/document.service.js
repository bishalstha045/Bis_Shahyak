import { Document } from '../models/Document.js';
import { isDbConnected } from '../config/db.js';

const memoryDocs = [];

export class DocumentService {
  async saveDocumentRecord({ userId, file, standardId, analysisResults = null }) {
    const docData = {
      user_id: userId || 'anonymous',
      file_name: file ? file.filename : 'direct_input.txt',
      original_name: file ? file.originalname : 'direct_input.txt',
      file_path: file ? file.path : null,
      mime_type: file ? file.mimetype : 'text/plain',
      size_bytes: file ? file.size : 0,
      standard_id: standardId || (analysisResults?.standard_id || 'IS 17803:2022'),
      standard_title: analysisResults?.standard_title || 'Stainless Steel Vacuum Flasks and Bottles',
      readiness_score: analysisResults?.readiness || 75,
      sections: analysisResults?.sections || [],
      summary: analysisResults?.summary || {},
      action_required: analysisResults?.action_required || {}
    };

    if (isDbConnected()) {
      return await Document.create(docData);
    } else {
      const record = { id: 'doc-' + Date.now(), ...docData, created_at: new Date().toISOString() };
      memoryDocs.unshift(record);
      return record;
    }
  }

  async getUserDocuments(userId) {
    if (isDbConnected()) {
      return await Document.find({ user_id: userId }).sort({ createdAt: -1 });
    }
    return memoryDocs.filter(d => d.user_id === userId || d.user_id === 'anonymous');
  }

  async getDocumentById(id) {
    if (isDbConnected()) {
      return await Document.findById(id);
    }
    return memoryDocs.find(d => d.id === id);
  }
}

export const documentService = new DocumentService();
