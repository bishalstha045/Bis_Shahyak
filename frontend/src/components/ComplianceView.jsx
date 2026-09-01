import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Layers, ArrowRight, ShieldCheck, RefreshCw, FileCheck, BookmarkPlus, CheckCircle2, Upload, Download, HelpCircle, ChevronDown, ChevronUp, FileText, Package, X, Lock, Shield, Bell, TrendingUp, ChevronRight } from 'lucide-react';
import ProductToStandardCard from './ProductToStandardCard';
import ComplianceMatrix from './ComplianceMatrix';
import ComplianceJourney from './ComplianceJourney';
import { mapProductToStandard, evaluateComplianceMatrix } from '../services/api';

const COMPLIANCE_EXAMPLES = [
  "I manufacture stainless steel water bottles.",
  "What safety standards apply to electric kettles?",
  "IS 3196 के बारे में बताइए",
  "Compare IS 302-2-15 and IS 302 (Part 1)",
  "Which BIS certification do I need to export toys?",
  "What are the BIS gold hallmarking and HUID rules?"
];

const WHAT_YOULL_GET_ITEMS = [
  {
    title: "Applicable Standards",
    desc: "Discover relevant Indian Standards",
    iconBg: "bg-blue-50 text-blue-600 border-blue-100",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <circle cx="11" cy="14" r="3" />
        <line x1="13.5" y1="16.5" x2="16" y2="19" />
      </svg>
    )
  },
  {
    title: "Statutory Requirements",
    desc: "Understand legal clauses & rules",
    iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    )
  },
  {
    title: "Evidence & Documents",
    desc: "Upload and organize supporting evidence",
    iconBg: "bg-amber-50 text-amber-600 border-amber-100",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    )
  },
  {
    title: "Compliance Readiness",
    desc: "Track your certification readiness score",
    iconBg: "bg-purple-50 text-purple-600 border-purple-100",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 20V10" />
        <path d="M12 20V4" />
        <path d="M6 20v-6" />
        <path d="M3 10l9-7 9 7" />
      </svg>
    )
  },
  {
    title: "Alerts & Updates",
    desc: "Stay updated with regulation changes",
    iconBg: "bg-teal-50 text-teal-600 border-teal-100",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    )
  },
  {
    title: "Export Reports",
    desc: "Download compliance summary & checklist",
    iconBg: "bg-rose-50 text-rose-600 border-rose-100",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <polyline points="9 15 12 18 15 15" />
      </svg>
    )
  }
];

