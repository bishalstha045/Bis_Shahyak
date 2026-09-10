import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.middleware.js';
import {
  getDashboardStats,
  getVerifications,
  getVerificationById,
  approveVerification,
  rejectVerification,
  getUsers,
  updateUserStatus,
  deleteUser,
  getReports,
  resolveReport,
  dismissReport,
  getActivityLogs,
  getContent,
  getSettings
} from '../controllers/admin.controller.js';

const router = Router();

// Strict RBAC Middleware: Asserts user is authenticated and has administrative role
router.use(requireAdmin);

// Admin Dashboard Analytics
router.get('/dashboard/stats', getDashboardStats);

// Verification Submissions
router.get('/verifications', getVerifications);
router.get('/verifications/:id', getVerificationById);
router.post('/verifications/:id/approve', approveVerification);
router.post('/verifications/:id/reject', rejectVerification);

// User Management
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Moderation & Platform Reports
router.get('/reports', getReports);
router.patch('/reports/:id/resolve', resolveReport);
router.patch('/reports/:id/dismiss', dismissReport);

// Audit Activity Logs
router.get('/activity', getActivityLogs);

// Content & System Settings
router.get('/content', getContent);
router.get('/settings', getSettings);

export default router;
