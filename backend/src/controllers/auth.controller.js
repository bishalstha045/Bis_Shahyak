import { authService } from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

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
    return sendError(res, err.message, 400);
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
    return sendError(res, err.message, 401);
  }
};

export const me = async (req, res, next) => {
  try {
    return sendSuccess(res, { user: req.user }, "Current user profile fetched");
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
    return sendError(res, err.message, 500);
  }
};

export const getAssessments = async (req, res, next) => {
  try {
    const userId = req.user?.id || 'usr-demo-01';
    const assessments = await authService.getAssessments(userId);
    return res.status(200).json(assessments);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};
