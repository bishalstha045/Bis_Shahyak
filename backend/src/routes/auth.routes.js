import { Router } from 'express';
import { register, login, me, saveAssessment, getAssessments, requestOtp, verifyOtp } from '../controllers/auth.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware.js';
import { validate, registerSchema, loginSchema, assessmentSaveSchema, otpRequestSchema, otpVerifySchema } from '../middleware/validate.middleware.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', requireAuth, me);
router.post('/assessments', optionalAuth, validate(assessmentSaveSchema), saveAssessment);
router.get('/assessments', optionalAuth, getAssessments);
router.post('/otp/request', validate(otpRequestSchema), requestOtp);
router.post('/otp/verify', validate(otpVerifySchema), verifyOtp);

export default router;
