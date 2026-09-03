import { Router } from 'express';
import { register, login, me, saveAssessment, getAssessments } from '../controllers/auth.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware.js';
import { validate, registerSchema, loginSchema, assessmentSaveSchema } from '../middleware/validate.middleware.js';

const router = Router();

// Authentication endpoints
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', requireAuth, me);

// User compliance assessments
router.post('/assessments', optionalAuth, validate(assessmentSaveSchema), saveAssessment);
router.get('/assessments', optionalAuth, getAssessments);

export default router;
