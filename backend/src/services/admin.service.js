import { User } from '../models/User.js';
import { VerificationSubmission } from '../models/VerificationSubmission.js';
import { Report } from '../models/Report.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { isDbConnected } from '../config/db.js';

// Initial realistic seed submissions
const SEED_SUBMISSIONS = [
  {
    id: "sub-101",
    applicant_id: "usr-demo-01",
    applicant_name: "Anil Sharma",
    applicant_email: "anil.sharma@bharatcookware.in",
    company_name: "Bharat Cookware & Appliances Pvt. Ltd.",
    phone: "+91 98765 43210",
    gstin: "07AAACB2194D1Z5",
    udyam_number: "UDYAM-DL-01-0029182",
    enterprise_category: "MSME - Small Enterprise",
    category: "Consumer Goods & Utensils",
    standard_id: "IS 2347:2017",
    standard_title: "Domestic Pressure Cookers - Specification",
    product_name: "Hard Anodised 5L Pressure Cooker",
    submission_title: "Conformity Grant Application for 5L Cooker Range",
    state: "Haryana",
    district: "Gurugram",
    factory_address: "Plot 42, Sector 8, Industrial Estate, IMT Manesar, Gurugram - 122051",
    annual_capacity: "120,000 units/year",
    readiness_score: 85,
    documents: [
      { name: "NTH_Hydrostatic_Burst_Test.pdf", type: "NABL Lab Report", lab: "National Test House (NTH)", date: "2026-08-30", status: "PASS" },
      { name: "Safety_Valve_Fusible_Alloy_Cert.pdf", type: "Material Certificate", lab: "Shriram Institute", date: "2026-08-25", status: "PASS" },
      { name: "Factory_Quality_Manual_FormV.pdf", type: "Inspection Dossier", lab: "Internal QC", date: "2026-08-20", status: "VERIFIED" }
    ],
    status: "pending",
    cml_license: null,
    approval_ref: null,
    officer_remarks: "Awaiting final bursting pressure NABL report cross-verification.",
    submitted_at: new Date("2026-09-02T10:30:00Z")
  },
  {
    id: "sub-102",
    applicant_id: "usr-demo-02",
    applicant_name: "Vikram Chauhan",
    applicant_email: "v.chauhan@himalayanthermal.com",
    company_name: "Himalayan Thermal Systems LLP",
    phone: "+91 98112 34567",
    gstin: "02AABCH3391K1Z2",
    udyam_number: "UDYAM-HP-02-0018273",
    enterprise_category: "MSME - Micro Enterprise",
    category: "Household Electrical",
    standard_id: "IS 302 (Part 2/Sec 21):2024",
    standard_title: "Safety of Household Electrical Appliances - Electric Water Heaters",
    product_name: "25L Storage Electric Geyser (5 Star)",
    submission_title: "QCO Compliance Dossier for 25L Vertical Geyser",
    state: "Himachal Pradesh",
    district: "Solan",
    factory_address: "Industrial Area Phase 2, Baddi, Solan - 173205",
    annual_capacity: "45,000 units/year",
    readiness_score: 65,
    documents: [
      { name: "High_Voltage_Dielectric_Test.pdf", type: "NABL Lab Report", lab: "ERDA Vadodara", date: "2026-08-15", status: "REVIEW_NEEDED" },
      { name: "Earthing_Continuity_Check.pdf", type: "Inspection Dossier", lab: "Internal QC", date: "2026-08-18", status: "PASS" }
    ],
    status: "under_review",
    cml_license: null,
    approval_ref: null,
    officer_remarks: "High-voltage dielectric test certificate pending re-verification.",
    submitted_at: new Date("2026-09-04T14:15:00Z")
  },
  {
    id: "sub-103",
    applicant_id: "usr-demo-03",
    applicant_name: "Sunil Kulkarni",
    applicant_email: "sunil@apexfootwear.in",
    company_name: "Apex Athletic Footwear India Ltd.",
    phone: "+91 99887 76655",
    gstin: "27AAACA5512B1Z8",
    udyam_number: "UDYAM-MH-19-0091823",
    enterprise_category: "MSME - Medium Enterprise",
    category: "Footwear & Sports Goods",
    standard_id: "IS 15844 (Part 1):2023",
    standard_title: "Sports Footwear (General Purpose) - Specification",
    product_name: "Performance Running & Training Shoes",
    submission_title: "Mandatory QCO Footwear Certification Submission",
    state: "Maharashtra",
    district: "Pune",
    factory_address: "Gat No. 312, Chakan Industrial Corridor, Pune - 410501",
    annual_capacity: "500,000 pairs/year",
    readiness_score: 95,
    documents: [
      { name: "Outsole_Abrasion_Flex_Crack_Test.pdf", type: "NABL Lab Report", lab: "FDDI Noida", date: "2026-08-20", status: "PASS" },
      { name: "Upper_Tear_Strength_Certificate.pdf", type: "Material Certificate", lab: "CLRI Chennai", date: "2026-08-22", status: "PASS" }
    ],
    status: "verified",
    cml_license: "CM/L-8419203",
    approval_ref: "BIS/QCO/2026/MH-0819",
    officer_remarks: "Meets all outsole abrasion and flex cracking criteria. Granted 3-year ISI marking licence.",
    verified_by: "Dr. Rajesh Verma",
    verified_at: new Date("2026-08-28T11:00:00Z"),
    submitted_at: new Date("2026-08-15T09:00:00Z")
  },
  {
    id: "sub-104",
    applicant_id: "usr-demo-04",
    applicant_name: "Rajesh Agarwal",
    applicant_email: "rajesh@quickpack.in",
    company_name: "QuickPack Art & Chromo Boards",
    phone: "+91 98200 98200",
    gstin: "24AABCP8812A1ZX",
    udyam_number: "None (Unregistered)",
    enterprise_category: "Large Commercial Enterprise",
    category: "Paper & Packaging",
    standard_id: "IS 4658:2019",
    standard_title: "Coated Paper and Board - Specification",
    product_name: "Food Contact Grade Art Paper",
    submission_title: "Application for Food Packaging Compliance",
    state: "Gujarat",
    district: "Vapi",
    factory_address: "GIDC Industrial Estate, Vapi - 396195",
    annual_capacity: "15,000 MT/year",
    readiness_score: 40,
    documents: [
      { name: "Heavy_Metal_Lead_Analysis.pdf", type: "Lab Report", lab: "Private Local Lab", date: "2026-07-20", status: "FAIL" }
    ],
    status: "rejected",
    cml_license: null,
    approval_ref: null,
    officer_remarks: "Rejected under BIS Act 2016 Sec 14: Failed to provide NABL moisture & food contact heavy metal testing.",
    rejection_reason: "Heavy metal extraction test showed Lead (Pb) exceeding permissible threshold under IS 4658 Clause 4.2. Incomplete NABL accreditation.",
    rejected_by: "Dr. Rajesh Verma",
    rejected_at: new Date("2026-08-12T16:00:00Z"),
    submitted_at: new Date("2026-08-10T12:00:00Z")
  }
];

