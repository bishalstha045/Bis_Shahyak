import { Router } from 'express';
import { uploadAndAnalyze, analyzeTextDocument, getDocuments, getDocumentById, downloadDocument } from '../controllers/document.controller.js';
import { upload } from '../middleware/upload.middleware.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Multipart file upload with Multer
router.post('/upload', optionalAuth, upload.single('file'), uploadAndAnalyze);

// Direct JSON text analysis
router.post('/analyze', optionalAuth, analyzeTextDocument);

// Document metadata lists & file retrieval
router.get('/', optionalAuth, getDocuments);
router.get('/:id', optionalAuth, getDocumentById);
router.get('/:id/file', optionalAuth, downloadDocument);
router.get('/:id/download', optionalAuth, downloadDocument);

export default router;
