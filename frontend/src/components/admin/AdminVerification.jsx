import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  AlertTriangle,
  FileText,
  Building2,
  Calendar,
  Award,
  ExternalLink,
  X,
  Lock,
  ChevronRight,
  Stamp,
  User
} from 'lucide-react';
import {
  getAdminVerifications,
  approveAdminVerification,
  rejectAdminVerification
} from '../../services/api';

export default function AdminVerification() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Inspection Modal State
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reject Dialog Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [submissionToReject, setSubmissionToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState(null);

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchVerifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminVerifications({
        search: searchQuery,
        status: statusFilter,
        category: categoryFilter
      });
      setSubmissions(data);
    } catch (err) {
      setError(err.message || "Failed to load verification dossiers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    fetchVerifications();
  };

  // Handle Approve Submission
  const handleApprove = async (sub) => {
    const id = sub._id || sub.id;
    setIsProcessing(true);
    try {
      const updated = await approveAdminVerification(id);
      showToast(`Granted ISI Marking Licence for ${sub.company_name}! Ref: ${updated.cml_license || 'Verified'}`);
      
      // Update local state
      setSubmissions(prev => prev.map(item => (item._id === id || item.id === id) ? updated : item));
      if (selectedSubmission && (selectedSubmission._id === id || selectedSubmission.id === id)) {
        setSelectedSubmission(updated);
      }
    } catch (err) {
      showToast(err.message || "Failed to approve submission.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Open Reject Modal
  const handleOpenRejectModal = (sub) => {
    setSubmissionToReject(sub);
    setRejectionReason('');
    setRejectionError(null);
    setRejectModalOpen(true);
  };

  // Execute Rejection with Mandatory Reason
  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      setRejectionError("Please specify a concrete statutory reason for rejecting this dossier.");
      return;
    }

    const id = submissionToReject._id || submissionToReject.id;
    setIsProcessing(true);
    setRejectionError(null);

    try {
      const updated = await rejectAdminVerification(id, rejectionReason.trim());
      showToast(`Dossier for ${submissionToReject.company_name} rejected.`, "error");
      
      setSubmissions(prev => prev.map(item => (item._id === id || item.id === id) ? updated : item));
      if (selectedSubmission && (selectedSubmission._id === id || selectedSubmission.id === id)) {
        setSelectedSubmission(updated);
      }
      setRejectModalOpen(false);
      setSubmissionToReject(null);
    } catch (err) {
      setRejectionError(err.message || "Failed to reject submission.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'verified') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold inline-flex items-center gap-1">
          <CheckCircle2 size={12} /> Verified
        </span>
      );
    }
    if (s === 'rejected') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[11px] font-bold inline-flex items-center gap-1">
          <XCircle size={12} /> Rejected
        </span>
      );
    }
    if (s === 'under_review') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[11px] font-bold inline-flex items-center gap-1">
          <Clock size={12} /> Under Review
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-bold inline-flex items-center gap-1">
        <Clock size={12} /> Pending Review
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 animate-fade-in ${
          toast.type === 'error'
            ? 'bg-rose-950/90 text-rose-200 border-rose-500/50'
            : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
        }`}>
          {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Conformity & Verification Queue
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-wider border border-blue-500/30">
              P0 Core Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Audit manufacturer test reports, inspect clause-level statutory compliance, and issue authentic ISI licenses.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchVerifications}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[#0d1424] hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Dossiers</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0d1424] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, applicant name, product, or standard (e.g. IS 2347)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#090e1c] border border-slate-700/80 text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-[#090e1c] border border-slate-700 text-slate-200 text-xs focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-bold">Sector:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-[#090e1c] border border-slate-700 text-slate-200 text-xs focus:outline-hidden max-w-[140px] truncate"
            >
              <option value="ALL">All Sectors</option>
              <option value="Consumer Goods">Consumer Goods</option>
              <option value="Household Electrical">Electrical</option>
              <option value="Footwear">Footwear</option>
              <option value="Paper">Packaging</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-[#0d1424] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw size={26} className="text-blue-500 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-400">Loading statutory dossiers...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center space-y-3">
            <AlertTriangle size={28} className="text-rose-400 mx-auto" />
            <p className="text-xs font-bold text-rose-300">{error}</p>
            <button
              type="button"
              onClick={fetchVerifications}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700"
            >
              Retry
            </button>
          </div>
        ) : submissions.length === 0 ? (
          <div className="py-20 text-center space-y-3 max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
              <ShieldCheck size={26} />
            </div>
            <h3 className="text-sm font-bold text-white">No Verification Submissions</h3>
            <p className="text-xs text-slate-400">
              Everything in this queue is currently up-to-date or no submissions match your active search filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#090e1c]/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Applicant & Enterprise</th>
                  <th className="py-3.5 px-4">Target Standard</th>
                  <th className="py-3.5 px-4">Sector</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-200">
                {submissions.map((sub) => {
                  const id = sub._id || sub.id;
                  const isVerified = sub.status === 'verified';
                  const isRejected = sub.status === 'rejected';

                  return (
                    <tr key={id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-white text-xs leading-snug">{sub.company_name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{sub.applicant_name} • {sub.gstin || 'GSTIN Pending'}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-mono font-bold text-blue-400 text-xs">{sub.standard_id}</span>
                          <p className="text-[11px] text-slate-300 truncate max-w-xs mt-0.5">{sub.product_name}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {sub.category || 'General Manufacturing'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 shrink-0">
                        {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : 'Recent'}
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(sub.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedSubmission(sub)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            title="Inspect complete dossier, documents & evidence"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>

                          {!isVerified && (
                            <button
                              type="button"
                              onClick={() => handleApprove(sub)}
                              disabled={isProcessing}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                              title="Approve and issue authentic ISI mark licence"
                            >
                              <CheckCircle2 size={13} />
                              <span>Approve</span>
                            </button>
                          )}

                          {!isRejected && (
                            <button
                              type="button"
                              onClick={() => handleOpenRejectModal(sub)}
                              disabled={isProcessing}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                              title="Reject submission with formal statutory reason"
                            >
                              <XCircle size={13} />
                              <span>Reject</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Inspection Modal / Drawer */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 select-none animate-fade-in">
          <div className="w-full max-w-2xl bg-[#0d1424] border border-slate-700 rounded-3xl p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">
                    {selectedSubmission.standard_id}
                  </span>
                  {getStatusBadge(selectedSubmission.status)}
                </div>
                <h2 className="text-lg font-black text-white">{selectedSubmission.company_name}</h2>
                <p className="text-xs text-slate-400">{selectedSubmission.submission_title || 'Conformity Grant Application'}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Applicant Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#090e1c] border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Authorized Signatory</span>
                <p className="font-bold text-slate-200">{selectedSubmission.applicant_name}</p>
                <p className="text-[11px] text-slate-400 truncate">{selectedSubmission.applicant_email}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#090e1c] border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">GSTIN / Registration</span>
                <p className="font-mono font-bold text-slate-200">{selectedSubmission.gstin || 'None'}</p>
                <p className="text-[11px] text-slate-400 truncate">{selectedSubmission.udyam_number || 'Udyam Pending'}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#090e1c] border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Enterprise Scale</span>
                <p className="font-bold text-slate-200">{selectedSubmission.enterprise_category || 'MSME'}</p>
                <p className="text-[11px] text-amber-400 font-semibold">{selectedSubmission.annual_capacity || 'N/A'}</p>
              </div>
            </div>

            {/* Product & Scope Details */}
            <div className="p-4 rounded-2xl bg-[#090e1c] border border-slate-800 space-y-2 text-xs">
              <h4 className="font-bold text-slate-300">Product Profile & Scope</h4>
              <p className="text-slate-200"><span className="text-slate-500">Product:</span> {selectedSubmission.product_name}</p>
              <p className="text-slate-200"><span className="text-slate-500">Factory Address:</span> {selectedSubmission.factory_address || `${selectedSubmission.district}, ${selectedSubmission.state}`}</p>
              <p className="text-slate-200"><span className="text-slate-500">Compliance Readiness Score:</span> <span className="font-bold text-emerald-400">{selectedSubmission.readiness_score || 75}%</span></p>
            </div>

            {/* Documents & Evidence Matrix */}
            <div className="space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-300">Attached Test Reports & Lab Evidence</h4>
              {selectedSubmission.documents && selectedSubmission.documents.length > 0 ? (
                <div className="space-y-2">
                  {selectedSubmission.documents.map((doc, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#090e1c] border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText size={16} className="text-blue-400 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-200">{doc.name}</p>
                          <p className="text-[11px] text-slate-500">{doc.lab} • {doc.type} • {doc.date}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        doc.status === 'PASS' || doc.status === 'VERIFIED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No external document files attached.</p>
              )}
            </div>

            {/* Audit History Timeline */}
            <div className="p-4 rounded-2xl bg-[#090e1c] border border-slate-800 space-y-2 text-xs">
              <h4 className="font-bold text-slate-300">Audit History</h4>
              <div className="space-y-1.5 text-slate-400">
                <p>Submitted At: <span className="text-slate-200">{selectedSubmission.submitted_at ? new Date(selectedSubmission.submitted_at).toLocaleString() : 'N/A'}</span></p>
                {selectedSubmission.verified_by && (
                  <p className="text-emerald-400">
                    Verified By: <span className="font-bold text-white">{selectedSubmission.verified_by}</span> on {new Date(selectedSubmission.verified_at).toLocaleString()}
                  </p>
                )}
                {selectedSubmission.cml_license && (
                  <p className="text-emerald-400 font-mono">
                    Licence Issued: <span className="font-bold text-white">{selectedSubmission.cml_license}</span> ({selectedSubmission.approval_ref})
                  </p>
                )}
                {selectedSubmission.rejected_by && (
                  <div className="space-y-1">
                    <p className="text-rose-400">
                      Rejected By: <span className="font-bold text-white">{selectedSubmission.rejected_by}</span> on {new Date(selectedSubmission.rejected_at).toLocaleString()}
                    </p>
                    <p className="p-2 rounded bg-rose-950/40 border border-rose-900/50 text-rose-300">
                      Reason: {selectedSubmission.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>

              {selectedSubmission.status !== 'rejected' && (
                <button
                  type="button"
                  onClick={() => handleOpenRejectModal(selectedSubmission)}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 font-bold text-xs transition-colors cursor-pointer"
                >
                  Reject Submission
                </button>
              )}

              {selectedSubmission.status !== 'verified' && (
                <button
                  type="button"
                  onClick={() => handleApprove(selectedSubmission)}
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all flex items-center gap-1.5 shadow-lg hover:shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
                >
                  <Stamp size={15} />
                  <span>{isProcessing ? 'Granting Licence...' : 'Approve & Issue CML Licence'}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Confirmation Modal for Rejection (Strictly Requires Reason) */}
      {rejectModalOpen && submissionToReject && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-fade-in">
          <div className="w-full max-w-md bg-[#0d1424] border border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <XCircle size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Reject Submission</h3>
                <p className="text-xs text-slate-400">{submissionToReject.company_name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Please provide a clear statutory reason for rejecting this dossier. This will be officially recorded in the audit trail and provided to the applicant.
            </p>

            {rejectionError && (
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5 text-rose-400" />
                <span>{rejectionError}</span>
              </div>
            )}

            <div className="space-y-1 text-xs">
              <label className="font-bold text-slate-300">Statutory Rejection Reason *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Failed hydrostatic burst pressure test under Clause 6.1. Incomplete NABL accreditation certificate."
                rows={4}
                required
                className="w-full p-3 rounded-xl bg-[#090e1c] border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500 text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
