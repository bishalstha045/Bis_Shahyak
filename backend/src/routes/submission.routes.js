import { Router } from 'express';
import { createSubmission, getMySubmissions } from '../controllers/submission.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Submit new verification dossier (public enterprise / logged in user)
router.post('/', optionalAuth, createSubmission);

// Get user's own submissions
router.get('/my', optionalAuth, getMySubmissions);

export default router;
