import { User } from '../models/User.js';
import { Assessment } from '../models/Assessment.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { isDbConnected } from '../config/db.js';

// In-memory fallback stores
const memoryUsers = new Map();
const memoryAssessments = [];

// Seed default demo user
const demoPasswordHash = "$2a$10$YourDemoHashPlaceholder12345678901234567890";
memoryUsers.set('demo@msme.gov.in', {
  id: 'usr-demo-01',
  email: 'demo@msme.gov.in',
  full_name: 'Anil Sharma',
  company_name: 'Alpha Stainless Works Ltd.',
  role: 'Manufacturer',
  phone: '9876543210',
  sector: 'Consumer Goods & Utensils (IS 17803)',
  enterprise_category: 'MSME - Small Enterprise',
  gstin: '07AAAAA0000A1Z5'
});

export class AuthService {
  async register({ email, password, full_name, company_name, role, phone, sector, enterprise_category, gstin }) {
    const cleanEmail = email.toLowerCase().trim();
    const hashedPassword = await hashPassword(password);

    let userRecord;
    if (isDbConnected()) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        throw new Error("An account with this email address already exists.");
      }
      userRecord = await User.create({
        email: cleanEmail,
        password: hashedPassword,
        full_name,
        company_name: company_name || 'Registered Enterprise',
        role: role || 'Manufacturer',
        phone: phone || '',
        sector: sector || 'Consumer Goods & Utensils',
        enterprise_category: enterprise_category || 'MSME - Small Enterprise',
        gstin: gstin || ''
      });
    } else {
      if (memoryUsers.has(cleanEmail)) {
        throw new Error("An account with this email address already exists.");
      }
      userRecord = {
        id: 'usr-' + Date.now(),
        email: cleanEmail,
        full_name,
        company_name: company_name || 'Registered Enterprise',
        role: role || 'Manufacturer',
        phone: phone || '',
        sector: sector || 'Consumer Goods & Utensils',
        enterprise_category: enterprise_category || 'MSME - Small Enterprise',
        gstin: gstin || ''
      };
      memoryUsers.set(cleanEmail, { ...userRecord, passwordHash: hashedPassword });
    }

    const tokenPayload = {
      id: userRecord._id ? userRecord._id.toString() : userRecord.id,
      email: userRecord.email,
      role: userRecord.role
    };
    const access_token = signToken(tokenPayload);

    const safeUser = {
      id: tokenPayload.id,
      email: userRecord.email,
      full_name: userRecord.full_name,
      company_name: userRecord.company_name,
      role: userRecord.role,
      phone: userRecord.phone,
      sector: userRecord.sector,
      enterprise_category: userRecord.enterprise_category,
      gstin: userRecord.gstin
    };

    return { access_token, user: safeUser };
  }

  async login({ email, password }) {
    const cleanEmail = (email || '').toLowerCase().trim();

    // Support quick demo credentials
    if (cleanEmail === 'demo@msme.gov.in' && (password === 'Demo@1234' || !password)) {
      const demoUser = memoryUsers.get('demo@msme.gov.in');
      const access_token = signToken({ id: demoUser.id, email: demoUser.email, role: demoUser.role });
      return { access_token, user: demoUser };
    }

    if (isDbConnected()) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        throw new Error("Invalid email or password.");
      }
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        throw new Error("Invalid email or password.");
      }

      const access_token = signToken({ id: user._id.toString(), email: user.email, role: user.role });
      return {
        access_token,
        user: {
          id: user._id.toString(),
          email: user.email,
          full_name: user.full_name,
          company_name: user.company_name,
          role: user.role,
          phone: user.phone,
          sector: user.sector,
          enterprise_category: user.enterprise_category,
          gstin: user.gstin
        }
      };
    } else {
      const memUser = memoryUsers.get(cleanEmail);
      if (!memUser) {
        // Create user on-the-fly for demo resilience
        return this.register({
          email: cleanEmail,
          password: password || 'Demo@1234',
          full_name: cleanEmail.split('@')[0],
          company_name: 'Alpha Stainless Works Ltd.',
          role: 'Manufacturer'
        });
      }

      if (memUser.passwordHash) {
        const isMatch = await comparePassword(password, memUser.passwordHash);
        if (!isMatch) throw new Error("Invalid email or password.");
      }

      const access_token = signToken({ id: memUser.id, email: memUser.email, role: memUser.role });
      const safe = { ...memUser };
      delete safe.passwordHash;
      return { access_token, user: safe };
    }
  }

  async saveAssessment(userId, assessmentData) {
    if (isDbConnected()) {
      const created = await Assessment.create({
        user_id: userId,
        product_name: assessmentData.product_name,
        standard_id: assessmentData.standard_id,
        standard_title: assessmentData.standard_title,
        readiness_score: assessmentData.readiness_score,
        matrix: assessmentData.matrix || [],
        next_action: assessmentData.next_action
      });
      return created;
    } else {
      const record = {
        id: 'asm-' + Date.now(),
        user_id: userId,
        ...assessmentData,
        created_at: new Date().toISOString()
      };
      memoryAssessments.push(record);
      return record;
    }
  }

  async getAssessments(userId) {
    if (isDbConnected()) {
      return await Assessment.find({ user_id: userId }).sort({ createdAt: -1 });
    } else {
      return memoryAssessments.filter(a => a.user_id === userId || a.user_id === 'usr-demo-01');
    }
  }
}

export const authService = new AuthService();
