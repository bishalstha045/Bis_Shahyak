import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, "Authentication required. Please provide a valid token.", 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return sendError(res, "Invalid or expired token.", 401);
  }

  req.user = decoded;
  next();
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    req.user = verifyToken(token) || null;
  } else {
    req.user = null;
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, "Authentication required. Please provide a valid admin token.", 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return sendError(res, "Invalid or expired token.", 401);
  }

  const role = (decoded.role || '').toLowerCase();
  const isAdmin = decoded.is_admin === true ||
                  role === 'admin' ||
                  role === 'administrator' ||
                  role === 'officer' ||
                  role === 'director';

  if (!isAdmin) {
    return sendError(res, "Access Denied: Administrative privileges required.", 403);
  }

  req.user = decoded;
  next();
};

