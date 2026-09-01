import { ragService } from '../services/rag.service.js';
import { getDbInfo } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const healthCheck = async (req, res) => {
  const ragStatus = await ragService.checkHealth();
  const dbInfo = getDbInfo();

  return res.status(200).json({
    status: "healthy",
    service: "BIS Sahayak V2 — Main Express Backend",
    version: "2.0.0",
    database: {
      connected: dbInfo.connected,
      engine: dbInfo.type,
      host: dbInfo.host,
      database_name: dbInfo.name
    },
    rag_engine: {
      status: ragStatus.status || "healthy",
      service: ragStatus.service || "FastAPI RAG Engine",
      indexed_standards_count: ragStatus.indexed_standards_count || 21,
      target_url: ragService.baseUrl
    },
    features: [
      "JWT Authentication & MSME Organization Profiles",
      "Product-to-Standard Scope Mapping",
      "Why-This-Standard Statutory Explainability",
      "Evidence-First RAG & Real-Time SSE Token Streaming",
      "Compliance Readiness Engine (Dual Gauges)",
      "Document & Test Report Analyzer (Multer + OCR)",
      "Standard Comparator (11 Attributes)",
      "ISI / CML Authentic License Verifier",
      "Official ReportLab Form V PDF Export",
      "Regulatory Notifications & Gap Alerts Engine"
    ]
  });
};

export const getDatasetStats = async (req, res) => {
  try {
    const stats = await ragService.getDatasetStats();
    return res.status(200).json(stats);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const mapProduct = async (req, res) => {
  try {
    const { product_query, language } = req.body;
    if (!product_query) {
      return sendError(res, "product_query is required.", 400);
    }
    const result = await ragService.mapProductToStandard(product_query, language);
    return res.status(200).json(result);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const evaluateCompliance = async (req, res) => {
  try {
    const { product_query, standard_id, user_evidence_items } = req.body;
    const result = await ragService.evaluateComplianceMatrix({
      product_query,
      standard_id,
      user_evidence_items
    });
    return res.status(200).json(result);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const compareStandards = async (req, res) => {
  try {
    const { standard_a, standard_b } = req.body;
    const result = await ragService.compareStandards(standard_a, standard_b);
    return res.status(200).json(result);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const verifyLicense = async (req, res) => {
  try {
    const { isi_number, product_type } = req.body;
    if (!isi_number) {
      return sendError(res, "isi_number is required.", 400);
    }
    const result = await ragService.verifyISILicense(isi_number, product_type);
    return res.status(200).json(result);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const exportPDF = async (req, res) => {
  try {
    const { product_description, standards, language, company_name } = req.body;
    const pdfRes = await ragService.downloadChecklistPDF({
      product_description,
      standards,
      language,
      company_name
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="BIS_Compliance_Checklist.pdf"`);
    
    const arrayBuffer = await pdfRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const submitFeedback = async (req, res) => {
  try {
    const { session_id, message_id, rating, comment } = req.body;
    return sendSuccess(res, { session_id, message_id, rating }, "Feedback recorded successfully");
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};