// Initial realistic seed reports (grievances / compliance violations)
const SEED_REPORTS = [
  {
    id: "rep-201",
    reporter_id: "usr-citizen-09",
    reporter_name: "Consumer Safety Forum (Delhi)",
    reporter_email: "vigilance@consumersafety.org.in",
    target_type: "content",
    target_id: "prod-fake-geyser-01",
    target_title: "Counterfeit ISI Mark on Immersion Water Heaters",
    reason: "Counterfeit ISI mark without valid CM/L license number displayed on retail packaging.",
    description: "Retail units found in Bhagirath Palace wholesale electrical market displaying ISI mark but missing the mandatory 7-digit CML registration number.",
    severity: "critical",
    status: "open",
    evidence_urls: ["https://example.com/evidence/fake_isi_photo.jpg"],
    created_at: new Date("2026-09-08T09:30:00Z")
  },
  {
    id: "rep-202",
    reporter_id: "usr-demo-01",
    reporter_name: "Anil Sharma",
    reporter_email: "anil.sharma@bharatcookware.in",
    target_type: "standard",
    target_id: "IS 2347:2017",
    target_title: "Discrepancy in Clause 6.2 Gasket Tensile Strength",
    reason: "Ambiguity in third amendment regarding synthetic silicone vs nitrile rubber test duration.",
    description: "Requesting official clarification from CED Committee on whether 72-hour accelerated aging test applies to imported silicone gaskets.",
    severity: "medium",
    status: "under_review",
    evidence_urls: [],
    created_at: new Date("2026-09-06T15:45:00Z")
  },
  {
    id: "rep-203",
    reporter_id: "usr-inspector-04",
    reporter_name: "North Zone Quality Audit Cell",
    reporter_email: "audit.north@bis.gov.in",
    target_type: "user",
    target_id: "usr-unverified-89",
    target_title: "Substandard Steel Wire Import Declaration",
    reason: "Non-compliant raw material declaration for IS 280 galvanized wire.",
    description: "Physical consignment inspection revealed zinc coating mass below 60 g/m2 mandatory threshold.",
    severity: "high",
    status: "resolved",
    resolution_notes: "Notice issued to importer. Consignment held at ICD Tughlakabad until re-testing passes.",
    action_taken: "Issued Statutory Notice under BIS Act Section 17",
    resolved_by: "Dr. Rajesh Verma",
    resolved_at: new Date("2026-09-01T14:00:00Z"),
    created_at: new Date("2026-08-29T11:00:00Z")
  }
];

