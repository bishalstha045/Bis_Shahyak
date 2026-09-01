import { Router } from 'express';
import {
  getDatasetStats,
  mapProduct,
  evaluateCompliance,
  compareStandards,
  verifyLicense,
  exportPDF,
  submitFeedback
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
router.post('/product-to-standard', validate(productToStandardSchema), mapProduct);
router.post('/compliance/evaluate', validate(complianceEvaluateSchema), evaluateCompliance);
router.post('/standards/compare', validate(standardCompareSchema), compareStandards);
router.post('/verify', validate(verifyLicenseSchema), verifyLicense);
router.post('/export/pdf', exportPDF);
router.post('/feedback', submitFeedback);

export default router;
