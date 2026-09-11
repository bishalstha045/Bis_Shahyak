import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Shield, FileCheck, ArrowRight, Download, Sparkles, Upload, Send, ShieldCheck, X, RefreshCw } from 'lucide-react';
import { submitVerificationDossier } from '../services/api';

export default function ComplianceMatrix({
  complianceData,
  onOpenEvidence,
  onUploadDoc,
  onDownloadPDF
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [applicantForm, setApplicantForm] = useState({
    applicant_name: "Aditi Sharma",
    applicant_email: "aditi.sharma@enterprise.in",
    company_name: "Apex Pressure Cookers Pvt. Ltd.",
    category: "Consumer Goods & Utensils"
  });

  if (!complianceData || !complianceData.matrix) return null;

  const {
    standard_id,
    standard_title,
    product_name,
    compliance_readiness_score = 0,
    ai_confidence_score = 90,
    completed_count = 0,
    review_count = 0,
    missing_count = 0,
    total_requirements = 0,
    matrix = [],
    next_best_action
  } = complianceData;

  const handleSubmitDossier = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await submitVerificationDossier({
        ...applicantForm,
        standard_id,
        product_name: product_name || standard_title,
        compliance_score: compliance_readiness_score,
        requirements: matrix
      });
      setSubmitResult({
        success: true,
        message: "Dossier formally submitted to Bureau of Indian Standards!",
        ref_id: res.submission?.application_number || res.submission?._id || "BIS-APP-REG"
      });
    } catch (err) {
      setSubmitResult({
        success: false,
        message: err.message || "Failed to submit verification dossier."
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Complete':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 size={13} /> Complete
          </span>
        );
      case 'Needs Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle size={13} /> Needs Review
          </span>
        );
      case 'Missing':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle size={13} /> Missing
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Dual Scores Header Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Compliance Readiness Score */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              05. Compliance Readiness
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-orange-600 dark:text-orange-400">
                {compliance_readiness_score}%
              </span>
              <span className="text-xs font-bold text-slate-500">
                ({completed_count} of {total_requirements} Verified)
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium pt-1">
              Completeness of applicant's test certificates against mandatory statutory clauses
            </p>
          </div>
          <div className="w-18 h-18 rounded-full bg-orange-50 dark:bg-orange-950/60 border-4 border-orange-500 flex items-center justify-center font-black text-orange-700 dark:text-orange-300 text-base shrink-0">
            {compliance_readiness_score}%
          </div>
        </div>

        {/* AI Grounding Confidence Score */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Evidence Grounding Confidence
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                {ai_confidence_score}%
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Official Gazette
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium pt-1">
              Directly backed by official BIS specifications and Scheme of Testing & Inspection (STI)
            </p>
          </div>
          <div className="w-18 h-18 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border-4 border-emerald-500 flex items-center justify-center font-black text-emerald-700 dark:text-emerald-300 text-base shrink-0">
            {ai_confidence_score}%
          </div>
        </div>
      </div>

      {/* Recommended Next Best Action Banner */}
      {next_best_action && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-100 flex items-center gap-1.5">
              <Sparkles size={14} />
              06. Recommended Next Best Action
            </span>
            <p className="text-sm sm:text-base font-extrabold leading-snug">
              {next_best_action}
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {onUploadDoc && (
              <button
                type="button"
                onClick={onUploadDoc}
                className="px-4 py-2.5 rounded-2xl bg-white text-orange-700 hover:bg-orange-50 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Upload size={14} />
                <span>Upload Test Report</span>
              </button>
            )}
            {onDownloadPDF && (
              <button
                type="button"
                onClick={onDownloadPDF}
                className="px-4 py-2.5 rounded-2xl bg-orange-700 hover:bg-orange-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>Export PDF</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setSubmitResult(null);
                setModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Send size={14} />
              <span>Submit for BIS Verification</span>
            </button>
          </div>
        </div>
      )}

      {/* Structured Requirement Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-800/40">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              04. Statutory Compliance Requirement Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {standard_id} - {standard_title}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="text-emerald-600">{completed_count} Complete</span>
            <span className="text-amber-600">{review_count} Review</span>
            <span className="text-rose-600">{missing_count} Missing</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase text-[10px] font-black tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-5 py-3.5">Clause / Ref</th>
                <th className="px-5 py-3.5">Requirement & Parameter</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Compliance Status</th>
                <th className="px-5 py-3.5">Evidence Attached</th>
                <th className="px-5 py-3.5 text-right">Statutory Text</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {matrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-orange-50/30 dark:hover:bg-orange-950/20 transition-colors">
                  <td className="px-5 py-4 font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap">
                    {row.source_clause || `Clause ${row.clause_id}`}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900 dark:text-white">{row.requirement_name}</p>
                    {row.requirement_text && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 font-normal">
                        {row.requirement_text}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300 font-semibold whitespace-nowrap">
                    {row.category}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {getStatusBadge(row.status)}
                  </td>
                  <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                    {row.evidence}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onOpenEvidence && onOpenEvidence({
                        clause_id: row.clause_id,
                        section: row.source_clause,
                        title: row.requirement_name,
                        requirement_text: row.requirement_text,
                        test_method: row.test_method,
                        page: row.page,
                        standard_id: standard_id
                      })}
                      className="text-orange-600 dark:text-orange-400 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Verification Submission Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#0d1424] border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-5 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-emerald-400" size={20} />
                <h3 className="font-bold text-sm">Submit Dossier to Bureau of Indian Standards</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {submitResult?.success ? (
              <div className="space-y-4 py-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">Verification Dossier Submitted!</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Application Reference: <b className="font-mono text-emerald-400">{submitResult.ref_id}</b>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 max-w-xs mx-auto">
                    Your conformity packet has been routed to the BIS Verification Queue. The administrative dashboard metrics have been updated in real-time.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                >
                  Close & Continue
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitDossier} className="space-y-4 text-xs">
                {submitResult?.success === false && (
                  <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    <span>{submitResult.message}</span>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-[#090e1c] border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Standard Mandate</span>
                  <p className="font-bold text-slate-200">{standard_id} — {standard_title}</p>
                  <p className="text-[11px] text-emerald-400">Readiness Score: {compliance_readiness_score}% ({completed_count} verified clauses)</p>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Applicant / Authorised Officer Name</label>
                  <input
                    type="text"
                    required
                    value={applicantForm.applicant_name}
                    onChange={e => setApplicantForm({ ...applicantForm, applicant_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#090e1c] border border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Manufacturing Enterprise / Company</label>
                  <input
                    type="text"
                    required
                    value={applicantForm.company_name}
                    onChange={e => setApplicantForm({ ...applicantForm, company_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#090e1c] border border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Official Email</label>
                    <input
                      type="email"
                      required
                      value={applicantForm.applicant_email}
                      onChange={e => setApplicantForm({ ...applicantForm, applicant_email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#090e1c] border border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Industry Sector</label>
                    <input
                      type="text"
                      value={applicantForm.category}
                      onChange={e => setApplicantForm({ ...applicantForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#090e1c] border border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold flex items-center gap-2 cursor-pointer"
                  >
                    {submitting ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                    <span>{submitting ? "Submitting..." : "Confirm & Submit"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
