import { userService } from '../services/user.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getProfile = async (req, res) => {
  try {
    const profile = await userService.getProfile(req.user.id);
    return sendSuccess(res, { profile });
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updated = await userService.updateProfile(req.user.id, req.body);
    return sendSuccess(res, { profile: updated }, "Profile updated successfully");
  } catch (err) {
    return sendError(res, err.message, 400);
  }
};
