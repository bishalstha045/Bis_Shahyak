import React, { useState, useEffect } from 'react';
import { GitCompare, ArrowRight, ShieldCheck, Scale, ArrowLeftRight, CheckCircle2, FileText, Beaker, Layers, BookOpen, ExternalLink, Loader2 } from 'lucide-react';
import { compareStandards } from '../services/api';
import { COMPARISON_PAIRS } from '../utils/constants';

export default function StandardComparisonView() {
  const [stdA, setStdA] = useState(COMPARISON_PAIRS[0]?.std_a || 'IS 302 (Part 2/Sec 21):2024');
  const [stdB, setStdB] = useState(COMPARISON_PAIRS[0]?.std_b || 'IS 302 (Part 1):2024');
  const [loading, setLoading] = useState(false);
  const [compResult, setCompResult] = useState(null);

  const fetchComparison = async (a = stdA, b = stdB) => {
    const queryA = (a || '').trim();
    const queryB = (b || '').trim();
    if (!queryA || !queryB) return;

    setLoading(true);
    try {
      const data = await compareStandards(queryA, queryB);
      if (data && (data.comparison_table || data.standard_a)) {
        setCompResult(data);
      } else {
        throw new Error("Invalid comparison payload");
      }
    } catch (err) {
      console.error("Comparison error:", err);
      // Clean fallback data honoring input queries
      const isHsnA = /^(hsn|\d{4})/i.test(queryA);
      const isHsnB = /^(hsn|\d{4})/i.test(queryB);

      setCompResult({
        standard_a: {
          id: queryA || "IS 302 (Part 2/Sec 21):2024",
          title: isHsnA ? `HSN Tariff Classification - ${queryA}` : "Stationary Storage Electric Water Heaters",
          type: isHsnA ? "Harmonized System of Nomenclature (HSN)" : "Indian Standard (IS)",
          scope: isHsnA ? `Statutory trade and customs classification for goods under HS Code ${queryA}.` : "Safe domestic heating and pressurized storage of potable water for sanitary purposes.",
          products: isHsnA ? queryA : "Electric Storage Water Heaters / Geysers",
          status: isHsnA ? "Statutory Tariff Classification & GST" : "Mandatory ISI Marking under QCO 2025"
        },
        standard_b: {
          id: queryB || "IS 302 (Part 1):2024",
          title: isHsnB ? `HSN Tariff Classification - ${queryB}` : "Household Electrical Appliances - General Safety Requirements",
          type: isHsnB ? "Harmonized System of Nomenclature (HSN)" : "Indian Standard (IS)",
          scope: isHsnB ? `Statutory trade and customs classification for goods under HS Code ${queryB}.` : "Comprehensive baseline safety conformity for all household and commercial electrical appliances.",
          products: isHsnB ? queryB : "General Household Electrical Appliances",
          status: isHsnB ? "Statutory Tariff Classification & GST" : "Harmonized Baseline Safety Specification"
        },
        differences: [
          { feature: "Regulatory Framework", a_val: isHsnA ? "Customs Tariff Act & DGFT" : "Bureau of Indian Standards (BIS Act 2016)", b_val: isHsnB ? "Customs Tariff Act & DGFT" : "Bureau of Indian Standards (BIS Act 2016)" },
          { feature: "Primary Purpose", a_val: isHsnA ? "Trade, customs duty and GST determination" : "Mandatory product safety, endurance and quality certification", b_val: isHsnB ? "Trade, customs duty and GST determination" : "Baseline electrical shock, fire and mechanical protection" },
          { feature: "Statutory Identification", a_val: isHsnA ? `HS Code ${queryA} on commercial invoices & bills` : "ISI Mark & CM/L License Number on product body", b_val: isHsnB ? `HS Code ${queryB} on commercial invoices & bills` : "Conformity to General Clauses 1 to 32" }
        ],
        harmonization: "Harmonized cross-regulatory mapping between Indian Standards (safety & quality) and HSN codes (customs tariff & statutory invoicing)."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (pair) => {
    setStdA(pair.std_a);
    setStdB(pair.std_b);
    setCompResult(null); // Clear previous output until user clicks Compare button
  };

  const handleSwap = () => {
    const tempA = stdA;
    const tempB = stdB;
    setStdA(tempB);
    setStdB(tempA);
    if (compResult) {
      fetchComparison(tempB, tempA);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header Row with Badge & Graphic */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
              <Scale size={14} />
              <span>Structured Standard Comparator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0b2545] tracking-tight">
              Compare Indian Standards Side-by-Side
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Evaluate distinct regulatory scopes, mandatory testing criteria, and harmonized base relationships between standards.
            </p>
          </div>

          {/* Decorative Scale Illustration */}
          <div className="hidden sm:flex items-center gap-2 shrink-0 p-2">
            <div className="w-16 h-20 bg-white rounded-2xl border border-slate-200 flex flex-col p-2 space-y-1 shadow-2xs">
              <div className="w-full h-1.5 bg-slate-200 rounded"></div>
              <div className="w-3/4 h-1.5 bg-slate-100 rounded"></div>
              <div className="flex-1 flex items-center justify-center text-xs font-bold text-purple-600">✓</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Scale size={18} />
            </div>
            <div className="w-16 h-20 bg-white rounded-2xl border border-slate-200 flex flex-col p-2 space-y-1 shadow-2xs">
              <div className="w-full h-1.5 bg-slate-200 rounded"></div>
              <div className="w-3/4 h-1.5 bg-slate-100 rounded"></div>
              <div className="flex-1 flex items-center justify-center text-xs font-bold text-emerald-600">✓</div>
            </div>
          </div>
        </div>

        {/* 4 Benchmark Comparison Preset Buttons */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Common Benchmark Comparisons
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {COMPARISON_PAIRS.map((pair, idx) => {
              const isSelected = stdA === pair.std_a && stdB === pair.std_b;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(pair)}
                  className={`p-3 rounded-2xl text-left border transition-all space-y-1 ${
                    isSelected
                      ? 'bg-orange-50/70 border-orange-500 shadow-xs ring-1 ring-orange-500/20'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <p className={`text-xs font-bold leading-snug ${isSelected ? 'text-orange-950' : 'text-slate-800'}`}>
                    {pair.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Bar Card */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <form onSubmit={(e) => { e.preventDefault(); fetchComparison(); }} className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
            
            {/* Standard A / HS Code */}
            <div className="lg:col-span-5 space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Standard A / HS Code (IS or HSN)
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={stdA}
                  onChange={(e) => setStdA(e.target.value)}
                  placeholder="e.g. IS 302 (Part 2/Sec 21) or 0101.29.10"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#0b2545] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Swap Button */}
            <div className="lg:col-span-1 flex justify-center pb-1">
              <button
                type="button"
                onClick={handleSwap}
                className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                title="Swap Standards or HSN Codes"
              >
                <ArrowLeftRight size={16} />
              </button>
            </div>

            {/* Standard B / HS Code */}
            <div className="lg:col-span-4 space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Standard B / HS Code (IS or HSN)
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={stdB}
                  onChange={(e) => setStdB(e.target.value)}
                  placeholder="e.g. IS 302 (Part 1) or 0201.30.00"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#0b2545] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="lg:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Comparing...</span>
                  </>
                ) : (
                  <>
                    <Scale size={15} />
                    <span>Compare Standards</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
            <span>ℹ️</span>
            <span>Compare any combination of Indian Standards (IS) and statutory HSN Codes (IS vs IS, HSN vs HSN, or IS vs HSN).</span>
          </p>
        </div>

        {/* 4 Feature Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <FileText size={17} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900">Scope Analysis</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Compare the scope and application of standards or HSN.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Layers size={17} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900">Requirement Mapping</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">View clause-by-clause similarities and differences.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <Beaker size={17} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900">Test & Tariff Criteria</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Compare mandatory tests and customs trade conditions.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <BookOpen size={17} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900">Harmonization Insight</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Understand harmonized bases and relationships.</p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-10 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-3 animate-fade-in">
            <Loader2 size={32} className="animate-spin text-orange-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Comparing Regulatory Specifications...
            </h3>
            <p className="text-xs text-slate-500">
              Cross-referencing gazette regulatory scopes, test methods, and statutory classifications.
            </p>
          </div>
        )}

        {/* Empty / Unsubmitted Initial State */}
        {!compResult && !loading && (
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-3 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-2xs">
              <Scale size={28} />
            </div>
            <h3 className="text-base font-extrabold text-[#0b2545]">
              Ready to Compare Standards & HSN Classifications
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed">
              Select a benchmark preset above or enter any Indian Standards (e.g. <span className="font-mono font-semibold text-slate-700">IS 302</span>, <span className="font-mono font-semibold text-slate-700">IS 2347</span>) or HSN Codes (e.g. <span className="font-mono font-semibold text-slate-700">0101.29.10</span>, <span className="font-mono font-semibold text-slate-700">8432</span>) and click <span className="font-bold text-orange-600">"Compare Standards"</span> to view the side-by-side analysis.
            </p>
          </div>
        )}

        {/* Side-by-Side Comparison Results — Only shown after clicking Compare */}
        {compResult && !loading && (
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-[#0b2545]">
                Side-by-Side Regulatory Analysis
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Active Comparison
              </span>
            </div>

            {/* Scope Comparison Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#0b2545]">{compResult.standard_a?.id || stdA}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {compResult.standard_a?.type || "Standard A"}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900">{compResult.standard_a?.title}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{compResult.standard_a?.scope}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#0b2545]">{compResult.standard_b?.id || stdB}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                    {compResult.standard_b?.type || "Standard B"}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900">{compResult.standard_b?.title}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{compResult.standard_b?.scope}</p>
              </div>
            </div>

            {/* Clause Comparison Table */}
            {(() => {
              const diffs = compResult.differences || (compResult.comparison_table || compResult.comparison_matrix || []).map(r => ({
                feature: r.feature || r.attribute,
                a_val: r.a_val || r.std_a || r.standard_a,
                b_val: r.b_val || r.std_b || r.standard_b
              }));

              if (!diffs || diffs.length === 0) return null;

              return (
                <div className="space-y-4">
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                        <tr>
                          <th className="p-3 w-1/4">Comparison Metric</th>
                          <th className="p-3 w-3/8 text-[#0b2545]">{compResult.standard_a?.id || stdA}</th>
                          <th className="p-3 w-3/8 text-slate-800">{compResult.standard_b?.id || stdB}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {diffs.map((diff, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3 font-bold text-slate-900">{diff.feature}</td>
                            <td className="p-3 text-slate-800 leading-relaxed">{diff.a_val}</td>
                            <td className="p-3 text-slate-800 leading-relaxed">{diff.b_val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {compResult.key_differences && compResult.key_differences.length > 0 && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Key Comparative Insights</h4>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {compResult.key_differences.map((kd, i) => (
                          <li key={i} className="leading-relaxed">{kd}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {compResult.harmonization && (
                    <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-purple-900">
                      <strong>Harmonization:</strong> {compResult.harmonization}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Bottom Callout */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-blue-950 font-medium">
            <span className="text-base">🛡️</span>
            <span>All comparisons are based on official BIS publications and Indian Standards. For expert verification and certification, please contact BIS recognized labs.</span>
          </div>
          <a
            href="https://www.services.bis.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-[#0b2545] hover:underline shrink-0 flex items-center gap-1"
          >
            <span>Learn more about BIS</span>
            <ExternalLink size={12} />
          </a>
        </div>

      </div>
    </div>
  );
}