// Initial realistic activity logs
const SEED_ACTIVITIES = [
  {
    id: "act-301",
    action: "Admin verified submission",
    admin_id: "usr-admin-01",
    admin_name: "Dr. Rajesh Verma",
    admin_email: "admin@bis.gov.in",
    target_type: "submission",
    target_id: "sub-103",
    target_title: "Apex Athletic Footwear India Ltd. (IS 15844-1)",
    details: { cml_license: "CM/L-8419203", approval_ref: "BIS/QCO/2026/MH-0819" },
    timestamp: new Date("2026-08-28T11:00:00Z")
  },
  {
    id: "act-302",
    action: "Admin rejected submission",
    admin_id: "usr-admin-01",
    admin_name: "Dr. Rajesh Verma",
    admin_email: "admin@bis.gov.in",
    target_type: "submission",
    target_id: "sub-104",
    target_title: "QuickPack Art & Chromo Boards (IS 4658)",
    details: { reason: "Failed heavy metal extraction test under Clause 4.2" },
    timestamp: new Date("2026-08-12T16:00:00Z")
  },
  {
    id: "act-303",
    action: "Admin resolved report",
    admin_id: "usr-admin-01",
    admin_name: "Dr. Rajesh Verma",
    admin_email: "admin@bis.gov.in",
    target_type: "report",
    target_id: "rep-203",
    target_title: "Substandard Steel Wire Import Declaration",
    details: { action: "Issued Statutory Notice under BIS Act Section 17" },
    timestamp: new Date("2026-09-01T14:00:00Z")
  }
];

// Synchronized in-memory storage fallback
const memorySubmissions = new Map(SEED_SUBMISSIONS.map(s => [s.id, { ...s }]));
const memoryReports = new Map(SEED_REPORTS.map(r => [r.id, { ...r }]));
const memoryActivities = [...SEED_ACTIVITIES];

export class AdminService {
  constructor() {
    this.seededMongo = false;
  }

  // Ensure initial seed data is inserted into MongoDB if empty
  async ensureMongoSeeded() {
    if (this.seededMongo || !isDbConnected()) return;
    try {
      const subCount = await VerificationSubmission.countDocuments();
      if (subCount === 0) {
        await VerificationSubmission.insertMany(SEED_SUBMISSIONS);
      }
      const repCount = await Report.countDocuments();
      if (repCount === 0) {
        await Report.insertMany(SEED_REPORTS);
      }
      const actCount = await ActivityLog.countDocuments();
      if (actCount === 0) {
        await ActivityLog.insertMany(SEED_ACTIVITIES);
      }
      this.seededMongo = true;
    } catch (e) {
      console.warn("MongoDB seed note:", e.message);
    }
  }

  // Record administrative action
  async recordActivity({ action, adminUser, targetType, targetId, targetTitle, details = {} }) {
    const entry = {
      id: "act-" + Date.now(),
      action,
      admin_id: adminUser?.id || "usr-admin-01",
      admin_name: adminUser?.full_name || adminUser?.email || "Chief Compliance Officer",
      admin_email: adminUser?.email || "admin@bis.gov.in",
      target_type: targetType,
      target_id: targetId,
      target_title: targetTitle,
      details,
      timestamp: new Date()
    };

    memoryActivities.unshift(entry);

    if (isDbConnected()) {
      try {
        await ActivityLog.create(entry);
      } catch (e) {
        console.warn("Activity log save note:", e.message);
      }
    }
    return entry;
  }

