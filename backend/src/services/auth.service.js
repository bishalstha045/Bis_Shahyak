import { User } from '../models/User.js';
import { Assessment } from '../models/Assessment.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { isDbConnected } from '../config/db.js';
import { env } from '../config/env.js';
import { adminService } from './admin.service.js';

export class AuthService {
  /**
   * Register a new user with email and password strictly into MongoDB.
   */
  async register({ email, password, full_name, company_name, role, phone, sector, enterprise_category, gstin }) {
    if (!isDbConnected()) {
      throw new Error("Authentication service temporarily unavailable.");
    }

    const cleanEmail = email.toLowerCase().trim();
    const hashedPassword = await hashPassword(password);
    const userCompany = (company_name || '').trim() || `${full_name.trim()}'s Enterprise`;

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      // Gracefully update existing user with organization details and ensure verification dossier is created
      existing.full_name = full_name.trim() || existing.full_name;
      existing.company_name = userCompany || existing.company_name;
      if (role) existing.role = role;
      if (phone) existing.phone = phone;
      if (sector) existing.sector = sector;
      if (enterprise_category) existing.enterprise_category = enterprise_category;
      if (gstin) existing.gstin = gstin;
      existing.last_login = new Date();
      await existing.save();

      try {
        await adminService.createOrUpdateOrgVerification(existing);
      } catch (vErr) {
        console.warn("Auto verification queue note on register update:", vErr.message);
      }

      const tokenPayload = {
        id: existing._id.toString(),
        email: existing.email,
        role: existing.role,
        is_admin: existing.is_admin
      };
      const access_token = signToken(tokenPayload);
      return { access_token, user: existing };
    }

    const userRecord = await User.create({
      email: cleanEmail,
      password: hashedPassword,
      full_name: full_name.trim(),
      company_name: userCompany,
      role: role || 'Manufacturer',
      phone: phone || '',
      sector: sector || 'Consumer Goods & Utensils',
      enterprise_category: enterprise_category || 'MSME - Small Enterprise',
      gstin: gstin || '',
      provider: 'local',
      status: 'active',
      is_active: true,
      is_admin: false
    });

    // Automatically queue organization verification application in Admin Panel
    try {
      await adminService.createOrUpdateOrgVerification(userRecord);
    } catch (vErr) {
      console.warn("Auto verification queue note on register:", vErr.message);
    }

    const tokenPayload = {
      id: userRecord._id.toString(),
      email: userRecord.email,
      role: userRecord.role,
      is_admin: false
    };
    const access_token = signToken(tokenPayload);

    const safeUser = {
      id: userRecord._id.toString(),
      email: userRecord.email,
      full_name: userRecord.full_name,
      company_name: userRecord.company_name,
      role: userRecord.role,
      is_admin: false,
      status: userRecord.status,
      phone: userRecord.phone,
      sector: userRecord.sector,
      enterprise_category: userRecord.enterprise_category,
      gstin: userRecord.gstin
    };

