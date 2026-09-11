import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Activity,
  Server,
  Cpu,
  Layers,
  Award
} from 'lucide-react';
import { getAdminStats } from '../../services/api';

export default function AdminDashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      setError(err.message || "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw size={28} className="text-blue-500 animate-spin" />
        <p className="text-xs font-bold text-slate-400">Loading statutory platform metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 max-w-lg mx-auto text-center space-y-4">
        <AlertTriangle size={32} className="mx-auto text-rose-400" />
        <div>
          <h3 className="text-sm font-bold text-white">Something went wrong.</h3>
          <p className="text-xs text-rose-300/80 mt-1">{error}</p>
        </div>
        <button
          type="button"
          onClick={fetchStats}
          className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    {
      id: 'total_users',
      label: 'Total Users',
      value: stats?.total_users ?? stats?.totalUsers ?? stats?.total_submissions ?? 0,
      icon: <Users size={20} />,
      color: 'from-blue-600/20 to-blue-900/10 text-blue-400 border-blue-500/30',
      desc: 'Registered manufacturers & citizens',
      onClick: () => onNavigate && onNavigate('users')
    },
    {
      id: 'active_users',
      label: 'Active Users',
      value: stats?.active_users ?? stats?.activeUsers ?? stats?.active_manufacturers ?? 0,
      icon: <TrendingUp size={20} />,
      color: 'from-cyan-600/20 to-cyan-900/10 text-cyan-400 border-cyan-500/30',
      desc: 'Active compliant enterprises',
      onClick: () => onNavigate && onNavigate('users')
    },
    {
      id: 'pending_verification',
      label: 'Pending Verification',
      value: stats?.pending_verification ?? stats?.pending_verifications ?? 0,
      icon: <Clock size={20} />,
      color: 'from-amber-600/20 to-amber-900/10 text-amber-400 border-amber-500/30',
      desc: 'Dossiers awaiting officer audit',
      onClick: () => onNavigate && onNavigate('verification')
    },
    {
      id: 'verified',
      label: 'Verified',
      value: stats?.verified ?? stats?.approved_licenses ?? 0,
      icon: <CheckCircle2 size={20} />,
      color: 'from-emerald-600/20 to-emerald-900/10 text-emerald-400 border-emerald-500/30',
      desc: 'ISI Licences granted',
      onClick: () => onNavigate && onNavigate('verification')
    },
    {
      id: 'rejected',
      label: 'Rejected',
      value: stats?.rejected ?? stats?.rejected_applications ?? 0,
      icon: <XCircle size={20} />,
      color: 'from-rose-600/20 to-rose-900/10 text-rose-400 border-rose-500/30',
      desc: 'Non-compliant submissions',
      onClick: () => onNavigate && onNavigate('verification')
    },
    {
      id: 'reports',
      label: 'Reports',
      value: stats?.reports ?? stats?.unresolved_reports ?? 0,
      icon: <FileText size={20} />,
      color: 'from-purple-600/20 to-purple-900/10 text-purple-400 border-purple-500/30',
      desc: 'Open grievances & violations',
      onClick: () => onNavigate && onNavigate('reports')
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Directorate Executive Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time compliance monitoring, verification backlog, and regulatory telemetry.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[#0d1424] hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw size={14} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {statCards.map((card) => (
          <div
            key={card.id}
            onClick={card.onClick}
            className={`p-4 rounded-2xl bg-[#0d1424] border bg-gradient-to-b ${card.color} transition-all duration-200 flex flex-col justify-between ${
              card.onClick ? 'cursor-pointer hover:scale-[1.02] hover:border-slate-500' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 truncate">{card.label}</span>
              <div className="p-1.5 rounded-lg bg-[#070b14]/60">{card.icon}</div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {card.value}
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Center Layout: Quick Action Banners & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Action Centers & Telemetry */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Execution Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => onNavigate && onNavigate('verification')}
              className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                  Conformity Verification Queue
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Inspect {stats?.pending_verification || 0} manufacturer dossiers awaiting bursting pressure & dielectric test verification.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-blue-400 pt-1">
                <span>Open Verification Studio</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div
              onClick={() => onNavigate && onNavigate('reports')}
              className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer group space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                  Platform Moderation & Grievances
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Review {stats?.reports || 0} open citizen reports regarding counterfeit ISI markings and non-compliant goods.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-purple-400 pt-1">
                <span>Inspect Reports Center</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Statutory Telemetry Status Box */}
          <div className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Server size={18} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-white">System Health & Autonomous Engine</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                ● Fully Operational
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#090e1c] border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Database Storage</span>
                <p className="font-bold text-slate-200">MongoDB Active Engine</p>
                <p className="text-[11px] text-emerald-400 font-semibold">Port 5001 • Resilient Mode</p>
              </div>
              <div className="p-3 rounded-xl bg-[#090e1c] border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">AI RAG Pipeline</span>
                <p className="font-bold text-slate-200">FastAPI + ChromaDB</p>
                <p className="text-[11px] text-blue-400 font-semibold">24 Standards • Port 8000</p>
              </div>
              <div className="p-3 rounded-xl bg-[#090e1c] border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">QCO Governance</span>
                <p className="font-bold text-slate-200">Gazette Order 2026</p>
                <p className="text-[11px] text-amber-400 font-semibold">Strict Mandatory Auditing</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right 1 Col: Recent Administrative Activity Log */}
        <div className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-blue-400" />
                <h3 className="text-sm font-bold text-white">Recent Audit Trail</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('activity')}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-bold hover:underline"
              >
                View All →
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {stats?.recent_activities && stats.recent_activities.length > 0 ? (
                stats.recent_activities.map((act, i) => (
                  <div
                    key={act._id || act.id || i}
                    className="p-3 rounded-xl bg-[#090e1c] border border-slate-800/80 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 truncate">{act.action}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {act.timestamp ? new Date(act.timestamp).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{act.target_title || act.target_id}</p>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>By: {act.admin_name || 'Admin'}</span>
                      {act.details?.cml_license && (
                        <span className="text-emerald-400 font-mono font-bold">
                          {act.details.cml_license}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-slate-500 text-xs">
                  No recent audit activity recorded yet.
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('activity')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors text-center cursor-pointer"
          >
            Inspect Complete Audit Feed
          </button>
        </div>

      </div>
    </div>
  );
}