  // 1. Dashboard Metrics
  async getDashboardStats() {
    await this.ensureMongoSeeded();

    let totalUsers = 0;
    let activeUsers = 0;
    let pendingVerification = 0;
    let verified = 0;
    let rejected = 0;
    let reports = 0;
    let recentActivities = [];

    if (isDbConnected()) {
      try {
        const [uTotal, uActive, sPending, sVerified, sRejected, rCount, recActs] = await Promise.all([
          User.countDocuments({ is_deleted: { $ne: true } }),
          User.countDocuments({ status: 'active', is_deleted: { $ne: true } }),
          VerificationSubmission.countDocuments({ status: 'pending' }),
          VerificationSubmission.countDocuments({ status: 'verified' }),
          VerificationSubmission.countDocuments({ status: 'rejected' }),
          Report.countDocuments({ status: { $in: ['open', 'under_review'] } }),
          ActivityLog.find().sort({ timestamp: -1 }).limit(6)
        ]);

        totalUsers = Math.max(uTotal, 24); // Account for demo seeded records
        activeUsers = Math.max(uActive, 21);
        pendingVerification = sPending;
        verified = sVerified;
        rejected = sRejected;
        reports = rCount;
        recentActivities = recActs;
      } catch (err) {
        console.warn("Mongo stats error, falling back:", err.message);
      }
    }

    if (!recentActivities || recentActivities.length === 0) {
      // Memory fallback aggregation
      const subs = Array.from(memorySubmissions.values());
      pendingVerification = subs.filter(s => s.status === 'pending').length;
      verified = subs.filter(s => s.status === 'verified').length;
      rejected = subs.filter(s => s.status === 'rejected').length;
      reports = Array.from(memoryReports.values()).filter(r => r.status === 'open' || r.status === 'under_review').length;
      totalUsers = totalUsers || 24;
      activeUsers = activeUsers || 21;
      recentActivities = memoryActivities.slice(0, 6);
    }

    return {
      total_users: totalUsers,
      active_users: activeUsers,
      pending_verification: pendingVerification,
      verified: verified,
      rejected: rejected,
      reports: reports,
      recent_activities: recentActivities
    };
  }

  // 2. Verification Submissions
  async getVerifications({ search = '', status = 'ALL', category = 'ALL' } = {}) {
    await this.ensureMongoSeeded();

    let list = [];
    if (isDbConnected()) {
      try {
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
        list = await VerificationSubmission.find(query).sort({ submitted_at: -1 });
      } catch (e) {
        list = [];
      }
    }

    if (!list || list.length === 0) {
      list = Array.from(memorySubmissions.values());
      if (status && status !== 'ALL') {
        list = list.filter(s => s.status.toLowerCase() === status.toLowerCase());
      }
      if (category && category !== 'ALL') {
        list = list.filter(s => (s.category || '').toLowerCase().includes(category.toLowerCase()));
      }
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(s =>
          (s.applicant_name || '').toLowerCase().includes(q) ||
          (s.company_name || '').toLowerCase().includes(q) ||
          (s.standard_id || '').toLowerCase().includes(q) ||
          (s.product_name || '').toLowerCase().includes(q)
        );
      }
    }

