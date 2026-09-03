import { z } from 'zod';
import { sendError } from '../utils/response.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issues = err.issues || err.errors || [];
      const formattedErrors = issues.map(e => ({
        field: Array.isArray(e.path) ? e.path.join('.') : 'field',
        message: e.message
      }));
      return sendError(res, "Validation failed", 400, formattedErrors);
    }
    return sendError(res, "Malformed request body", 400);
  }
};

export const validateQuery = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.query);
    req.query = parsed;
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issues = err.issues || err.errors || [];
      const formattedErrors = issues.map(e => ({
        field: Array.isArray(e.path) ? e.path.join('.') : 'field',
        message: e.message
      }));
      return sendError(res, "Query parameter validation failed", 400, formattedErrors);
    }
    return sendError(res, "Malformed query parameters", 400);
  }
};

// =========================================================================
// ZOD SCHEMAS (Strictly Aligned with OpenAPI & Frontend Specifications)
// =========================================================================

export const registerSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
  full_name: z.string().min(1, "Full name is required."),
  company_name: z.string().optional().default("Independent Enterprise"),
  role: z.string().optional().default("Manufacturer"),
  phone: z.string().optional().default(""),
  sector: z.string().optional().default("Consumer Goods & Utensils"),
  enterprise_category: z.string().optional().default("MSME - Small Enterprise"),
  gstin: z.string().optional().default("")
});

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
  password: z.string().min(1, "Password is required.")
});

export const assessmentSaveSchema = z.object({
  product_name: z.string().min(1, "product_name is required."),
  standard_id: z.string().min(1, "standard_id is required."),
  standard_title: z.string().min(1, "standard_title is required."),
  readiness_score: z.number().min(0).max(100),
  matrix: z.array(z.any()).default([]),
  next_action: z.string().optional().nullable()
});

export const productToStandardSchema = z.object({
  product_query: z.string().min(1, "product_query is required."),
  language: z.string().optional().default("en")
});

export const complianceEvaluateSchema = z.object({
  product_query: z.string().optional().nullable(),
  standard_id: z.string().optional().nullable(),
  user_evidence_items: z.array(z.any()).optional().default([])
});

export const standardCompareSchema = z.object({
  standard_a: z.string().min(1, "standard_a is required."),
  standard_b: z.string().min(1, "standard_b is required.")
});

export const verifyLicenseSchema = z.object({
  isi_number: z.string().min(1, "isi_number is required."),
  product_type: z.string().optional().nullable()
});

export const chatSchema = z.object({
  query: z.string().min(1, "query string is required."),
  mode: z.enum(["simple", "expert"]).optional().default("simple"),
  language: z.string().optional().default("auto"),
  sector: z.string().optional().nullable(),
  session_id: z.string().optional().nullable()
});

export const documentAnalyzeSchema = z.object({
  file_name: z.string().min(1, "file_name is required."),
  content_text: z.string().default(""),
  standard_id: z.string().optional().nullable()
});
