import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', optionalAuth, getNotifications);
router.patch('/:id/read', optionalAuth, markAsRead);
router.patch('/read-all', optionalAuth, markAllAsRead);

export default router;
