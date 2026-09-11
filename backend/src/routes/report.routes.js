import { Router } from 'express';
import { createReport, getMyReports } from '../controllers/report.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', optionalAuth, createReport);
router.get('/my', optionalAuth, getMyReports);

export default router;
