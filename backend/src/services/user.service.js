import { User } from '../models/User.js';
import { isDbConnected } from '../config/db.js';

export class UserService {
  async getProfile(userId) {
    if (isDbConnected()) {
      const user = await User.findById(userId);
      return user ? user.toJSON() : null;
    }
    return {
      id: userId,
      email: 'demo@msme.gov.in',
      full_name: 'Anil Sharma',
      company_name: 'Alpha Stainless Works Ltd.',
      role: 'Manufacturer',
      sector: 'Consumer Goods & Utensils (IS 17803)'
    };
  }

  async updateProfile(userId, updateData) {
    if (isDbConnected()) {
      const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
      return user ? user.toJSON() : null;
    }
    return { id: userId, ...updateData };
  }
}

export const userService = new UserService();
