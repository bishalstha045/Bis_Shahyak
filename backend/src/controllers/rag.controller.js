import { ragService } from '../services/rag.service.js';
import { externalApiService } from '../services/api.service.js';
import { getDbInfo } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { HsCode } from '../models/HsCode.js';
import { normalizeHsCode } from '../utils/hs_helper.js';

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

export const translateText = async (req, res) => {
  try {
    const { text, source_lang, source_language, target_lang, target_language } = req.body;
    const sLang = source_lang || source_language || 'en';
    const tLang = target_lang || target_language || 'hi';
    if (!text) {
      return sendError(res, "text parameter is required.", 400);
    }
    const result = await externalApiService.translateIndic(text, sLang, tLang);
    return res.status(200).json({
      ...result,
      translated_text: result.translated
    });
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const getStandards = async (req, res) => {
  try {
    const standards = ragService.getAllStandards();
    return res.status(200).json({
      success: true,
      count: standards.length,
      standards
    });
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const getStandardById = async (req, res) => {
  try {
    const rawParam = (req.params.id || '').trim();
    if (!rawParam) {
      return res.status(400).json({ success: false, message: "Standard identifier or HS code is required." });
    }

    const normalizedHs = normalizeHsCode(rawParam);

    // 1. If input is or normalizes to an HS code, search MongoDB collection hs_codes
    if (normalizedHs) {
      const hsDoc = await HsCode.findOne({ hs_code: normalizedHs }).lean();
      if (hsDoc) {
        // Also fetch related sub-items under the same 4-digit heading
        const prefix4 = normalizedHs.slice(0, 4);
        const related = await HsCode.find({
          hs_code: { $regex: `^${prefix4}`, $ne: hsDoc.hs_code }
        }).limit(8).lean();

        return res.status(200).json({
          success: true,
          type: 'hs_code',
          data: {
            hs_code: hsDoc.hs_code,
            description: hsDoc.description,
            related_items: related.map(r => ({ hs_code: r.hs_code, description: r.description }))
          }
        });
      }

      // Check prefix match in MongoDB if exact code not found
      const prefixMatch = await HsCode.find({
        hs_code: new RegExp(`^${normalizedHs}`)
      }).limit(8).lean();
      if (prefixMatch.length > 0) {
        return res.status(200).json({
          success: true,
          type: 'hs_code',
          data: {
            hs_code: prefixMatch[0].hs_code,
            description: prefixMatch[0].description,
            related_items: prefixMatch.slice(1).map(r => ({ hs_code: r.hs_code, description: r.description }))
          }
        });
      }
    }

    // 2. Check if rawParam matches an Indian Standard by ID (e.g. "IS 2347", "2347", "IS 17803")
    const standard = ragService.getStandardById(rawParam);
    if (standard) {
      return res.status(200).json({
        success: true,
        type: 'standard',
        data: standard,
        standard
      });
    }

    // 3. Check MongoDB hs_codes by product description keyword (e.g. "boneless", "horses for polo", "tuna")
    const escapedParam = rawParam.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const hsMatches = await HsCode.find({
      $or: [
        { hs_code: new RegExp(escapedParam, 'i') },
        { description: new RegExp(escapedParam, 'i') }
      ]
    }).limit(10).lean();

    if (hsMatches.length > 0) {
      return res.status(200).json({
        success: true,
        type: 'hs_code',
        data: {
          hs_code: hsMatches[0].hs_code,
          description: hsMatches[0].description,
          related_items: hsMatches.slice(1).map(r => ({ hs_code: r.hs_code, description: r.description }))
        }
      });
    }

    // 4. Check Indian Standards by title or applicable products (e.g. "pressure cooker", "water bottle")
    const allStandards = ragService.getAllStandards();
    const cleanLower = rawParam.toLowerCase();
    const matchedStd = allStandards.find(s =>
      s.title?.toLowerCase().includes(cleanLower) ||
      s.applicable_products?.some(p => p.toLowerCase().includes(cleanLower)) ||
      s.sector?.toLowerCase().includes(cleanLower)
    );
    if (matchedStd) {
      return res.status(200).json({
        success: true,
        type: 'standard',
        data: matchedStd,
        standard: matchedStd
      });
    }

    // 5. Not found response
    return res.status(404).json({
      success: false,
      message: "HS Code not found"
    });
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const searchStandards = async (req, res) => {
  try {
    const query = req.query.q || req.query.query || '';
    if (!query.trim()) {
      return sendError(res, "Query parameter 'q' is required for search.", 400);
    }
    const sector = req.query.sector || null;
    const limit = parseInt(req.query.limit || '10', 10);
    const results = await ragService.searchStandards(query, sector, limit);

    // Also search HSN records if query looks like an HSN code or product
    const escaped = query.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const hsnDocs = await HsCode.find({
      $or: [
        { hs_code: new RegExp(escaped, 'i') },
        { description: new RegExp(escaped, 'i') }
      ]
    }).limit(limit).lean();

    return res.status(200).json({
      ...results,
      hs_codes: hsnDocs.map(d => ({ hs_code: d.hs_code, description: d.description }))
    });
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

