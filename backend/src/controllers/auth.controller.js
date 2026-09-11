import { authService } from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { User } from '../models/User.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, full_name, company_name, role, phone, sector, enterprise_category, gstin } = req.body;

    if (!email || !password || !full_name) {
      return sendError(res, "Full name, email, and password are required.", 400);
    }

    const result = await authService.register({
      email,
      password,
      full_name,
      company_name,
      role,
      phone,
      sector,
      enterprise_category,
      gstin
    });

    return res.status(201).json(result);
  } catch (err) {
    const status = err.message.includes("unavailable") ? 503 : 400;
    return sendError(res, err.message, status);
  }
};

export const syncUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, "Authentication required for sync.", 401);
    }
    const token = authHeader.split(' ')[1];
    
    // The body has been validated by syncSchema
    const profileData = req.body;
    
    const result = await authService.syncSupabaseUser(token, profileData);
    return res.status(200).json(result);
  } catch (err) {
    const status = err.message.includes("unavailable") ? 503 : 401;
    return sendError(res, err.message, status);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email && !password) {
      return sendError(res, "Email and password are required.", 400);
    }

    const result = await authService.login({ email, password });
    return res.status(200).json(result);
  } catch (err) {
    const status = err.message.includes("unavailable") ? 503 : 401;
    return sendError(res, err.message, status);
  }
};

export const demoAdmin = async (req, res, next) => {
  try {
    const result = await authService.getDemoAdminSession();
    return res.status(200).json(result);
  } catch (err) {
    const status = err.message.includes("unavailable") ? 503 : 500;
    return sendError(res, err.message, status);
  }
};

export const me = async (req, res, next) => {
  try {
    const userDoc = await User.findById(req.user.id);
    const userObj = userDoc ? userDoc.toJSON() : req.user;
    return sendSuccess(res, { user: userObj }, "Current user profile fetched");
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const saveAssessment = async (req, res, next) => {
  try {
    const userId = req.user?.id || 'usr-demo-01';
    const assessment = await authService.saveAssessment(userId, req.body);
    return sendSuccess(res, { assessment }, "Compliance assessment saved successfully", 201);
  } catch (err) {
    const status = err.message.includes("unavailable") ? 503 : 500;
    return sendError(res, err.message, status);
  }
};

export const getAssessments = async (req, res, next) => {
  try {
    const userId = req.user?.id || 'usr-demo-01';
    const assessments = await authService.getAssessments(userId);
    return res.status(200).json(assessments);
  } catch (err) {
    const status = err.message.includes("unavailable") ? 503 : 500;
    return sendError(res, err.message, status);
  }
};

export const submitOrgVerification = async (req, res, next) => {
  try {
    const { email, full_name, company_name, role, phone, sector, enterprise_category, gstin } = req.body;
    if (!email) {
      return sendError(res, "Email is required to submit organization verification.", 400);
    }
    const result = await authService.submitOrgVerification({
      email,
      full_name,
      company_name,
      role,
      phone,
      sector,
      enterprise_category,
      gstin
    });
    return res.status(200).json(result);
  } catch (err) {
    const status = err.message.includes("unavailable") ? 503 : 400;
    return sendError(res, err.message, status);
  }
};
