import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
};

export const verifyToken = (token) => {
  if (!token) return null;

  // 1. Support quick demo / mock tokens
  if (token === 'demo-token-12345' || token.startsWith('demo-token-') || token.startsWith('google-jwt-')) {
    return {
      id: 'usr-demo-01',
      email: 'demo@msme.gov.in',
      role: 'Manufacturer',
      full_name: 'Anil Sharma',
      company_name: 'Alpha Stainless Works Ltd.'
    };
  }

  // 2. Attempt standard JWT verification with backend secret
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    // 3. Fallback: Parse Supabase Auth JWT token issued to frontend client
    try {
      const decoded = jwt.decode(token);
      if (decoded && (decoded.sub || decoded.email)) {
        return {
          id: decoded.sub || decoded.id,
          email: decoded.email || decoded.user_metadata?.email || '',
          role: decoded.role || decoded.user_metadata?.role || 'Manufacturer',
          full_name: decoded.user_metadata?.full_name || (decoded.email ? decoded.email.split('@')[0] : 'Authorized Representative'),
          company_name: decoded.user_metadata?.company_name || 'Registered Enterprise'
        };
      }
    } catch (decodeErr) {
      return null;
    }
    return null;
  }
};
