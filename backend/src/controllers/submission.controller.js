import { VerificationSubmission } from '../models/VerificationSubmission.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const createSubmission = async (req, res) => {
  try {
    const {
      applicant_name,
      applicant_email,
      company_name,
      phone,
      gstin,
      udyam_number,
      enterprise_category,
      category,
      standard_id,
      standard_title,
      product_name,
      submission_title,
      state,
      district,
      factory_address,
      annual_capacity,
      readiness_score,
      documents
    } = req.body;

    if (!standard_id || !product_name || !company_name) {
      return sendError(res, "Standard ID, Product Name, and Enterprise Name are required.", 400);
    }

    const applicantId = req.user?.id || `usr-${Date.now().toString(36)}`;
    const applicantEmail = req.user?.email || applicant_email || 'applicant@msme.local';
    const applicantName = req.user?.full_name || applicant_name || 'Authorized Representative';

    const newSub = await VerificationSubmission.create({
      applicant_id: applicantId,
      applicant_name: applicantName,
      applicant_email: applicantEmail,
      company_name,
      phone: phone || req.user?.phone || '',
      gstin: gstin || req.user?.gstin || '',
      udyam_number: udyam_number || '',
      enterprise_category: enterprise_category || req.user?.enterprise_category || 'MSME - Small Enterprise',
      category: category || 'Consumer Goods & Utensils',
      standard_id,
      standard_title: standard_title || `Standard Specification ${standard_id}`,
      product_name,
      submission_title: submission_title || `Conformity Assessment Dossier for ${product_name}`,
      state: state || 'New Delhi',
      district: district || 'Central',
      factory_address: factory_address || '',
      annual_capacity: annual_capacity || '50,000 units/year',
      readiness_score: Number(readiness_score) || 75,
      documents: Array.isArray(documents) && documents.length > 0 ? documents : [
        { name: "NABL_Accredited_Lab_Report.pdf", type: "Test Certificate", lab: "National Test House", date: new Date().toISOString().slice(0, 10), status: "PASS" },
        { name: "Quality_Control_Manual_FormV.pdf", type: "Quality Dossier", lab: "Internal QC", date: new Date().toISOString().slice(0, 10), status: "VERIFIED" }
      ],
      status: 'pending',
      officer_remarks: 'Application submitted via citizen/enterprise portal. Awaiting administrative audit.',
      submitted_at: new Date()
    });

    // Record activity audit entry in MongoDB
    try {
      await ActivityLog.create({
        action: "Application Submitted by Manufacturer",
        admin_id: applicantId,
        admin_name: applicantName,
        admin_email: applicantEmail,
        target_type: "submission",
        target_id: String(newSub._id),
        target_title: `${company_name} (${standard_id})`,
        details: { product_name, readiness_score: newSub.readiness_score },
        timestamp: new Date()
      });
    } catch (actErr) {
      console.warn("ActivityLog creation note:", actErr.message);
    }

    return sendSuccess(res, { submission: newSub }, "Verification application submitted successfully", 201);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const getMySubmissions = async (req, res) => {
  try {
    const userEmail = req.user?.email;
    const userId = req.user?.id;

    const query = {};
    if (userEmail || userId) {
      query.$or = [
        ...(userId ? [{ applicant_id: userId }] : []),
        ...(userEmail ? [{ applicant_email: userEmail.toLowerCase() }] : [])
      ];
    }

    const list = await VerificationSubmission.find(query).sort({ submitted_at: -1 });
    return sendSuccess(res, { submissions: list });
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};
