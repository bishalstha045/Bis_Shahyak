import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Lock, ArrowRight, Shield } from 'lucide-react';

export default function ComplianceJourney({ journey = [], onSelectStage }) {
  if (!journey || journey.length === 0) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Complete':
        return { icon: <CheckCircle2 size={15} className="text-emerald-500" />, bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'Needs Review':
        return { icon: <AlertTriangle size={15} className="text-amber-500" />, bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'Missing':
        return { icon: <XCircle size={15} className="text-rose-500" />, bg: 'bg-rose-50 text-rose-800 border-rose-200' };
      default:
        return { icon: <Lock size={15} className="text-slate-400" />, bg: 'bg-slate-100 text-slate-500 border-slate-200' };
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Shield size={18} className="text-orange-500" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            03. BIS Compliance Journey & Stepper
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">Click any milestone to inspect</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {journey.map((step, idx) => {
          const badge = getStatusBadge(step.status);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectStage && onSelectStage(step)}
              className="flex flex-col p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-orange-50/70 dark:hover:bg-orange-950/40 border border-slate-200 dark:border-slate-700 hover:border-orange-300 text-left transition-all group space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400">Step 0{idx + 1}</span>
                {badge.icon}
              </div>
              <p className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1">
                {step.title}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                {step.summary}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
