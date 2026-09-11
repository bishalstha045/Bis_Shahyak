import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { VerificationSubmission } from '../models/VerificationSubmission.js';
import { Report } from '../models/Report.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { SystemSettings } from '../models/SystemSettings.js';
import { Standard } from '../models/Standard.js';
import { Licence } from '../models/Licence.js';
import { isDbConnected } from '../config/db.js';
import { notificationService } from './notification.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AdminService {
  constructor() {
    this.seededMongo = false;
  }

  // Ensure initial seed data is inserted into MongoDB if empty
  async ensureMongoSeeded() {
    if (this.seededMongo || !isDbConnected()) return;
    try {
      // 1. Seed System Settings
      const settingsCount = await SystemSettings.countDocuments();
      if (settingsCount === 0) {
        await SystemSettings.create({
          system_name: "Bureau of Indian Standards — Compliance Control Gateway",
          version: "2.0.0",
          qco_enforcement_mode: "Strict Gazette Mandatory",
          auto_cml_issuance: true,
          require_dual_signoff: false,
          high_risk_categories: ["Household Electrical", "Chemical", "Medical & Healthcare Devices", "Automotive Safety"],
          log_retention_days: 90,
          last_saved_by: "Dr. Rajesh Verma",
          last_saved_at: new Date()
        });
      }

      // 2. Seed Standards from standards_metadata.json
      const stdCount = await Standard.countDocuments();
      if (stdCount === 0) {
        try {
          const standardsPath = path.resolve(__dirname, '../../data/standards_metadata.json');
          if (fs.existsSync(standardsPath)) {
            const raw = JSON.parse(fs.readFileSync(standardsPath, 'utf8'));
            const docs = raw.map(s => ({
              standard_id: s.id,
              title: s.title,
              sector: s.sector,
              year: s.year || '2024',
              status: s.status || 'Current / Mandatory under QCO',
              effective_date: s.effective_date || '2025-01-01',
              superseded_status: s.superseded_status || 'Active',
              is_qco_mandatory: (s.status || '').toLowerCase().includes('mandatory') || (s.status || '').toLowerCase().includes('qco'),
              qco_reference: 'Gazette of India Quality Control Order 2026',
              applicable_products: s.applicable_products || [],
              characteristics: s.characteristics || [],
              intended_use: s.intended_use || [],
              key_clauses: s.key_clauses || [],
              source_url: s.source_url || '',
              active: true
            }));
            await Standard.insertMany(docs);
          }
        } catch (stdErr) {
          console.warn("Standards seeding note:", stdErr.message);
        }
      }

      // 3. Official Admin Account ONLY
      const adminExists = await User.findOne({ email: "admin@admin.com" });
      if (!adminExists) {
        const adminHashedPassword = await bcrypt.hash('Admin@123', 10);
        await User.create({
          email: "admin@admin.com",
          password: adminHashedPassword,
          full_name: "Chief Regulatory Officer",
          company_name: "Bureau of Indian Standards",
          role: "admin",
          phone: "011-23230131",
          sector: "Central Regulatory Directorate",
          enterprise_category: "Statutory Standards Authority",
          gstin: "07AAAAA0000A1Z5",
          is_active: true,
          is_admin: true,
          status: "active"
        });
      }

      // Automatically purge any leftover legacy dummy test data
      await this.purgeUnwantedData();

      this.seededMongo = true;
    } catch (e) {
      console.warn("MongoDB seed note:", e.message);
    }
  }

  async purgeUnwantedData() {
    if (!isDbConnected()) return;
    try {
      const dummyEmailPatterns = [
        /^msme\.partner/i,
        /^dormant\.unit/i,
        /^enterprise\.\d+/i,
        /^manufacturer_\d+/i,
        /^app_user_\d+/i,
        /^rej_user_\d+/i,
        /^demo\.user@/i,
        /^director\.admin@/i,
        /^anil\.sharma@bharatcookware/i,
        /^v\.chauhan@himalayanthermal/i,
        /^sunil@apexfootwear/i,
        /^test\.user/i,
        /@manufacture\.test/i,
        /bajajelectricals-demo/i,
        /apexpressure/i,
        /^demo\.manufacturer@/i
      ];

      await User.deleteMany({
        $or: dummyEmailPatterns.map(pattern => ({ email: pattern }))
      });

      await VerificationSubmission.deleteMany({
        $or: [
          { id: { $in: ['sub-101', 'sub-102', 'sub-103', 'sub-104'] } },
          { applicant_email: { $in: ['anil.sharma@bharatcookware.in', 'v.chauhan@himalayanthermal.com', 'sunil@apexfootwear.in', 'rajesh@quickpack.in', 'demo.manufacturer@example.com'] } },
          ...dummyEmailPatterns.map(pattern => ({ applicant_email: pattern }))
        ]
      });

      await Report.deleteMany({
        $or: [
          { id: { $in: ['rep-201', 'rep-202', 'rep-203'] } },
          { reporter_email: { $in: ['vigilance@consumersafety.org.in', 'anil.sharma@bharatcookware.in', 'audit.north@standards.internal', 'kavita.citizen@consumerhelp.in', 'arvind@msmecouncil.org'] } }
        ]
      });

      await ActivityLog.deleteMany({
        $or: [
          { id: { $in: ['act-301', 'act-302', 'act-303', 'act-1', 'act-2', 'act-3', 'act-4'] } },
          { admin_email: 'director.admin@standards.internal' }
        ]
      });

      await Licence.deleteMany({
        cml_number: { $in: ['CM/L-7128394', 'CM/L-8492015', 'CM/L-5201948', 'CM/L-8419203', 'CM/L-8291045', 'CM/L-7188564', 'CM/L-7409544'] }
      });
    } catch (purgeErr) {
      console.warn("Purge unwanted data note:", purgeErr.message);
    }
  }

  // Record administrative action
  async recordActivity({ action, adminUser, targetType, targetId, targetTitle, details = {} }) {
    const entry = {
      id: "act-" + Date.now(),
      action,
      admin_id: adminUser?.id || adminUser?._id?.toString() || "usr-admin-01",
      admin_name: adminUser?.full_name || adminUser?.email || "Chief Compliance Officer",
      admin_email: adminUser?.email || "admin@admin.com",
      target_type: targetType,
      target_id: String(targetId),
      target_title: targetTitle,
      details,
      timestamp: new Date()
    };

    if (isDbConnected()) {
      try {
        return await ActivityLog.create(entry);
      } catch (e) {
        console.warn("Activity log save note:", e.message);
      }
    }
    return entry;
  }

  // 1. Dashboard Metrics
  async getDashboardStats() {
    await this.ensureMongoSeeded();
    if (!isDbConnected()) {
      throw new Error("Database service temporarily unavailable.");
    }

    const [totalUsers, activeUsers, pendingVerification, verified, rejected, reports, recentActivities] = await Promise.all([
      User.countDocuments({ is_deleted: { $ne: true } }),
      User.countDocuments({ status: 'active', is_deleted: { $ne: true } }),
      VerificationSubmission.countDocuments({ status: { $in: ['pending', 'under_review'] } }),
      VerificationSubmission.countDocuments({ status: 'verified' }),
      VerificationSubmission.countDocuments({ status: 'rejected' }),
      Report.countDocuments({ status: { $in: ['open', 'under_review'] } }),
      ActivityLog.find().sort({ timestamp: -1 }).limit(8)
    ]);

    return {
      total_users: totalUsers,
      active_users: activeUsers,
      pending_verification: pendingVerification,
      verified: verified,
      rejected: rejected,
      reports: reports,
      recent_activities: recentActivities,
      // Compatibility aliases
      totalUsers,
      activeUsers,
      pendingVerification,
      verifiedSubmissions: verified,
      rejectedSubmissions: rejected,
      openReports: reports,
      recentActivity: recentActivities
    };
  }

  // Ensure an organization verification submission exists for any user/enterprise
  async createOrUpdateOrgVerification(user) {
    if (!isDbConnected() || !user || !user.email) return null;

    const role = (user.role || '').toLowerCase();
    if (user.is_admin === true || role === 'admin' || role === 'administrator') {
      return null;
    }

    const companyName = (user.company_name || '').trim();
    if (!companyName || companyName === 'Independent Enterprise') {
      return null;
    }
    const sector = user.sector || 'Consumer Goods & Utensils';
    const enterpriseCategory = user.enterprise_category || 'MSME - Small Enterprise';
    const gstin = user.gstin || '';
    const phone = user.phone || '+91 98765 43210';
    const udyamNumber = user.udyam_number || (gstin ? `UDYAM-DL-01-${gstin.slice(2, 9)}` : 'UDYAM-REG-PENDING');

    // Select suitable standard according to industry sector
    let standardId = 'IS 17803:2022';
    let standardTitle = 'Stainless Steel Vacuum Flasks / Insulated Water Bottles - Specification';
    let productName = `${companyName} Insulated Ware`;

    const lowerSector = sector.toLowerCase();
    if (lowerSector.includes('footwear')) {
      standardId = 'IS 15844 (Part 1):2023';
      standardTitle = 'Sports Footwear - Specification';
      productName = `${companyName} Athletic & Industrial Footwear`;
    } else if (lowerSector.includes('electrical') || lowerSector.includes('geyser') || lowerSector.includes('appliance')) {
      standardId = 'IS 302 (Part 2/Sec 3):2021';
      standardTitle = 'Safety of Household Electrical Appliances - Specification';
      productName = `${companyName} Electrical Appliances`;
    } else if (lowerSector.includes('paper') || lowerSector.includes('pack')) {
      standardId = 'IS 4658:2019';
      standardTitle = 'Coated Paper and Board - Specification';
      productName = `${companyName} Food Contact Paper Products`;
    } else if (lowerSector.includes('cooker') || lowerSector.includes('utensil') || lowerSector.includes('steel')) {
      standardId = 'IS 17803:2022';
      standardTitle = 'Stainless Steel Vacuum Flasks / Insulated Water Bottles - Specification';
      productName = `${companyName} Stainless Steel Cookware & Bottles`;
    }

    const userEmail = user.email.toLowerCase().trim();
    const userId = user._id ? user._id.toString() : (user.id || '');

    // Check if a submission already exists for this applicant
    let submission = await VerificationSubmission.findOne({
      $or: [
        { applicant_id: userId },
        { applicant_email: userEmail }
      ]
    });

    if (submission) {
      if (submission.status === 'pending' || submission.status === 'under_review') {
        submission.company_name = companyName;
        submission.applicant_name = user.full_name || submission.applicant_name;
        submission.phone = phone;
        if (gstin) submission.gstin = gstin;
        if (udyamNumber) submission.udyam_number = udyamNumber;
        submission.enterprise_category = enterpriseCategory;
        submission.category = sector;
        submission.standard_id = standardId;
        submission.standard_title = standardTitle;
        submission.product_name = productName;
        submission.submission_title = `Organization Verification Application — ${companyName}`;
        await submission.save();
      }
      return submission;
    }

    // Otherwise create brand new pending VerificationSubmission
    const newSubmission = await VerificationSubmission.create({
      applicant_id: userId,
      applicant_name: user.full_name || userEmail.split('@')[0],
      applicant_email: userEmail,
      company_name: companyName,
      phone: phone,
      gstin: gstin || 'Pending Verification',
      udyam_number: udyamNumber,
      enterprise_category: enterpriseCategory,
      category: sector,
      standard_id: standardId,
      standard_title: standardTitle,
      product_name: productName,
      submission_title: `Organization Verification Application — ${companyName}`,
      state: user.state || 'Delhi',
      district: user.district || 'New Delhi',
      factory_address: user.factory_address || 'Industrial Area Unit 1',
      annual_capacity: '50,000 units/year',
      readiness_score: 80,
      documents: [
        {
          name: "Enterprise_Registration_Certificate.pdf",
          type: "Incorporation / MSME Proof",
          lab: "Ministry of Corporate Affairs / MSME",
          date: new Date().toISOString().split('T')[0],
          status: "VERIFIED"
        },
        {
          name: "GSTIN_Registration_Filing.pdf",
          type: "Tax Clearance",
          lab: "GST Network",
          date: new Date().toISOString().split('T')[0],
          status: "VERIFIED"
        }
      ],
      status: 'pending',
      submitted_at: new Date()
    });

    // Record activity audit trail
    await this.recordActivity({
      action: "New Organization Verification Application Submitted",
      adminUser: { id: "system", full_name: "Automated Onboarding Gate", email: "system@bis.gov.in" },
      targetType: "submission",
      targetId: String(newSubmission._id),
      targetTitle: `${companyName} (${userEmail})`,
      details: {
        company_name: companyName,
        applicant: user.full_name,
        sector,
        enterprise_category: enterpriseCategory,
        standard_id: standardId
      }
    });

    return newSubmission;
  }

  // 2. Verification Submissions
  async getVerifications({ search = '', status = 'ALL', category = 'ALL' } = {}) {
    await this.ensureMongoSeeded();
    if (!isDbConnected()) {
      throw new Error("Database service temporarily unavailable.");
    }

    const query = {};
    if (status && status !== 'ALL') {
      query.status = status.toLowerCase();
    }
    if (category && category !== 'ALL') {
      query.category = new RegExp(category, 'i');
    }
    if (search) {
      query.$or = [
        { applicant_name: new RegExp(search, 'i') },
        { company_name: new RegExp(search, 'i') },
        { standard_id: new RegExp(search, 'i') },
        { product_name: new RegExp(search, 'i') }
      ];
    }
    return await VerificationSubmission.find(query).sort({ submitted_at: -1 });
  }

  async getVerificationById(id) {
    await this.ensureMongoSeeded();
    if (!isDbConnected()) {
      throw new Error("Database service temporarily unavailable.");
    }
    return await VerificationSubmission.findOne({ $or: [{ _id: id }, { id }] });
  }

  async approveVerification(id, adminUser) {
    const timestamp = new Date();
    const adminName = adminUser?.full_name || adminUser?.email || "Chief Compliance Officer";

    if (!isDbConnected()) {
      throw new Error("Database service temporarily unavailable.");
    }

    // 1. Fetch current submission
    const submission = await VerificationSubmission.findOne({ $or: [{ _id: id }, { id }] });
    if (!submission) throw new Error("Verification dossier not found.");

    // 2. Fetch System Settings from MongoDB
    const settings = await this.getSettings();

    // 3. Dual-Signoff Check
    const isHighRisk = (settings.high_risk_categories || []).some(cat =>
      (submission.category || '').toLowerCase().includes(cat.toLowerCase())
    );

    if (settings.require_dual_signoff && isHighRisk && !submission.first_approver) {
      // Record first officer signoff; dossier enters 'under_review' awaiting secondary concurrence
      let dualUpdated = null;
      if (isDbConnected()) {
        try {
          dualUpdated = await VerificationSubmission.findOneAndUpdate(
            { $or: [{ _id: id }, { id }] },
            {
              $set: {
                status: 'under_review',
                first_approver: adminName,
                first_approved_at: timestamp,
                officer_remarks: `Preliminary concurrence by ${adminName}. Awaiting secondary regulatory signoff.`
              }
            },
            { new: true }
          );
        } catch (e) {}
      }

      await this.recordActivity({
        action: "First Approval Concurred (Dual-Signoff Required)",
        adminUser,
        targetType: "submission",
        targetId: id,
        targetTitle: `${submission.company_name} (${submission.standard_id})`,
        details: { first_approver: adminName, status: "under_review", dual_signoff: true }
      });

      return dualUpdated || {
        ...submission,
        status: 'under_review',
        first_approver: adminName,
        first_approved_at: timestamp,
        officer_remarks: `Preliminary concurrence by ${adminName}. Awaiting secondary regulatory signoff.`
      };
    }

    // 4. Final Approval & CML License Generation
    const randomApprovalRef = `BIS/CONF/${new Date().getFullYear()}/${String(id).slice(-4).toUpperCase()}`;
    let cmlLicense = null;

    if (settings.auto_cml_issuance) {
      cmlLicense = submission.cml_license || `CM/L-${Math.floor(7000000 + Math.random() * 2000000)}`;

      // Save generated license directly into MongoDB Licence collection
      if (isDbConnected()) {
        try {
          await Licence.findOneAndUpdate(
            { cml_number: cmlLicense },
            {
              cml_number: cmlLicense,
              standard_id: submission.standard_id,
              standard_title: submission.standard_title,
              manufacturer_name: submission.company_name,
              brand_name: submission.product_name,
              factory_address: submission.factory_address || `${submission.district || 'District'}, ${submission.state || 'State'}`,
              validity_start: new Date(),
              validity_end: new Date(Date.now() + 3 * 365 * 86400000),
              grant_date: timestamp,
              status: 'OPERATIVE',
              submission_id: String(submission._id || id),
              is_qco_mandated: true
            },
            { upsert: true }
          );
        } catch (licErr) {
          console.warn("Licence save note:", licErr.message);
        }
      }
    }

    let updated = null;
    if (isDbConnected()) {
      try {
        updated = await VerificationSubmission.findOneAndUpdate(
          { $or: [{ _id: id }, { id }] },
          {
            $set: {
              status: 'verified',
              cml_license: cmlLicense,
              approval_ref: randomApprovalRef,
              verified_by: adminName,
              verified_at: timestamp,
              second_approver: submission.first_approver ? adminName : null,
              second_approved_at: submission.first_approver ? timestamp : null,
              officer_remarks: `Application verified & approved. ${cmlLicense ? `Statutory ISI Licence ${cmlLicense} granted.` : 'Licence pending manual issuance.'}`
            }
          },
          { new: true }
        );
      } catch (e) {}
    }

    if (!updated) {
      throw new Error("Verification dossier not found.");
    }

    // Synchronize verification status on User record
    if (submission.applicant_email) {
      try {
        await User.updateOne(
          { email: submission.applicant_email.toLowerCase() },
          { $set: { is_verified: true, verification_status: 'verified' } }
        );
      } catch (uErr) {
        console.warn("User verification status sync note:", uErr.message);
      }

      // Dispatch in-app notification to the applicant
      try {
        await notificationService.createNotification({
          type: 'verification',
          badge: 'VERIFICATION APPROVED',
          badge_class: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          title: `Conformity Verification Approved: CML Licence ${cmlLicense || ''} Issued`,
          authority: 'Bureau of Indian Standards • Regulatory Directorate',
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          unread: true,
          impact: 'Statutory ISI Marking Licence Granted',
          description: `Congratulations! Your organization verification application for "${submission.company_name}" has been officially approved by regulatory officers. Authentic CML Licence ${cmlLicense} has been granted under ${submission.standard_id}. You are authorized to display the Standard ISI Mark.`,
          action_primary: { label: 'View Certificate & Licence →', target: 'verification', cml_number: cmlLicense },
          action_secondary: { label: 'Ask AI About STI Rules', query: `What are the Scheme of Inspection and Testing (STI) rules for licence ${cmlLicense} under ${submission.standard_id}?` },
          user_id: submission.applicant_email.toLowerCase().trim()
        });
      } catch (notifErr) {
        console.warn("Applicant approval notification note:", notifErr.message);
      }
    }

    // Record activity audit trail
    await this.recordActivity({
      action: cmlLicense ? `Licence Granted (${cmlLicense})` : "Admin verified submission",
      adminUser,
      targetType: "submission",
      targetId: id,
      targetTitle: updated?.company_name ? `${updated.company_name} (${updated.standard_id})` : `Submission #${id}`,
      details: { cml_license: cmlLicense, approval_ref: randomApprovalRef }
    });

    return updated;
  }

  async rejectVerification(id, rejectionReason, adminUser) {
    if (!isDbConnected()) {
      throw new Error("Database service temporarily unavailable.");
    }

    const submission = await VerificationSubmission.findOne({ $or: [{ _id: id }, { id }] });
    if (!submission) {
      throw new Error("Verification dossier not found.");
    }

    if (!rejectionReason || !rejectionReason.trim()) {
      throw new Error("A rejection reason is strictly required to reject a submission.");
    }

    const timestamp = new Date();
    const adminName = adminUser?.full_name || adminUser?.email || "Chief Compliance Officer";

    const updated = await VerificationSubmission.findOneAndUpdate(
      { $or: [{ _id: id }, { id }] },
      {
        $set: {
          status: 'rejected',
          rejection_reason: rejectionReason.trim(),
          rejected_by: adminName,
          rejected_at: timestamp,
          officer_remarks: `Rejected: ${rejectionReason.trim()}`
        }
      },
      { new: true }
    );

    if (!updated) {
      throw new Error("Verification dossier not found.");
    }

    // Synchronize verification status on User record
    if (submission.applicant_email) {
      try {
        await User.updateOne(
          { email: submission.applicant_email.toLowerCase() },
          { $set: { is_verified: false, verification_status: 'rejected' } }
        );
      } catch (uErr) {
        console.warn("User rejection status sync note:", uErr.message);
      }

      // Dispatch in-app deficiency notification with officer feedback to the applicant
      try {
        await notificationService.createNotification({
          type: 'verification',
          badge: 'VERIFICATION REJECTED',
          badge_class: 'bg-rose-50 text-rose-700 border-rose-200',
          title: `Verification Action Required: Application Rejected by Regulatory Officer`,
          authority: 'Bureau of Indian Standards • Regulatory Directorate',
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          unread: true,
          impact: 'Compliance Deficiency Notice Issued',
          description: `Your verification submission for "${submission.company_name}" under ${submission.standard_id} was reviewed by the Regulatory Directorate. Officer Feedback & Rejection Reason: "${rejectionReason.trim()}". Please rectify the statutory deficiencies and resubmit your lab test reports.`,
          action_primary: { label: 'Review Deficiencies & Rectify →', target: 'compliance' },
          action_secondary: { label: 'Ask AI How to Rectify', query: `How do I resolve this BIS deficiency: "${rejectionReason.trim()}" under ${submission.standard_id}?` },
          user_id: submission.applicant_email.toLowerCase().trim()
        });
      } catch (notifErr) {
        console.warn("Applicant rejection notification note:", notifErr.message);
      }
    }

    await this.recordActivity({
      action: "Admin rejected submission",
      adminUser,
      targetType: "submission",
      targetId: id,
      targetTitle: updated?.company_name ? `${updated.company_name} (${updated.standard_id})` : `Submission #${id}`,
      details: { reason: rejectionReason.trim() }
    });

    return updated;
  }

  async deleteVerification(id) {
    if (!isDbConnected()) throw new Error("Database service temporarily unavailable.");
    return await VerificationSubmission.findOneAndDelete({ $or: [{ _id: id }, { id }] });
  }

  // 3. User Management
  async getUsers({ search = '', role = 'ALL', status = 'ALL' } = {}) {
    let usersList = [];

    if (isDbConnected()) {
      try {
        const query = { is_deleted: { $ne: true } };
        if (role && role !== 'ALL') {
          query.role = new RegExp(role, 'i');
        }
        if (status && status !== 'ALL') {
          query.status = status.toLowerCase();
        }
        if (search) {
          query.$or = [
            { full_name: new RegExp(search, 'i') },
            { email: new RegExp(search, 'i') },
            { company_name: new RegExp(search, 'i') }
          ];
        }
        usersList = await User.find(query).select('-password').sort({ created_at: -1 });
      } catch (e) {}
    }

    return usersList || [];
  }

  async updateUserStatus(id, newStatus, adminUser) {
    if (!['active', 'suspended'].includes(newStatus)) {
      throw new Error("Status must be either 'active' or 'suspended'.");
    }

    let targetUser = null;
    if (isDbConnected()) {
      try {
        if (mongoose.isValidObjectId(id)) {
          targetUser = await User.findById(id);
        }
        if (!targetUser) {
          targetUser = await User.findOne({ $or: [{ email: id }, { id: id }] });
        }
      } catch (e) {}
    }

    // Safety guardrail: Prevent suspending the active administrator
    if (
      id === 'usr-admin-01' ||
      targetUser?.is_admin ||
      targetUser?.role === 'admin' ||
      targetUser?.email === 'director.admin@standards.local' ||
      targetUser?.email === adminUser?.email ||
      (adminUser?.id && String(targetUser?._id) === String(adminUser.id))
    ) {
      throw new Error("Security Policy: Cannot suspend an active administrative officer account.");
    }

    let updated = null;
    if (targetUser) {
      targetUser.status = newStatus;
      targetUser.is_active = (newStatus === 'active');
      await targetUser.save();
      updated = targetUser;
    } else if (isDbConnected() && mongoose.isValidObjectId(id)) {
      updated = await User.findByIdAndUpdate(id, {
        status: newStatus,
        is_active: newStatus === 'active'
      }, { new: true }).select('-password');
    }

    const action = newStatus === 'suspended' ? "Admin suspended user" : "Admin activated user";
    await this.recordActivity({
      action,
      adminUser,
      targetType: "user",
      targetId: id,
      targetTitle: updated?.full_name || `User #${id}`,
      details: { status: newStatus }
    });

    return updated || { id, status: newStatus };
  }

  async softDeleteUser(id, adminUser) {
    let targetUser = null;
    if (isDbConnected()) {
      try {
        if (mongoose.isValidObjectId(id)) {
          targetUser = await User.findById(id);
        }
        if (!targetUser) {
          targetUser = await User.findOne({ $or: [{ email: id }, { id: id }] });
        }
      } catch (e) {}
    }

    // Safety guardrail: Prevent deleting the active administrator
    if (
      id === 'usr-admin-01' ||
      targetUser?.is_admin ||
      targetUser?.role === 'admin' ||
      targetUser?.email === 'director.admin@standards.local' ||
      targetUser?.email === adminUser?.email ||
      (adminUser?.id && String(targetUser?._id) === String(adminUser.id))
    ) {
      throw new Error("Security Policy: Cannot delete the currently authenticated administrative officer.");
    }

    let deletedUser = null;
    if (targetUser) {
      targetUser.is_deleted = true;
      targetUser.status = 'deleted';
      targetUser.deleted_at = new Date();
      await targetUser.save();
      deletedUser = targetUser;
    } else if (isDbConnected() && mongoose.isValidObjectId(id)) {
      deletedUser = await User.findByIdAndUpdate(id, {
        is_deleted: true,
        status: 'deleted',
        deleted_at: new Date()
      }, { new: true });
    }

    await this.recordActivity({
      action: "Admin soft-deleted user",
      adminUser,
      targetType: "user",
      targetId: id,
      targetTitle: deletedUser?.full_name || `User #${id}`,
      details: { is_deleted: true }
    });

    return { success: true, message: "User account archived successfully." };
  }

  // 4. Report Management
  async getReports({ search = '', status = 'ALL' } = {}) {
    await this.ensureMongoSeeded();

    if (!isDbConnected()) {
      throw new Error("Database service temporarily unavailable.");
    }

    const query = {};
    if (status && status !== 'ALL') {
      query.status = status.toLowerCase();
    }
    if (search) {
      query.$or = [
        { target_title: new RegExp(search, 'i') },
        { reason: new RegExp(search, 'i') },
        { reporter_name: new RegExp(search, 'i') }
      ];
    }
    return await Report.find(query).sort({ createdAt: -1 });
  }

  async resolveReport(id, { resolution_notes, action_taken } = {}, adminUser) {
    if (!isDbConnected()) {
      throw new Error("Database service temporarily unavailable.");
    }
    const timestamp = new Date();
    const adminName = adminUser?.full_name || adminUser?.email || "Chief Compliance Officer";

    const updated = await Report.findOneAndUpdate(
      { $or: [{ _id: id }, { id }] },
      {
        $set: {
          status: 'resolved',
          resolution_notes: resolution_notes || 'Resolved by Bureau Compliance cell.',
          action_taken: action_taken || 'Appropriate statutory remedial action executed.',
          resolved_by: adminName,
          resolved_at: timestamp
        }
      },
      { new: true }
    );

    if (!updated) {
      throw new Error("Report not found.");
    }

    await this.recordActivity({
      action: "Admin resolved report",
      adminUser,
      targetType: "report",
      targetId: id,
      targetTitle: updated?.target_title || `Report #${id}`,
      details: { resolution_notes, action_taken }
    });

    return updated;
  }

  async dismissReport(id, { notes } = {}, adminUser) {
    if (!isDbConnected()) {
      throw new Error("Database service temporarily unavailable.");
    }
    const timestamp = new Date();
    const adminName = adminUser?.full_name || adminUser?.email || "Chief Compliance Officer";

    const updated = await Report.findOneAndUpdate(
      { $or: [{ _id: id }, { id }] },
      {
        $set: {
          status: 'dismissed',
          resolution_notes: notes || 'Report inspected and dismissed as non-violative.',
          resolved_by: adminName,
          resolved_at: timestamp
        }
      },
      { new: true }
    );

    if (!updated) {
      throw new Error("Report not found.");
    }

    await this.recordActivity({
      action: "Admin dismissed report",
      adminUser,
      targetType: "report",
      targetId: id,
      targetTitle: updated?.target_title || `Report #${id}`,
      details: { notes }
    });

    return updated;
  }

  // 5. Activity Logs
  async getActivityLogs({ limit = 50, target_type = 'ALL' } = {}) {
    await this.ensureMongoSeeded();
    if (!isDbConnected()) {
      throw new Error("Database service temporarily unavailable.");
    }

    const query = {};
    if (target_type && target_type !== 'ALL') {
      query.target_type = target_type.toLowerCase();
    }
    return await ActivityLog.find(query).sort({ timestamp: -1 }).limit(Number(limit));
  }

  // 6. Content Management (Standards & Licences from MongoDB)
  async getContentItems() {
    await this.ensureMongoSeeded();
    let standardsCount = 24;
    let qcoCount = 8;
    let licencesCount = 11;
    let sectorGroups = [];

    if (isDbConnected()) {
      try {
        const [sCount, qCount, lCount, allStds] = await Promise.all([
          Standard.countDocuments({ active: true }),
          Standard.countDocuments({ is_qco_mandatory: true, active: true }),
          Licence.countDocuments({ status: 'OPERATIVE' }),
          Standard.find({ active: true }).sort({ sector: 1, standard_id: 1 })
        ]);

        if (sCount > 0) standardsCount = sCount;
        if (qCount > 0) qcoCount = qCount;
        if (lCount > 0) licencesCount = lCount;

        // Dynamically group standards by sector
        const grouped = {};
        allStds.forEach(std => {
          const sec = std.sector || 'General Standards';
          if (!grouped[sec]) grouped[sec] = [];
          grouped[sec].push({
            id: std.standard_id,
            title: std.title,
            qco: std.is_qco_mandatory,
            year: std.year,
            effective_date: std.effective_date
          });
        });

        sectorGroups = Object.keys(grouped).map(title => ({
          title,
          count: grouped[title].length,
          standards: grouped[title]
        }));
      } catch (e) {
        console.warn("Content items query note:", e.message);
      }
    }

    return {
      indexed_standards: standardsCount,
      qco_advisories_count: qcoCount,
      registered_licences_count: licencesCount,
      sector_groups: sectorGroups.length > 0 ? sectorGroups : [
        {
          title: "Consumer Goods & Kitchen Utensils",
          count: 4,
          standards: [
            { id: "IS 2347:2017", title: "Pressure Cookers", qco: true },
            { id: "IS 17803:2022", title: "Vacuum Flasks", qco: true },
            { id: "IS 17526:2021", title: "Single-Walled Bottles", qco: true }
          ]
        },
        {
          title: "Household Electrical Safety",
          count: 5,
          standards: [
            { id: "IS 302 (Part 2/Sec 21):2024", title: "Geysers", qco: true },
            { id: "IS 302-2-15:2009", title: "Electric Kettles", qco: true },
            { id: "IS 1293:2019", title: "Plugs & Sockets", qco: true }
          ]
        },
        {
          title: "Footwear & Sports Goods",
          count: 3,
          standards: [
            { id: "IS 15844 (Part 1):2023", title: "Sports Footwear", qco: true },
            { id: "IS 15844 (Part 3):2024", title: "Leather Footwear", qco: true }
          ]
        },
        {
          title: "Public Health, Food & Water",
          count: 4,
          standards: [
            { id: "IS 10500:2012", title: "Drinking Water", qco: true },
            { id: "IS 14543:2004", title: "Packaged Water", qco: true },
            { id: "IS 15410:2003", title: "Containers", qco: true }
          ]
        },
        {
          title: "Automotive Safety & Helmets",
          count: 2,
          standards: [
            { id: "IS 4151:2015", title: "Two Wheeler Helmets", qco: true },
            { id: "IS 3196:2013", title: "LPG Cylinders", qco: true }
          ]
        },
        {
          title: "Medical & Healthcare Devices",
          count: 2,
          standards: [
            { id: "IS 18266:2023", title: "Respirators", qco: true },
            { id: "IS 80601-2-30:2018", title: "Sphygmomanometers", qco: true }
          ]
        }
      ]
    };
  }

  // 7. System Settings
  async getSettings() {
    await this.ensureMongoSeeded();
    if (isDbConnected()) {
      try {
        const found = await SystemSettings.findOne();
        if (found) return found;
      } catch (e) {}
    }
    return {
      system_name: "Bureau of Indian Standards — Compliance Control Gateway",
      version: "2.0.0",
      qco_enforcement_mode: "Strict Gazette Mandatory",
      rag_gateway_url: "http://127.0.0.1:8000",
      auto_cml_issuance: true,
      require_dual_signoff: false,
      high_risk_categories: ["Household Electrical", "Chemical", "Medical & Healthcare Devices", "Automotive Safety"],
      log_retention_days: 90,
      last_saved_by: "Dr. Rajesh Verma",
      last_saved_at: new Date()
    };
  }

  async saveSettings(newSettings, adminUser) {
    const adminName = adminUser?.full_name || adminUser?.email || "Chief Compliance Officer";
    const payload = {
      system_name: newSettings.system_name || "Bureau of Indian Standards — Compliance Control Gateway",
      qco_enforcement_mode: newSettings.qco_enforcement_mode || "Strict Gazette Mandatory",
      auto_cml_issuance: Boolean(newSettings.auto_cml_issuance),
      require_dual_signoff: Boolean(newSettings.require_dual_signoff),
      log_retention_days: Number(newSettings.log_retention_days) || 90,
      high_risk_categories: newSettings.high_risk_categories || ["Household Electrical", "Chemical", "Medical & Healthcare Devices", "Automotive Safety"],
      last_saved_by: adminName,
      last_saved_at: new Date()
    };

    let updated = null;
    if (isDbConnected()) {
      try {
        updated = await SystemSettings.findOneAndUpdate({}, { $set: payload }, { upsert: true, new: true });
      } catch (e) {
        console.warn("Save settings MongoDB note:", e.message);
      }
    }

    await this.recordActivity({
      action: "Admin updated system settings",
      adminUser,
      targetType: "settings",
      targetId: "system-settings",
      targetTitle: payload.system_name,
      details: payload
    });

    return updated || payload;
  }
}

export const adminService = new AdminService();