export default function ComplianceView({
  onOpenEvidence,
  onOpenDocAnalyzer,
  onOpenChecklistModal,
  auth,
  initialQuery = "IS 3196 के बारे में बताइए"
}) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState(null);
  const [complianceData, setComplianceData] = useState(null);
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleRunSearch = async (targetQuery = query) => {
    if (!targetQuery.trim()) return;
    setLoading(true);
    setSaveSuccess(false);
    try {
      // 1. Map Product to Standard
      const prodRes = await mapProductToStandard(targetQuery);
      setProductData(prodRes);
      
      // 2. Evaluate Baseline Compliance
      const compRes = await evaluateComplianceMatrix({ product_query: targetQuery });
      setComplianceData(compRes);

      if (prodRes.applicable_standards && prodRes.applicable_standards.length > 0) {
        setSelectedStandard(prodRes.applicable_standards[0]);
      }
    } catch (err) {
      console.error("Compliance search error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleRunSearch(initialQuery);
    }
  }, []);

  const handleSelectStandard = async (std) => {
    setSelectedStandard(std);
    try {
      const compRes = await evaluateComplianceMatrix({
        product_query: query,
        standard_id: std.standard_id
      });
      setComplianceData(compRes);
    } catch (err) {
      console.error("Failed to re-evaluate compliance:", err);
    }
  };

  const handleSaveAssessment = async () => {
    if (!complianceData || !auth?.user) return;
    const res = await auth.saveAssessment({
      product_name: complianceData.product_name || query,
      standard_id: complianceData.standard_id,
      standard_title: complianceData.standard_title,
      readiness_score: complianceData.compliance_readiness_score || 0,
      matrix: complianceData.matrix || [],
      next_action: complianceData.next_best_action
    });
    if (res) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#fbfcfd] p-4 sm:p-6 lg:p-8 animate-fade-in font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ========================================================================= */}
        {/* 1. HERO SECTION WITH MONUMENT SILHOUETTE & TRICOLOR WAFT                 */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-xs p-6 sm:p-8">
          
          {/* Indian Parliament / Rashtrapati Bhavan Silhouette + Tricolor Stream on Right */}
          <div className="absolute right-0 top-0 bottom-0 w-80 md:w-96 pointer-events-none opacity-20 hidden md:flex items-center justify-end overflow-hidden">
            <svg viewBox="0 0 400 200" fill="none" className="w-full h-full text-slate-800">
              {/* Tricolor Swirl */}
              <path d="M50 20 C 150 10, 250 80, 400 40 L 400 50 C 250 90, 150 20, 50 30 Z" fill="#ea580c" />
              <path d="M50 30 C 150 20, 250 90, 400 50 L 400 60 C 250 100, 150 30, 50 40 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
              <path d="M50 40 C 150 30, 250 100, 400 60 L 400 70 C 250 110, 150 40, 50 50 Z" fill="#16a34a" />
              
              {/* Parliament Dome Structure */}
              <path d="M260 200 V120 H280 V100 Q310 60 340 100 V120 H360 V200 Z" fill="currentColor" />
              <circle cx="310" cy="55" r="5" fill="#ea580c" />
              <line x1="310" y1="50" x2="310" y2="35" stroke="#ea580c" strokeWidth="2" />
              <rect x="220" y="140" width="180" height="60" rx="2" fill="currentColor" opacity="0.6" />
            </svg>
          </div>

          <div className="relative z-10 space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-[11px] font-bold tracking-wider uppercase shadow-2xs">
              <ShieldCheck size={14} className="text-orange-600" />
              <span>BIS Compliance Decision Studio</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-[#0b2545] tracking-tight">
              Product → Applicable Standard → Compliance Journey
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Define your product specifications to discover applicable Indian Standards, review statutory clauses, attach evidence, and track certification readiness.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. SEARCH INPUT CARD & EXAMPLES                                           */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4">
          
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Describe your product, material specifications, or manufacturing scope:
          </label>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Package size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunSearch()}
                placeholder="e.g. I manufacture stainless steel water bottles or Cordless electric kettles..."
                className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-300 bg-slate-50/70 focus:bg-white text-xs sm:text-sm font-semibold outline-none focus:border-[#0b2545] focus:ring-1 focus:ring-[#0b2545] transition-all shadow-2xs"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Clear input"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleRunSearch()}
              disabled={loading || !query.trim()}
              className="px-6 py-3 rounded-2xl bg-[#0b2545] hover:bg-[#133b68] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-40"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
              <span>{loading ? "Analyzing..." : "Identify Standards"}</span>
            </button>
          </div>

          {/* Try These Examples */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Try These Examples
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {COMPLIANCE_EXAMPLES.map((promptText, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(promptText);
                    handleRunSearch(promptText);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-orange-50/70 hover:border-orange-200 border border-slate-200 text-slate-700 hover:text-[#0b2545] text-xs font-medium transition-all text-left flex items-center justify-between group shadow-2xs"
                >
                  <span className="truncate mr-2">{promptText}</span>
                  <ChevronRight size={13} className="text-slate-400 group-hover:text-orange-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 3. WHAT YOU'LL GET (6 CARDS GRID)                                         */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            What You'll Get
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {WHAT_YOULL_GET_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2.5 hover:shadow-sm hover:border-slate-300 transition-all group"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${item.iconBg} shadow-2xs group-hover:scale-105 transition-transform`}>
                  {item.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. CONFIDENTIAL & SECURE FOOTER BANNER                                    */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-blue-950">
                100% Confidential & Secure
              </h4>
              <p className="text-[11px] text-blue-800/90 font-medium">
                Your data is encrypted and secure. We do not share your information with third parties.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-blue-900 opacity-60">
            <Lock size={20} />
            <div className="w-8 h-0.5 bg-blue-300"></div>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. LOADING SPINNER & ACTIVE COMPLIANCE WORKFLOW RESULTS                   */}
        {/* ========================================================================= */}
        {loading && (
          <div className="p-10 rounded-3xl bg-white border border-slate-200 text-center space-y-3 shadow-xs">
            <RefreshCw size={26} className="animate-spin text-[#0b2545] mx-auto" />
            <p className="text-xs sm:text-sm font-bold text-slate-800">
              Matching product parameters against official Bureau of Indian Standards specifications...
            </p>
          </div>
        )}

        {!loading && productData && (
          <div className="space-y-6 pt-2 animate-fade-in">
            
            {/* Save to Organization Profile */}
            {auth?.user && complianceData && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs">
                <span className="font-bold text-slate-700">
                  Assessment for: <b className="text-slate-900">{auth.user.company_name}</b> ({auth.user.full_name})
                </span>
                <button
                  type="button"
                  onClick={handleSaveAssessment}
                  className="px-4 py-2 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {saveSuccess ? <CheckCircle2 size={14} className="text-emerald-400" /> : <BookmarkPlus size={14} />}
                  <span>{saveSuccess ? "Saved to Profile ✓" : "Save Assessment"}</span>
                </button>
              </div>
            )}

            {/* 1. Product Classification & Applicable Standards */}
            <ProductToStandardCard
              productProfile={productData.product_profile}
              applicableStandards={productData.applicable_standards}
              onSelectStandard={handleSelectStandard}
              onOpenEvidence={onOpenEvidence}
            />

            {/* 2. Visual Stepper / Compliance Journey */}
            {complianceData && complianceData.journey && (
              <ComplianceJourney
                journey={complianceData.journey}
                onSelectStage={(stg) => console.log("Selected stage:", stg)}
              />
            )}

            {/* 3. Requirement Matrix, Dual Gauges & Next Best Action */}
            {complianceData && (
              <ComplianceMatrix
                complianceData={complianceData}
                onOpenEvidence={onOpenEvidence}
                onUploadDoc={onOpenDocAnalyzer}
                onDownloadPDF={() => onOpenChecklistModal && onOpenChecklistModal({
                  product: complianceData.product_name,
                  citations: [{ standard_id: complianceData.standard_id, title: complianceData.standard_title, section: "Mandatory Clauses" }]
                })}
              />
            )}

          </div>
        )}

      </div>
    </div>
  );
}
