import { User } from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import { adminService } from './admin.service.js';

export class UserService {
  async getProfile(userId) {
    if (!isDbConnected()) {
      throw new Error("Service temporarily unavailable.");
    }
    const user = await User.findById(userId);
    return user ? user.toJSON() : null;
  }

  async updateProfile(userId, updateData) {
    if (!isDbConnected()) {
      throw new Error("Service temporarily unavailable.");
    }
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (user && (updateData.company_name || updateData.sector || updateData.enterprise_category || updateData.gstin)) {
      try {
        await adminService.createOrUpdateOrgVerification(user);
      } catch (vErr) {
        console.warn("Auto verification queue note on profile update:", vErr.message);
      }
    }
    return user ? user.toJSON() : null;
  }
}

export const userService = new UserService();
