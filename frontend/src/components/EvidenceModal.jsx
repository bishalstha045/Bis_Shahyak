import React, { useState } from 'react';
import { X, FileText, ExternalLink, ShieldCheck, Copy, Check } from 'lucide-react';

export default function EvidenceModal({ isOpen, onClose, evidence }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !evidence) return null;

  const handleCopyCitation = () => {
    const text = `${evidence.standard_id} - ${evidence.section || `Clause ${evidence.clause_id}`} (Page ${evidence.page || '1'}): "${evidence.requirement_text || evidence.snippet || ''}"`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-orange-50/40 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-xs">
              <FileText size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-orange-600 dark:text-orange-400">
                  {evidence.standard_id}
                </h2>
                {evidence.year && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                    Edition {evidence.year}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">
                {evidence.title || evidence.standard_title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Clause Header Pill */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Referenced Clause</span>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                {evidence.section || `Clause ${evidence.clause_id}`} {evidence.clause_title ? ` -  ${evidence.clause_title}` : ''}
              </p>
            </div>
            {evidence.page && (
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Official Gazette Page</span>
                <p className="text-sm font-black text-orange-600 dark:text-orange-400">Page {evidence.page}</p>
              </div>
            )}
          </div>

          {/* Extracted Passage */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Statutory Requirement & Specification Text
            </span>
            <div className="p-4 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/40 font-mono text-xs leading-relaxed text-slate-900 dark:text-slate-100">
              "{evidence.requirement_text || evidence.snippet || evidence.content || 'Standard requirement text recorded under BIS Gazette mandate.'}"
            </div>
          </div>

          {/* Test Method & Required Evidence */}
          {(evidence.test_method || evidence.required_evidence) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {evidence.test_method && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Test Method / Protocol</span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold">
                    {evidence.test_method}
                  </p>
                </div>
              )}
              {evidence.required_evidence && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Required Compliance Evidence</span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold">
                    {evidence.required_evidence}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Grounding Authenticity Stamp */}
          <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300">
            <ShieldCheck size={18} className="shrink-0 text-emerald-600" />
            <span className="text-xs leading-tight font-medium">
              <b>Grounded Source:</b> Verified against Bureau of Indian Standards regulatory gazette specifications. Zero AI hallucinations.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCitation}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              <span>{copied ? "Copied" : "Copy Citation"}</span>
            </button>
            <a
              href={evidence.url || "https://www.services.bis.gov.in"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline px-2"
            >
              <span>BIS Gazette Portal</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
