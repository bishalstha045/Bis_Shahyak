import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Clock,
  ExternalLink,
  X,
  ShieldAlert,
  Send
} from 'lucide-react';
import {
  getAdminReports,
  resolveAdminReport,
  dismissAdminReport
} from '../../services/api';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Detail Drawer / Modal
  const [selectedReport, setSelectedReport] = useState(null);

  // Resolve Modal State
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [reportToResolve, setReportToResolve] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionTaken, setActionTaken] = useState('Issued Statutory Notice under BIS Act');
  const [isProcessing, setIsProcessing] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminReports({
        search: searchQuery,
        status: statusFilter
      });
      setReports(data);
    } catch (err) {
      setError(err.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    fetchReports();
  };

  const handleOpenResolve = (rep) => {
    setReportToResolve(rep);
    setResolutionNotes('');
    setActionTaken('Issued Statutory Advisory under BIS Act 2016');
    setResolveModalOpen(true);
  };

  const handleConfirmResolve = async () => {
    if (!reportToResolve) return;
    const id = reportToResolve._id || reportToResolve.id;
    setIsProcessing(true);

    try {
      const updated = await resolveAdminReport(id, {
        resolution_notes: resolutionNotes || 'Compliance inspection conducted and statutory action executed.',
        action_taken: actionTaken
      });
      showToast(`Report #${id} marked as resolved.`);
      setReports(prev => prev.map(r => (r._id === id || r.id === id) ? updated : r));
      if (selectedReport && (selectedReport._id === id || selectedReport.id === id)) {
        setSelectedReport(updated);
      }
      setResolveModalOpen(false);
      setReportToResolve(null);
    } catch (err) {
      showToast(err.message || "Failed to resolve report.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDismiss = async (rep) => {
    const id = rep._id || rep.id;
    setIsProcessing(true);
    try {
      const updated = await dismissAdminReport(id, { notes: "Inspected by officer and found non-violative." });
      showToast(`Report #${id} dismissed.`);
      setReports(prev => prev.map(r => (r._id === id || r.id === id) ? updated : r));
      if (selectedReport && (selectedReport._id === id || selectedReport.id === id)) {
        setSelectedReport(updated);
      }
    } catch (err) {
      showToast(err.message || "Failed to dismiss report.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'open').toLowerCase();
    if (s === 'resolved') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold inline-flex items-center gap-1">
          <CheckCircle2 size={11} /> Resolved
        </span>
      );
    }
    if (s === 'dismissed') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400 border border-slate-600/40 text-[10px] font-bold">
          Dismissed
        </span>
      );
    }
    if (s === 'under_review') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] font-bold inline-flex items-center gap-1">
          <Clock size={11} /> Under Review
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold inline-flex items-center gap-1">
        <AlertTriangle size={11} /> Open
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Moderation & Compliance Grievances
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Investigate reported non-compliant products, counterfeit ISI marks, and standards disputes.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchReports}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[#0d1424] hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Reports</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0d1424] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by title, reason, or reporter..."
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

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px] font-bold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-[#090e1c] border border-slate-700 text-slate-200 text-xs focus:outline-hidden"
          >
            <option value="ALL">All Reports</option>
            <option value="open">Open</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-[#0d1424] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw size={26} className="text-blue-500 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-400">Loading reports...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center space-y-3">
            <AlertTriangle size={28} className="text-rose-400 mx-auto" />
            <p className="text-xs font-bold text-rose-300">{error}</p>
            <button
              type="button"
              onClick={fetchReports}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700"
            >
              Retry
            </button>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-20 text-center space-y-3 max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
              <FileText size={26} />
            </div>
            <h3 className="text-sm font-bold text-white">No Reports Filed</h3>
            <p className="text-xs text-slate-400">
              No active grievances or compliance reports match your filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#090e1c]/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Subject & Target</th>
                  <th className="py-3.5 px-4">Violation / Reason</th>
                  <th className="py-3.5 px-4">Reporter</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-slate-200">
                {reports.map((rep) => {
                  const id = rep._id || rep.id;
                  const isResolved = rep.status === 'resolved';
                  const isDismissed = rep.status === 'dismissed';

                  return (
                    <tr key={id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white text-xs">{rep.target_title}</p>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">{rep.target_type}</span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-300">
                        {rep.reason}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {rep.reporter_name || 'Anonymous'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          rep.severity === 'critical'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : rep.severity === 'high'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}>
                          {rep.severity || 'Medium'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(rep.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedReport(rep)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] transition-colors cursor-pointer"
                          >
                            Inspect
                          </button>

                          {!isResolved && (
                            <button
                              type="button"
                              onClick={() => handleOpenResolve(rep)}
                              disabled={isProcessing}
                              className="px-2.5 py-1 rounded bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Resolve
                            </button>
                          )}

                          {!isDismissed && !isResolved && (
                            <button
                              type="button"
                              onClick={() => handleDismiss(rep)}
                              disabled={isProcessing}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 font-semibold text-[11px] transition-colors cursor-pointer"
                            >
                              Dismiss
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

      {/* Report Inspection Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-fade-in">
          <div className="w-full max-w-lg bg-[#0d1424] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    Target: {selectedReport.target_type}
                  </span>
                  {getStatusBadge(selectedReport.status)}
                </div>
                <h3 className="text-base font-black text-white">{selectedReport.target_title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#090e1c] border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Reason</span>
                <p className="font-bold text-slate-200">{selectedReport.reason}</p>
                <p className="text-slate-400 leading-relaxed mt-1">{selectedReport.description}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#090e1c] border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Reporter Details</span>
                <p className="font-bold text-slate-200">{selectedReport.reporter_name}</p>
                <p className="text-slate-400">{selectedReport.reporter_email || 'Direct Vigilance Submission'}</p>
              </div>

              {selectedReport.resolution_notes && (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/50 space-y-1">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold">Resolution Details</span>
                  <p className="text-slate-200">{selectedReport.resolution_notes}</p>
                  <p className="text-emerald-400 font-semibold">{selectedReport.action_taken}</p>
                  <p className="text-[10px] text-slate-500">Resolved by {selectedReport.resolved_by || 'Officer'}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
              >
                Close
              </button>

              {selectedReport.status !== 'resolved' && (
                <button
                  type="button"
                  onClick={() => {
                    handleOpenResolve(selectedReport);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors cursor-pointer"
                >
                  Resolve Report
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resolution Dialog Modal */}
      {resolveModalOpen && reportToResolve && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-fade-in">
          <div className="w-full max-w-md bg-[#0d1424] border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Resolve Report</h3>
                <p className="text-xs text-slate-400 truncate max-w-xs">{reportToResolve.target_title}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Action Executed *</label>
                <select
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#090e1c] border border-slate-700 text-white text-xs focus:outline-hidden"
                >
                  <option value="Issued Statutory Notice under BIS Act Section 17">Issued Statutory Notice under BIS Act Section 17</option>
                  <option value="Product Samples Seized for Laboratory Audit">Product Samples Seized for Laboratory Audit</option>
                  <option value="Clarification Issued to Technical Committee">Clarification Issued to Technical Committee</option>
                  <option value="Retail Stock Recall Mandated">Retail Stock Recall Mandated</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Officer Resolution Notes</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Record summary of investigation findings and outcome..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-[#090e1c] border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setResolveModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResolve}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? 'Resolving...' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
