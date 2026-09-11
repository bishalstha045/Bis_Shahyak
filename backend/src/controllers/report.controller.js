import { Report } from '../models/Report.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { isDbConnected } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const createReport = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return sendError(res, "Database service temporarily unavailable.", 503);
    }

    const {
      target_type = 'submission',
      target_id,
      target_title,
      reason,
      description,
      severity = 'medium',
      evidence_urls = []
    } = req.body;

    if (!target_id || !target_title || !reason) {
      return sendError(res, "target_id, target_title, and reason are required to file a report.", 400);
    }

    const reporterId = req.user?.id || 'anonymous';
    const reporterName = req.user?.full_name || 'Concerned Citizen / Inspector';
    const reporterEmail = req.user?.email || req.body.reporter_email || '';

    const newReport = await Report.create({
      reporter_id: reporterId,
      reporter_name: reporterName,
      reporter_email: reporterEmail,
      target_type: ['submission', 'user', 'content', 'standard'].includes(target_type) ? target_type : 'submission',
      target_id,
      target_title,
      reason,
      description: description || reason,
      severity: ['low', 'medium', 'high', 'critical'].includes(severity) ? severity : 'medium',
      status: 'open',
      evidence_urls
    });

    try {
      await ActivityLog.create({
        action: "Citizen / Inspector Filed Compliance Grievance",
        admin_id: reporterId,
        admin_name: reporterName,
        admin_email: reporterEmail,
        target_type: "report",
        target_id: String(newReport._id),
        target_title: `${target_title} (${reason.slice(0, 30)})`,
        details: { target_type, severity },
        timestamp: new Date()
      });
    } catch (actErr) {
      console.warn("ActivityLog creation note:", actErr.message);
    }

    return sendSuccess(res, { report: newReport }, "Report submitted successfully and queued for Directorate review.", 201);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const getMyReports = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return sendError(res, "Database service temporarily unavailable.", 503);
    }

    const userId = req.user?.id;
    const email = req.user?.email;

    const query = {};
    if (userId || email) {
      query.$or = [
        ...(userId ? [{ reporter_id: userId }] : []),
        ...(email ? [{ reporter_email: email.toLowerCase() }] : [])
      ];
    }

    const list = await Report.find(query).sort({ createdAt: -1 });
    return sendSuccess(res, { reports: list });
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};
