import React, { useState } from 'react';
import { Layers, HelpCircle, ChevronDown, ChevronUp, ExternalLink, ShieldCheck, CheckCircle2, FileText, ArrowRight, Sparkles } from 'lucide-react';

export default function ProductToStandardCard({
  productProfile,
  applicableStandards = [],
  onSelectStandard,
  onOpenEvidence
}) {
  const [expandedWhy, setExpandedWhy] = useState({});

  if (!productProfile || !applicableStandards || applicableStandards.length === 0) return null;

  const toggleWhy = (stdId) => {
    setExpandedWhy(prev => ({ ...prev, [stdId]: !prev[stdId] }));
  };

  return (
    <div className="space-y-5">
      {/* Product Understanding & Classification Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 flex items-center justify-center font-bold">
            <Layers size={18} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-700 dark:text-orange-400">
              01. Product Understanding & Scope
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 dark:text-white">
              {productProfile.product_name}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Regulated Category</span>
            <p className="font-bold text-slate-900 dark:text-white mt-1 text-sm">{productProfile.product_category}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Material Specification</span>
            <p className="font-bold text-slate-900 dark:text-white mt-1 text-sm">{productProfile.material}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Intended Purpose</span>
            <p className="font-medium text-slate-700 dark:text-slate-300 mt-1 line-clamp-2">{productProfile.intended_use}</p>
          </div>
        </div>

        {productProfile.characteristics && productProfile.characteristics.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
              Key Identified Parameters:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {productProfile.characteristics.map((char, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                >
                  ✓ {char}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Candidate Applicable Standards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              02. Applicable Indian Standards ({applicableStandards.length})
            </h3>
          </div>
          <span className="text-xs text-orange-600 dark:text-orange-400 font-bold">
            Gazetted BIS Scope
          </span>
        </div>

        <div className="space-y-4">
          {applicableStandards.map((std, idx) => {
            const isWhyOpen = !!expandedWhy[std.standard_id];
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-orange-300 transition-all text-left space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base sm:text-lg font-black text-orange-600 dark:text-orange-400">
                        {std.standard_id}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {std.relevance_label || 'High'} Relevance ({std.relevance_score}%)
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {std.status || 'Active Gazette Standard'}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-950 dark:text-white leading-snug">
                      {std.title}
                    </h4>

                    {std.amendments && std.amendments.length > 0 && (
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                        ⓘ {std.amendments[0].number} ({std.amendments[0].date}): {std.amendments[0].summary}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start">
                    <button
                      type="button"
                      onClick={() => toggleWhy(std.standard_id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/50 dark:hover:bg-orange-900/60 text-orange-700 dark:text-orange-300 text-xs font-bold border border-orange-200 dark:border-orange-800 transition-colors"
                    >
                      <HelpCircle size={14} />
                      <span>Why this standard?</span>
                      {isWhyOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {onSelectStandard && (
                      <button
                        type="button"
                        onClick={() => onSelectStandard(std)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <span>Check Compliance</span>
                        <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Explainability Layer: Why this standard applies */}
                {isWhyOpen && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 bg-slate-50/70 dark:bg-slate-800/40 p-5 rounded-2xl animate-fade-in">
                    <div className="space-y-2 text-xs">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                        Statutory Applicability Criteria:
                      </span>
                      {std.why_it_applies && std.why_it_applies.map((reason, rIdx) => (
                        <div key={rIdx} className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
                          <span className="text-emerald-500 font-bold">✓</span>
                          <span className="leading-relaxed font-medium">{reason}</span>
                        </div>
                      ))}
                    </div>

                    {/* Supporting Clause Evidence */}
                    {std.evidence_clauses && std.evidence_clauses.length > 0 && (
                      <div className="space-y-2.5 pt-3 border-t border-slate-200/70 dark:border-slate-700/70">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                          Mandatory Clause Evidence ({std.evidence_clauses.length} Clauses):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {std.evidence_clauses.map((clause, cIdx) => (
                            <div
                              key={cIdx}
                              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs flex flex-col justify-between space-y-2"
                            >
                              <div>
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-extrabold text-orange-600 dark:text-orange-400">
                                    {clause.section || `Clause ${clause.clause_id}`}
                                  </span>
                                  <span className="text-slate-400 font-semibold">Page {clause.page}</span>
                                </div>
                                <p className="font-bold text-slate-800 dark:text-slate-200 mt-1 line-clamp-2">
                                  {clause.title}
                                </p>
                              </div>
                              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => onOpenEvidence && onOpenEvidence({
                                    ...clause,
                                    standard_id: std.standard_id,
                                    title: std.title,
                                    year: std.year,
                                    url: std.source_url
                                  })}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
                                >
                                  <FileText size={12} />
                                  <span>View Statutory Evidence</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
