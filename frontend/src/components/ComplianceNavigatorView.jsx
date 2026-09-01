import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Layers, ArrowRight, ShieldCheck, RefreshCw, FileCheck, BookmarkPlus, CheckCircle2 } from 'lucide-react';
import ProductToStandardCard from './ProductToStandardCard';
import ComplianceMatrix from './ComplianceMatrix';
import ComplianceJourney from './ComplianceJourney';
import { mapProductToStandard, evaluateComplianceMatrix } from '../services/api';
import { DEMO_WORKFLOW_PROMPTS } from '../utils/constants';

export default function ComplianceNavigatorView({
  onOpenEvidence,
  onOpenDocAnalyzer,
  onOpenChecklistModal,
  auth,
  initialQuery = "I manufacture stainless steel water bottles"
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
      console.error("Navigator search error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRunSearch(initialQuery);
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
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-10 max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs font-extrabold tracking-wide">
          <Sparkles size={14} />
          <span>Product → Applicable Standard → Requirements → Evidence → Next Action</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          BIS Compliance Decision & Assessment Studio
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          Define your manufacturing scope in plain language to discover applicable Indian Standards, understand exact statutory reasons why they apply, review required test clauses, and calculate audit readiness.
        </p>
      </div>

      {/* Product Search & Scope Studio */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Describe your product, raw materials, or manufacturing scope:
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunSearch()}
            placeholder="e.g. I manufacture stainless steel water bottles or Cordless electric kettles..."
            className="flex-1 px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 font-semibold outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
          <button
            type="button"
            onClick={() => handleRunSearch()}
            disabled={loading || !query.trim()}
            className="px-6 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-40"
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
            <span>{loading ? "Searching Gazette..." : "Identify Standards"}</span>
          </button>
        </div>

        {/* 1-Click Demo Profiles */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            1-Click Benchmark Product Profiles:
          </span>
          <div className="flex flex-wrap gap-2">
            {DEMO_WORKFLOW_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(item.query);
                  handleRunSearch(item.query);
                }}
                className="text-xs px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-orange-950/60 text-slate-700 dark:text-slate-300 hover:text-orange-700 font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
              >
                {item.query}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <RefreshCw size={28} className="animate-spin text-orange-500 mx-auto" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Analyzing product scope against Bureau of Indian Standards specifications...
          </p>
        </div>
      )}

      {/* Results Workspace */}
      {!loading && productData && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Top Actions: Save to Assessment History & Export */}
          {auth?.user && complianceData && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Assessment for: <b>{auth.user.company_name}</b> ({auth.user.full_name})
                </span>
              </div>
              <button
                type="button"
                onClick={handleSaveAssessment}
                className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                {saveSuccess ? <CheckCircle2 size={14} className="text-emerald-400" /> : <BookmarkPlus size={14} />}
                <span>{saveSuccess ? "Assessment Saved ✓" : "Save to Organization Profile"}</span>
              </button>
            </div>
          )}

          {/* Step 1: Product Understanding & Applicable Standards */}
          <ProductToStandardCard
            productProfile={productData.product_profile}
            applicableStandards={productData.applicable_standards}
            onSelectStandard={handleSelectStandard}
            onOpenEvidence={onOpenEvidence}
          />

          {/* Step 2: Visual Compliance Journey */}
          {complianceData && complianceData.journey && (
            <ComplianceJourney
              journey={complianceData.journey}
              onSelectStage={(stg) => console.log("Selected stage:", stg)}
            />
          )}

          {/* Step 3: Structured Requirement Matrix & Dual Scores */}
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
  );
}
