import { Router } from 'express';
import {
  getDatasetStats,
  mapProduct,
  evaluateCompliance,
  compareStandards,
  verifyLicense,
  exportPDF,
  submitFeedback,
  translateText,
  getStandards,
  getStandardById,
  searchStandards
} from '../controllers/rag.controller.js';
import {
  validate,
  productToStandardSchema,
  complianceEvaluateSchema,
  standardCompareSchema,
  verifyLicenseSchema
} from '../middleware/validate.middleware.js';

const router = Router();

router.get('/dataset-stats', getDatasetStats);
router.get('/standards', getStandards);
router.get('/standards/:id', getStandardById);
router.get('/search', searchStandards);
router.post('/product-to-standard', validate(productToStandardSchema), mapProduct);
router.post('/compliance/evaluate', validate(complianceEvaluateSchema), evaluateCompliance);
router.post('/standards/compare', validate(standardCompareSchema), compareStandards);
router.post('/verify', validate(verifyLicenseSchema), verifyLicense);
router.post('/export/pdf', exportPDF);
router.post('/feedback', submitFeedback);
router.post('/translate', translateText);

export default router;

