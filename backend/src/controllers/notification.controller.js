import { notificationService } from '../services/notification.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getNotifications = async (req, res) => {
  try {
    const type = req.query.type || 'all';
    const unreadOnly = req.query.unread_only === 'true';

    const notifs = await notificationService.getAll({ type, unreadOnly });
    return res.status(200).json(notifs);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await notificationService.markAsRead(id);
    return sendSuccess(res, { notification: updated }, "Notification marked as read");
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead();
    return sendSuccess(res, {}, "All notifications marked as read");
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};
