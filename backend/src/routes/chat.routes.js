import { Router } from 'express';
import { sendChat, streamChat, getChatHistory } from '../controllers/chat.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';
import { validate, chatSchema } from '../middleware/validate.middleware.js';

const router = Router();

router.post('/', optionalAuth, validate(chatSchema), sendChat);
router.post('/stream', optionalAuth, validate(chatSchema), streamChat);
router.get('/history', optionalAuth, getChatHistory);
router.get('/history/:sessionId', optionalAuth, getChatHistory);

export default router;