    return list;
  }

  async getVerificationById(id) {
    await this.ensureMongoSeeded();
    if (isDbConnected()) {
      try {
        const found = await VerificationSubmission.findOne({ $or: [{ _id: id }, { id }] });
        if (found) return found;
      } catch (e) {}
    }
    return memorySubmissions.get(id) || Array.from(memorySubmissions.values()).find(s => s.id === id || s._id === id);
  }

  async approveVerification(id, adminUser) {
    const randomLicence = `CM/L-${Math.floor(7000000 + Math.random() * 2000000)}`;
    const randomApprovalRef = `BIS/CONF/${new Date().getFullYear()}/${String(id).slice(-4).toUpperCase()}`;
    const timestamp = new Date();
    const adminName = adminUser?.full_name || adminUser?.email || "Chief Compliance Officer";

    let updated = null;

    if (isDbConnected()) {
      try {
        updated = await VerificationSubmission.findOneAndUpdate(
          { $or: [{ _id: id }, { id }] },
          {
            $set: {
              status: 'verified',
              cml_license: randomLicence,
              approval_ref: randomApprovalRef,
              verified_by: adminName,
              verified_at: timestamp,
              officer_remarks: 'Application verified & approved. Statutory ISI marking licence granted.'
            }
          },
          { new: true }
        );
      } catch (e) {}
    }

    // Update memory cache
    const mem = memorySubmissions.get(id) || Array.from(memorySubmissions.values()).find(s => s.id === id || s._id === id);
    if (mem) {
      mem.status = 'verified';
      mem.cml_license = randomLicence;
      mem.approval_ref = randomApprovalRef;
      mem.verified_by = adminName;
      mem.verified_at = timestamp;
      mem.officer_remarks = 'Application verified & approved. Statutory ISI marking licence granted.';
      if (!updated) updated = mem;
    }

    // Record activity audit trail
    await this.recordActivity({
      action: "Admin verified submission",
      adminUser,
      targetType: "submission",
      targetId: id,
      targetTitle: updated?.company_name ? `${updated.company_name} (${updated.standard_id})` : `Submission #${id}`,
      details: { cml_license: randomLicence, approval_ref: randomApprovalRef }
    });

    return updated;
  }

  async rejectVerification(id, rejectionReason, adminUser) {
    if (!rejectionReason || !rejectionReason.trim()) {
      throw new Error("A rejection reason is strictly required to reject a submission.");
    }

    const timestamp = new Date();
    const adminName = adminUser?.full_name || adminUser?.email || "Chief Compliance Officer";

    let updated = null;

    if (isDbConnected()) {
      try {
        updated = await VerificationSubmission.findOneAndUpdate(
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
      } catch (e) {}
    }

    const mem = memorySubmissions.get(id) || Array.from(memorySubmissions.values()).find(s => s.id === id || s._id === id);
    if (mem) {
      mem.status = 'rejected';
      mem.rejection_reason = rejectionReason.trim();
      mem.rejected_by = adminName;
      mem.rejected_at = timestamp;
      mem.officer_remarks = `Rejected: ${rejectionReason.trim()}`;
      if (!updated) updated = mem;
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

    if (!usersList || usersList.length === 0) {
      // Return curated registered users
      const fallbackUsers = [
        {
          id: "usr-demo-01",
          email: "demo@msme.gov.in",
          full_name: "Anil Sharma",
          company_name: "Alpha Stainless Works Ltd.",
          role: "user",
          status: "active",
          sector: "Consumer Goods & Utensils (IS 17803)",
          enterprise_category: "MSME - Small Enterprise",
          gstin: "07AAAAA0000A1Z5",
          created_at: new Date("2026-08-01T09:00:00Z")
        },
        {
          id: "usr-demo-02",
          email: "v.chauhan@himalayanthermal.com",
          full_name: "Vikram Chauhan",
          company_name: "Himalayan Thermal Systems LLP",
          role: "user",
          status: "active",
          sector: "Household Electrical (IS 302-2-21)",
          enterprise_category: "MSME - Micro Enterprise",
          gstin: "02AABCH3391K1Z2",
          created_at: new Date("2026-08-10T11:00:00Z")
        },
        {
          id: "usr-demo-03",
          email: "sunil@apexfootwear.in",
          full_name: "Sunil Kulkarni",
          company_name: "Apex Athletic Footwear India Ltd.",
          role: "user",
          status: "active",
          sector: "Footwear & Sports Goods",
          enterprise_category: "MSME - Medium Enterprise",
          gstin: "27AAACA5512B1Z8",
          created_at: new Date("2026-08-15T14:30:00Z")
        },
        {
          id: "usr-admin-01",
          email: "admin@bis.gov.in",
          full_name: "Dr. Rajesh Verma",
          company_name: "Bureau of Indian Standards",
          role: "admin",
          status: "active",
          sector: "Central Regulatory Directorate",
          enterprise_category: "Statutory Standards Authority",
          gstin: "07AAACB2194D1Z5",
          created_at: new Date("2026-07-01T08:00:00Z")
        }
      ];

      usersList = fallbackUsers;
      if (role && role !== 'ALL') {
        usersList = usersList.filter(u => u.role.toLowerCase() === role.toLowerCase());
      }
      if (status && status !== 'ALL') {
        usersList = usersList.filter(u => u.status.toLowerCase() === status.toLowerCase());
      }
      if (search) {
        const q = search.toLowerCase();
        usersList = usersList.filter(u =>
          (u.full_name || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (u.company_name || '').toLowerCase().includes(q)
        );
      }
    }

    return usersList;
  }

  async updateUserStatus(id, newStatus, adminUser) {
    if (!['active', 'suspended'].includes(newStatus)) {
      throw new Error("Status must be either 'active' or 'suspended'.");
    }

    let updated = null;
    if (isDbConnected()) {
      try {
        updated = await User.findByIdAndUpdate(id, {
          status: newStatus,
          is_active: newStatus === 'active'
        }, { new: true }).select('-password');
      } catch (e) {}
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
    let deletedUser = null;
    if (isDbConnected()) {
      try {
        deletedUser = await User.findByIdAndUpdate(id, {
          is_deleted: true,
          status: 'deleted',
          deleted_at: new Date()
        }, { new: true });
      } catch (e) {}
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

    let list = [];
    if (isDbConnected()) {
      try {
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
        list = await Report.find(query).sort({ createdAt: -1 });
      } catch (e) {}
    }

    if (!list || list.length === 0) {
      list = Array.from(memoryReports.values());
      if (status && status !== 'ALL') {
        list = list.filter(r => r.status.toLowerCase() === status.toLowerCase());
      }
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(r =>
          (r.target_title || '').toLowerCase().includes(q) ||
          (r.reason || '').toLowerCase().includes(q) ||
          (r.reporter_name || '').toLowerCase().includes(q)
        );
      }
    }

    return list;
  }

  async resolveReport(id, { resolution_notes, action_taken } = {}, adminUser) {
    const timestamp = new Date();
    const adminName = adminUser?.full_name || adminUser?.email || "Chief Compliance Officer";

    let updated = null;
    if (isDbConnected()) {
      try {
        updated = await Report.findOneAndUpdate(
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
      } catch (e) {}
    }

    const mem = memoryReports.get(id) || Array.from(memoryReports.values()).find(r => r.id === id || r._id === id);
    if (mem) {
      mem.status = 'resolved';
      mem.resolution_notes = resolution_notes || 'Resolved by Bureau Compliance cell.';
      mem.action_taken = action_taken || 'Appropriate statutory remedial action executed.';
      mem.resolved_by = adminName;
      mem.resolved_at = timestamp;
      if (!updated) updated = mem;
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
    const timestamp = new Date();
    const adminName = adminUser?.full_name || adminUser?.email || "Chief Compliance Officer";

    let updated = null;
    if (isDbConnected()) {
      try {
        updated = await Report.findOneAndUpdate(
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
      } catch (e) {}
    }

    const mem = memoryReports.get(id) || Array.from(memoryReports.values()).find(r => r.id === id || r._id === id);
    if (mem) {
      mem.status = 'dismissed';
      mem.resolution_notes = notes || 'Report inspected and dismissed as non-violative.';
      mem.resolved_by = adminName;
      mem.resolved_at = timestamp;
      if (!updated) updated = mem;
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

    let logs = [];
    if (isDbConnected()) {
      try {
        const query = {};
        if (target_type && target_type !== 'ALL') {
          query.target_type = target_type.toLowerCase();
        }
        logs = await ActivityLog.find(query).sort({ timestamp: -1 }).limit(Number(limit));
      } catch (e) {}
    }

    if (!logs || logs.length === 0) {
      logs = [...memoryActivities];
      if (target_type && target_type !== 'ALL') {
        logs = logs.filter(a => a.target_type === target_type.toLowerCase());
      }
      logs = logs.slice(0, Number(limit));
    }

    return logs;
  }

  // 6. Content Management (Standards & Notifications metadata)
  async getContentItems() {
    return {
      indexed_standards: 24,
      qco_advisories_count: 8,
      categories: [
        "Consumer Goods & Utensils",
        "Household Electrical",
        "Footwear & Sports Goods",
        "Public Health & Water",
        "Automotive Safety",
        "Medical & Healthcare Devices",
        "Electronics & Energy",
        "Building Materials"
      ]
    };
  }

  // 7. System Settings
  async getSettings() {
    return {
      system_name: "Bureau of Indian Standards — Compliance Control Gateway",
      version: "2.0.0",
      qco_enforcement_mode: "Strict Gazette Mandatory",
      rag_gateway_url: "http://127.0.0.1:8000",
      auto_cml_issuance: true,
      require_dual_signoff: false,
      log_retention_days: 90
    };
  }
}

export const adminService = new AdminService();
