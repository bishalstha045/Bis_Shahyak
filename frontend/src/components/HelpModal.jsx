import React from 'react';
import { X, HelpCircle, ShieldCheck, BookOpen, FileText, CheckCircle2, ExternalLink, Building2, Search, ClipboardCheck, UploadCloud, ChevronRight, Info } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in font-sans select-none">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* ========================================================================= */}
        {/* 1. MODAL HEADER                                                           */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#0b2545] text-white flex items-center justify-center font-black text-sm shadow-xs">
              ?
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-[#0b2545] tracking-tight">
                BIS Sahayak User Guide & Platform Information
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                AI-Powered BIS Compliance Decision Navigator
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. MODAL BODY (SCROLLABLE CONTENT)                                        */}
        {/* ========================================================================= */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Core Platform Positioning Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200/90 flex items-start gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-2xl bg-[#0b2545] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Building2 size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                Core Platform Positioning
              </h3>
              <p className="text-slate-600 text-[11px] sm:text-xs leading-relaxed">
                <b>Bureau of Indian Standards (BIS)</b> provides the official standards, gazette notifications, and certification rules. <b>BIS Sahayak</b> is an AI-powered assistant designed to help manufacturers, MSMEs, and quality managers understand how those standards apply to their specific product and determine the next best action.
              </p>
            </div>
          </div>

          {/* The 5-Step Compliance Journey Section */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                The 5-Step Compliance Journey
              </span>
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Step 01 */}
              <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-colors flex items-start gap-3 shadow-2xs group">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-black leading-none">01</span>
                  <BookOpen size={14} className="mt-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs">Find Standards</h4>
                    <ChevronRight size={13} className="text-slate-400 group-hover:text-orange-600 transition-colors" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    Describe your product in natural language to identify matching Indian Standards and mandatory QCOs.
                  </p>
                </div>
              </div>

              {/* Step 02 */}
              <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-colors flex items-start gap-3 shadow-2xs group">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-black leading-none">02</span>
                  <Search size={14} className="mt-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs">Understand Scope</h4>
                    <ChevronRight size={13} className="text-slate-400 group-hover:text-orange-600 transition-colors" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    Inspect the "Why this standard?" explainability drawer to view statutory matching criteria.
                  </p>
                </div>
              </div>

              {/* Step 03 */}
              <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-colors flex items-start gap-3 shadow-2xs group">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-black leading-none">03</span>
                  <ClipboardCheck size={14} className="mt-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs">Check Requirements</h4>
                    <ChevronRight size={13} className="text-slate-400 group-hover:text-orange-600 transition-colors" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    Review the mandatory statutory clause matrix covering raw materials, lab tests, and marking.
                  </p>
                </div>
              </div>

              {/* Step 04 */}
              <div className="p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-colors flex items-start gap-3 shadow-2xs group">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-black leading-none">04</span>
                  <UploadCloud size={14} className="mt-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs">Audit Documents</h4>
                    <ChevronRight size={13} className="text-slate-400 group-hover:text-orange-600 transition-colors" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    Upload lab test reports to automatically match evidence against clauses and detect missing tests.
                  </p>
                </div>
              </div>

              {/* Step 05 (Full Width Span) */}
              <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/40 hover:border-emerald-300 transition-colors flex items-start gap-3 shadow-2xs sm:col-span-2 group">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-black leading-none">05</span>
                  <ShieldCheck size={14} className="mt-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-emerald-950 text-xs">Decide & Act</h4>
                    <ChevronRight size={13} className="text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-snug mt-0.5">
                    Get compliance readiness, generate checklists, export reports, and take the next best action with confidence.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Evidence-Backed Grounding Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 flex items-start gap-3 shadow-2xs">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 size={15} />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-bold text-xs text-emerald-950">
                Evidence-Backed Grounding & Zero Hallucinations
              </h4>
              <p className="text-emerald-800 text-[11px] leading-relaxed">
                Every factual requirement and clause citation in BIS Sahayak is directly grounded in official BIS specifications. Clicking any citation opens the official clause text and page number.
              </p>
            </div>
          </div>

          {/* Regulatory Notice Box */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-2.5 text-[11px] text-blue-950">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              i
            </div>
            <p className="leading-relaxed">
              <b>Regulatory Notice:</b> BIS Sahayak is an independent decision-support tool built for Smart India Hackathon (SIH) 2026. Always verify final certification submissions on the official Manakonline portal (<a href="https://www.manakonline.in" target="_blank" rel="noopener noreferrer" className="text-blue-900 font-bold hover:underline">manakonline.in</a>).
            </p>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 3. MODAL FOOTER                                                           */}
        {/* ========================================================================= */}
        <div className="flex justify-end px-6 py-3 border-t border-slate-100 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#0b2545] hover:bg-[#133b68] text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
