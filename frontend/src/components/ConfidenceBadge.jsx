import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export default function ConfidenceBadge({ score }) {
  if (score === null || score === undefined || typeof score !== 'number' || score < 60) {
    return null;
  }

  let color, bg, icon, label;

  if (score >= 80) {
    color = 'text-emerald-700 dark:text-emerald-400';
    bg = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60';
    icon = <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" />;
    label = 'Grounded & Verified';
  } else {
    color = 'text-amber-700 dark:text-amber-400';
    bg = 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60';
    icon = <ShieldAlert size={13} className="text-amber-600 dark:text-amber-400" />;
    label = 'Moderate Confidence';
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${bg} ${color}`}>
      {icon}
      <span>{label}</span>
      <span className="font-semibold opacity-75">({score}%)</span>
    </div>
  );
}