    return { access_token, user: safeUser };
  }

  /**
   * Authenticate a user with email and password strictly through MongoDB.
   */
  async login({ email, password }) {
    if (!isDbConnected()) {
      throw new Error("Authentication service temporarily unavailable.");
    }

    const cleanEmail = (email || '').toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      throw new Error("Invalid email or password.");
    }

    if (user.provider === 'supabase' && !user.password) {
      throw new Error("This account is registered via Google/Supabase. Please sign in using Google.");
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password.");
    }

    if (user.status === 'suspended') {
      throw new Error("Account suspended. Please contact administrator.");
    }
    if (user.is_deleted) {
      throw new Error("Account has been deactivated.");
    }

    user.last_login = new Date();
    await user.save();

    const role = (user.role || '').toLowerCase();
    const isAdmin = user.is_admin === true || role === 'admin' || role === 'administrator' || role === 'officer' || role === 'director';

    // Automatically ensure verification dossier is queued for non-admin user
    if (!isAdmin) {
      try {
        await adminService.createOrUpdateOrgVerification(user);
      } catch (vErr) {
        console.warn("Auto verification queue note on login:", vErr.message);
      }
    }

    const access_token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: isAdmin ? 'admin' : (user.role || 'user'),
      is_admin: isAdmin
    });

    return {
      access_token,
      user: {
        id: user._id.toString(),
        email: user.email,
        full_name: user.full_name,
        company_name: user.company_name,
        role: isAdmin ? 'admin' : (user.role || 'user'),
        is_admin: isAdmin,
        status: user.status || 'active',
        phone: user.phone || '',
        sector: user.sector || '',
        enterprise_category: user.enterprise_category || '',
        gstin: user.gstin || ''
      }
    };
  }

  /**
   * Securely sync Supabase Google OAuth user to MongoDB.
   * Prevents duplicates by matching on supabase_id or verified email.
   */
  async syncSupabaseUser(token, profileData) {
    if (!token) throw new Error("Supabase token is required for sync.");

    // 1. Verify token securely with Supabase API
    const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': env.SUPABASE_ANON_KEY
      }
    });

    if (!res.ok) {
      throw new Error("Invalid or expired Supabase token.");
    }

    const { id: supabaseId, email: supabaseEmail, user_metadata } = await res.json();
    const cleanEmail = supabaseEmail.toLowerCase().trim();

    if (!isDbConnected()) {
      throw new Error("Authentication service temporarily unavailable.");
    }

    // 2. Query MongoDB by supabase_id or email to prevent duplicates
    let user = await User.findOne({
      $or: [{ supabase_id: supabaseId }, { email: cleanEmail }]
    });

    const rawCompany = profileData.company_name || user_metadata?.company_name || '';
    const rawFullName = profileData.full_name || user_metadata?.full_name || user_metadata?.name || cleanEmail.split('@')[0];
    const rawPhone = profileData.phone || user_metadata?.mobile_number || user_metadata?.phone || '';
    const rawSector = profileData.sector || user_metadata?.sector || 'Consumer Goods & Utensils';
    const rawCategory = profileData.enterprise_category || user_metadata?.enterprise_category || 'MSME - Small Enterprise';
    const rawGstin = profileData.gstin || user_metadata?.gstin || '';

    if (!user) {
      // Create new user in MongoDB
      user = await User.create({
        email: cleanEmail,
        provider: 'supabase',
        supabase_id: supabaseId,
        full_name: rawFullName,
        company_name: rawCompany,
        role: profileData.role || user_metadata?.role || 'Manufacturer',
        phone: rawPhone,
        sector: rawSector,
        enterprise_category: rawCategory,
        gstin: rawGstin,
        status: 'active',
        is_active: true,
        is_admin: false,
        last_login: new Date()
      });
    } else {
      // Link or update existing MongoDB user
      if (!user.supabase_id) {
        user.supabase_id = supabaseId;
        user.provider = 'supabase';
      }
      if (rawFullName && (!user.full_name || user.full_name === cleanEmail.split('@')[0])) {
        user.full_name = rawFullName;
      }
      if (rawCompany && (!user.company_name || user.company_name === 'Independent Enterprise')) {
        user.company_name = rawCompany;
      }
      if (rawPhone && !user.phone) {
        user.phone = rawPhone;
      }
      if (rawGstin && !user.gstin) {
        user.gstin = rawGstin;
      }
      user.last_login = new Date();
      await user.save();
    }

    // Automatically queue organization verification application in Admin Panel
    const role = (user.role || '').toLowerCase();
    const isAdmin = user.is_admin === true || role === 'admin' || role === 'administrator' || role === 'officer' || role === 'director';

    if (!isAdmin) {
      try {
        await adminService.createOrUpdateOrgVerification(user);
      } catch (vErr) {
        console.warn("Auto verification queue note on sync:", vErr.message);
      }
    }

    const access_token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: isAdmin ? 'admin' : (user.role || 'user'),
      is_admin: isAdmin
    });

    return {
      access_token,
      user: {
        id: user._id.toString(),
        email: user.email,
        full_name: user.full_name,
        company_name: user.company_name,
        role: isAdmin ? 'admin' : (user.role || 'user'),
        is_admin: isAdmin,
        status: user.status || 'active',
        phone: user.phone || '',
        sector: user.sector || '',
        enterprise_category: user.enterprise_category || '',
        gstin: user.gstin || ''
      }
    };
  }

  /**
   * Retrieves verified admin session from MongoDB for authorized evaluation.
   */
  async getDemoAdminSession() {
    if (!isDbConnected()) {
      throw new Error("Authentication service temporarily unavailable.");
    }

    const adminUser = await User.findOne({
      $or: [
        { email: 'admin@admin.com' },
        { is_admin: true },
        { role: 'admin' },
        { email: 'director.admin@standards.local' }
      ]
    });

    if (!adminUser) {
      throw new Error("Admin user account not found in database. Please run seed script.");
    }

    const access_token = signToken({
      id: adminUser._id.toString(),
      email: adminUser.email,
      role: 'admin',
      is_admin: true
    });

    return {
      access_token,
      user: {
        id: adminUser._id.toString(),
        email: adminUser.email,
        full_name: adminUser.full_name,
        company_name: adminUser.company_name,
        role: 'admin',
        is_admin: true,
        status: adminUser.status || 'active',
        phone: adminUser.phone || '',
        sector: adminUser.sector || '',
        enterprise_category: adminUser.enterprise_category || '',
        gstin: adminUser.gstin || ''
      }
    };
  }

  /**
   * Saves user compliance assessment into MongoDB.
   */
  async saveAssessment(userId, assessmentData) {
    if (!isDbConnected()) {
      throw new Error("Authentication service temporarily unavailable.");
    }

    return await Assessment.create({
      user_id: userId,
      product_name: assessmentData.product_name,
      standard_id: assessmentData.standard_id,
      standard_title: assessmentData.standard_title,
      readiness_score: assessmentData.readiness_score,
      matrix: assessmentData.matrix || [],
      next_action: assessmentData.next_action
    });
  }

  /**
   * Fetches assessments for a given user from MongoDB.
   */
  async getAssessments(userId) {
    if (!isDbConnected()) {
      throw new Error("Authentication service temporarily unavailable.");
    }
    return await Assessment.find({ user_id: userId }).sort({ createdAt: -1 });
  }

  /**
   * Directly submit or update organization details and queue for Admin Verification.
   * Can be called during signup, onboarding, or profile updates.
   */
  async submitOrgVerification({ email, full_name, company_name, role, phone, sector, enterprise_category, gstin }) {
    if (!isDbConnected()) {
      throw new Error("Authentication service temporarily unavailable.");
    }

    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail) throw new Error("Valid email address is required.");

    let user = await User.findOne({ email: cleanEmail });
    const userCompany = (company_name || '').trim() || `${(full_name || cleanEmail.split('@')[0]).trim()}'s Enterprise`;

    if (!user) {
      user = await User.create({
        email: cleanEmail,
        full_name: (full_name || cleanEmail.split('@')[0]).trim(),
        company_name: userCompany,
        role: role || 'Manufacturer',
        phone: phone || '',
        sector: sector || 'Consumer Goods & Utensils',
        enterprise_category: enterprise_category || 'MSME - Small Enterprise',
        gstin: gstin || '',
        provider: 'supabase',
        status: 'active',
        is_active: true,
        is_admin: false,
        last_login: new Date()
      });
    } else {
      if (full_name && full_name.trim()) user.full_name = full_name.trim();
      if (company_name && company_name.trim() && company_name !== 'Independent Enterprise') {
        user.company_name = company_name.trim();
      } else if (!user.company_name) {
        user.company_name = userCompany;
      }
      if (role) user.role = role;
      if (phone) user.phone = phone;
      if (sector) user.sector = sector;
      if (enterprise_category) user.enterprise_category = enterprise_category;
      if (gstin) user.gstin = gstin;
      user.last_login = new Date();
      await user.save();
    }

    const submission = await adminService.createOrUpdateOrgVerification(user);
    return { success: true, user, submission };
  }
}

export const authService = new AuthService();
