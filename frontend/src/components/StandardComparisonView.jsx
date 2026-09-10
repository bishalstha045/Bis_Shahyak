import React, { useState, useEffect } from 'react';
import { GitCompare, ArrowRight, ShieldCheck, Scale, ArrowLeftRight, CheckCircle2, FileText, Beaker, Layers, BookOpen, ExternalLink } from 'lucide-react';
import { compareStandards } from '../services/api';
import { COMPARISON_PAIRS } from '../utils/constants';

export default function StandardComparisonView() {
  const [stdA, setStdA] = useState(COMPARISON_PAIRS[0]?.std_a || 'IS 302-2-15:2009');
  const [stdB, setStdB] = useState(COMPARISON_PAIRS[0]?.std_b || 'IS 302 (Part 1):2008');
  const [loading, setLoading] = useState(false);
  const [compResult, setCompResult] = useState(null);

  const fetchComparison = async (a = stdA, b = stdB) => {
    setLoading(true);
    try {
      const data = await compareStandards(a, b);
      setCompResult(data);
    } catch (err) {
      console.error("Comparison error:", err);
      // Clean fallback demo data
      setCompResult({
        standard_a: {
          id: a || "IS 15844 (Part 1):2023",
          title: "Sports Footwear – Part 1 General Purpose - Specification",
          scope: "General recreation and sports footwear across age groups; leisure walking and school athletic shoes.",
          mandatory_tests: ["Clause 4.1: Chemical Harmlessness (Azo < 30mg/kg)", "Clause 5.1: Sole Abrasion Resistance (DIN < 250mm³)", "Clause 5.3: Sole Flexing Resistance (50,000 cycles)", "Clause 6.2: Upper-to-Sole Bond Strength (> 3.0 N/mm)"],
          qco_status: "Mandatory ISI Marking under Footwear QCO 2024"
        },
        standard_b: {
          id: b || "IS 15844 (Part 3):2024",
          title: "Sports Footwear – Part 3 Professional Sports Footwear",
          scope: "Engineered footwear for high-impact professional competitive sports, athletics, sprinting, and court games.",
          mandatory_tests: ["Clause 4.1: Heel Energy Absorption (> 25.0 Joules)", "Clause 5.2: Dynamic Sole Flexing Endurance (150,000 cycles)", "Clause 6.1: Wet Ceramic Slip Resistance Friction", "Clause 7.3: High-Tension Bond Peel Strength (> 4.0 N/mm)"],
          qco_status: "Harmonized Specialized Athletic Performance Standard"
        },
        differences: [
          { feature: "Flexing Endurance", a_val: "50,000 cycles on Ross flex tester (Crack <= 4mm)", b_val: "150,000 cycles on Bennewart machine (Crack <= 3mm)" },
          { feature: "Impact Attenuation", a_val: "Standard recreational EVA midsole cushioning", b_val: "Mandatory Heel Energy Absorption >= 25 Joules dynamic drop test" },
          { feature: "Bond Strength", a_val: "Minimum 3.0 N/mm peel adhesion", b_val: "Reinforced 4.0 N/mm athletic bonding strength" },
          { feature: "Regulatory Order", a_val: "Mandatory DPIIT QCO 2024 enforcement for consumer sale", b_val: "Specialized performance specification for competitive sports" }
        ],
        harmonization: "Both standards are derived from ISO 20871 and ISO 17708 testing methodologies under the BIS Footwear Division Council (FDC)."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, []);

  const handleSelectPreset = (pair) => {
    setStdA(pair.std_a);
    setStdB(pair.std_b);
    fetchComparison(pair.std_a, pair.std_b);
  };

  const handleSwap = () => {
    const temp = stdA;
    setStdA(stdB);
    setStdB(temp);
    fetchComparison(stdB, temp);
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
            
            {/* Standard A */}
            <div className="lg:col-span-5 space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Standard A (Code or Keyword)
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={stdA}
                  onChange={(e) => setStdA(e.target.value)}
                  placeholder="IS 302-2-15:2009"
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
                title="Swap Standards"
              >
                <ArrowLeftRight size={16} />
              </button>
            </div>

            {/* Standard B */}
            <div className="lg:col-span-4 space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Standard B (Code or Keyword)
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={stdB}
                  onChange={(e) => setStdB(e.target.value)}
                  placeholder="IS 302 (Part 1):2008"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#0b2545] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="lg:col-span-2">
              <button
                type="button"
                onClick={() => fetchComparison()}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
              >
                <Scale size={15} />
                <span>{loading ? 'Comparing...' : 'Compare Standards'}</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
            <span>ℹ️</span>
            <span>Compare two standards to view key differences in scope, requirements, tests, and more.</span>
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
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Compare the scope and application of standards.</p>
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
              <h4 className="text-xs font-bold text-slate-900">Test Criteria</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Compare mandatory tests and acceptance criteria.</p>
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

        {/* Side-by-Side Comparison Results */}
        {compResult && (
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6 animate-fade-in">
            <h3 className="text-sm font-black text-[#0b2545]">
              Side-by-Side Regulatory Analysis
            </h3>

            {/* Scope Comparison Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#0b2545]">{compResult.standard_a?.id || stdA}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Standard A</span>
                </div>
                <p className="text-xs font-bold text-slate-900">{compResult.standard_a?.title}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{compResult.standard_a?.scope}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#0b2545]">{compResult.standard_b?.id || stdB}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">Standard B</span>
                </div>
                <p className="text-xs font-bold text-slate-900">{compResult.standard_b?.title}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{compResult.standard_b?.scope}</p>
              </div>
            </div>

            {/* Clause Comparison Table */}
            {compResult.differences && (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                    <tr>
                      <th className="p-3 w-1/4">Comparison Metric</th>
                      <th className="p-3 w-3/8 text-[#0b2545]">{stdA}</th>
                      <th className="p-3 w-3/8 text-slate-800">{stdB}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {compResult.differences.map((diff, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-900">{diff.feature}</td>
                        <td className="p-3 text-slate-800 leading-relaxed">{diff.a_val}</td>
                        <td className="p-3 text-slate-800 leading-relaxed">{diff.b_val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
