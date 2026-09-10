import { adminService } from '../services/admin.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await adminService.getDashboardStats();
    return sendSuccess(res, stats, "Admin dashboard stats retrieved successfully");
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const getVerifications = async (req, res) => {
  try {
    const { search, status, category } = req.query;
    const list = await adminService.getVerifications({ search, status, category });
    return sendSuccess(res, { submissions: list });
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const getVerificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await adminService.getVerificationById(id);
    if (!submission) {
      return sendError(res, "Verification submission not found", 404);
    }
    return sendSuccess(res, { submission });
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const approveVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const approved = await adminService.approveVerification(id, req.user);
    return sendSuccess(res, { submission: approved }, "Submission successfully verified and approved");
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

export const rejectVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason || !rejection_reason.trim()) {
      return sendError(res, "A rejection reason is strictly required to reject a submission.", 400);
    }

    const rejected = await adminService.rejectVerification(id, rejection_reason, req.user);
    return sendSuccess(res, { submission: rejected }, "Submission rejected");
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

export const getUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const users = await adminService.getUsers({ search, role, status });
    return sendSuccess(res, { users });
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return sendError(res, "Status must be 'active' or 'suspended'.", 400);
    }

    const updated = await adminService.updateUserStatus(id, status, req.user);
    return sendSuccess(res, { user: updated }, `User account status updated to ${status}`);
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.softDeleteUser(id, req.user);
    return sendSuccess(res, result, "User account archived successfully");
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

export const getReports = async (req, res) => {
  try {
    const { search, status } = req.query;
    const reports = await adminService.getReports({ search, status });
    return sendSuccess(res, { reports });
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution_notes, action_taken } = req.body;

    const resolved = await adminService.resolveReport(id, { resolution_notes, action_taken }, req.user);
    return sendSuccess(res, { report: resolved }, "Report marked as resolved");
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

export const dismissReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const dismissed = await adminService.dismissReport(id, { notes }, req.user);
    return sendSuccess(res, { report: dismissed }, "Report dismissed");
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};

export const getActivityLogs = async (req, res) => {
  try {
    const { limit, target_type } = req.query;
    const logs = await adminService.getActivityLogs({ limit, target_type });
    return sendSuccess(res, { activities: logs });
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const getContent = async (req, res) => {
  try {
    const content = await adminService.getContentItems();
    return sendSuccess(res, content);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const getSettings = async (req, res) => {
  try {
    const settings = await adminService.getSettings();
    return sendSuccess(res, settings);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};
