import { Router } from 'express';
import { register, login, me, saveAssessment, getAssessments, demoAdmin, syncUser, submitOrgVerification } from '../controllers/auth.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware.js';
import { validate, registerSchema, loginSchema, assessmentSaveSchema, syncSchema } from '../middleware/validate.middleware.js';

const router = Router();

// Authentication endpoints
router.post('/register', validate(registerSchema), register);
router.post('/submit-verification', submitOrgVerification);
router.post('/login', validate(loginSchema), login);
router.post('/sync', validate(syncSchema), syncUser);
router.post('/demo-admin', demoAdmin);
router.get('/me', requireAuth, me);

// User compliance assessments
router.post('/assessments', optionalAuth, validate(assessmentSaveSchema), saveAssessment);
router.get('/assessments', optionalAuth, getAssessments);

export default router;
