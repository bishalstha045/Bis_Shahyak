import React, { useState, useEffect } from 'react';
import {
  Activity,
  Filter,
  RefreshCw,
  AlertTriangle,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Trash2,
  Lock
} from 'lucide-react';
import { getAdminActivity } from '../../services/api';

export default function AdminActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('ALL');

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminActivity({ target_type: typeFilter });
      setActivities(data);
    } catch (err) {
      setError(err.message || "Failed to load activity logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [typeFilter]);

  const getActionIcon = (action = '') => {
    const act = action.toLowerCase();
    if (act.includes('verified') || act.includes('approved')) {
      return <CheckCircle2 size={16} className="text-emerald-400" />;
    }
    if (act.includes('rejected')) {
      return <XCircle size={16} className="text-rose-400" />;
    }
    if (act.includes('suspended') || act.includes('deleted')) {
      return <Trash2 size={16} className="text-amber-400" />;
    }
    if (act.includes('resolved')) {
      return <ShieldCheck size={16} className="text-blue-400" />;
    }
    return <Activity size={16} className="text-slate-400" />;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Administrative Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable statutory event log of conformity verdicts, sanctions, and regulatory actions.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchActivities}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[#0d1424] hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0d1424] border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Activity size={16} className="text-blue-400" />
          <span className="font-bold text-white">Event Streams:</span>
          <span>{activities.length} Recorded Actions</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px] font-bold">Category:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-[#090e1c] border border-slate-700 text-slate-200 text-xs focus:outline-hidden"
          >
            <option value="ALL">All Event Types</option>
            <option value="submission">Conformity Submissions</option>
            <option value="user">User Lifecycle & Sanctions</option>
            <option value="report">Grievance Resolutions</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table / Feed */}
      <div className="bg-[#0d1424] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw size={26} className="text-blue-500 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-400">Loading audit log events...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center space-y-3">
            <AlertTriangle size={28} className="text-rose-400 mx-auto" />
            <p className="text-xs font-bold text-rose-300">{error}</p>
            <button
              type="button"
              onClick={fetchActivities}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700"
            >
              Retry
            </button>
          </div>
        ) : activities.length === 0 ? (
          <div className="py-20 text-center space-y-3 max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
              <Activity size={26} />
            </div>
            <h3 className="text-sm font-bold text-white">No Activity Logs</h3>
            <p className="text-xs text-slate-400">
              No administrative events have been recorded in this category yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {activities.map((act, i) => (
              <div
                key={act._id || act.id || i}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors text-xs"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-[#090e1c] border border-slate-800 shrink-0 mt-0.5">
                    {getActionIcon(act.action)}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-xs">{act.action}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 uppercase">
                        {act.target_type || 'system'}
                      </span>
                    </div>
                    <p className="text-slate-300 font-medium truncate max-w-lg">
                      {act.target_title || act.target_id}
                    </p>
                    {act.details?.reason && (
                      <p className="text-[11px] text-rose-300/80 italic">
                        Reason: {act.details.reason}
                      </p>
                    )}
                    {act.details?.cml_license && (
                      <p className="text-[11px] text-emerald-400 font-mono font-bold">
                        Licence: {act.details.cml_license} ({act.details.approval_ref})
                      </p>
                    )}
                  </div>
                </div>

                <div className="sm:text-right shrink-0 pl-11 sm:pl-0">
                  <p className="font-bold text-slate-200">{act.admin_name || 'Dr. Rajesh Verma'}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center sm:justify-end gap-1">
                    <Clock size={11} />
                    <span>{act.timestamp ? new Date(act.timestamp).toLocaleString() : 'Recent'}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
