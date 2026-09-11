import fs from 'fs';
import { Document } from '../models/Document.js';
import { isDbConnected } from '../config/db.js';

export class DocumentService {
  async saveDocumentRecord({ userId, file, standardId, analysisResults = null }) {
    if (!isDbConnected()) {
      throw new Error("Database service temporarily unavailable.");
    }

    let fileBase64 = null;
    if (file && file.path && fs.existsSync(file.path)) {
      try {
        fileBase64 = fs.readFileSync(file.path).toString('base64');
      } catch (readErr) {
        console.warn("Could not encode file to base64:", readErr.message);
      }
    }

    const docData = {
      user_id: userId || 'anonymous',
      file_name: file ? file.filename : 'direct_input.txt',
      original_name: file ? file.originalname : 'direct_input.txt',
      file_path: file ? file.path : null,
      file_data: fileBase64,
      mime_type: file ? file.mimetype : 'text/plain',
      size_bytes: file ? file.size : 0,
      standard_id: standardId || (analysisResults?.standard_id || 'IS 17803:2022'),
      standard_title: analysisResults?.standard_title || 'Stainless Steel Vacuum Flasks and Bottles',
      readiness_score: analysisResults?.readiness || 75,
      sections: analysisResults?.sections || [],
      summary: analysisResults?.summary || {},
      action_required: analysisResults?.action_required || {}
    };

    return await Document.create(docData);
  }

  async getUserDocuments(userId) {
    if (!isDbConnected()) {
      throw new Error("Database service temporarily unavailable.");
    }
    return await Document.find({ user_id: userId }).select('-file_data').sort({ createdAt: -1 });
  }

  async getDocumentById(id) {
    if (!isDbConnected()) {
      throw new Error("Database service temporarily unavailable.");
    }
    return await Document.findById(id);
  }
}

export const documentService = new DocumentService();
