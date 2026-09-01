import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, ShieldAlert, Sparkles, ArrowRight, RefreshCw, FileCheck, Download, ChevronRight, ChevronLeft, UploadCloud, Lock } from 'lucide-react';
import { analyzeDocument } from '../services/api';

const BENCHMARK_REPORTS = [
  {
    id: "nabl-flask",
    name: "NABL_Test_Report_Stainless_Steel_Flask.pdf",
    standard_id: "IS 17803:2022",
    standard_title: "Stainless Steel Vacuum Flasks and Bottles - Specification",
    description: "NABL accredited lab report for 750ml vacuum insulated bottle (Supports Clauses 4.1, 5.2, 6.1 - Missing Clause 8.1)",
    sections: [
      {
        title: "4.1 Chemical Composition Analysis",
        items: [
          { clause: "4.1.1", parameter: "Chromium (Cr)", found: "18.35 %", requirement: "> 18.0 %", status: "PASS" },
          { clause: "4.1.2", parameter: "Nickel (Ni)", found: "8.22 %", requirement: "> 8.0 %", status: "PASS" },
          { clause: "4.1.3", parameter: "Overall Migration in 3% Acetic Acid", found: "4.2 mg/kg", requirement: "< 60 mg/kg", status: "PASS" }
        ]
      },
      {
        title: "5.2 Material Requirements",
        items: [
          { clause: "5.2.1", parameter: "Stainless Steel Grade", found: "SS 304 (IS 6911)", requirement: "As per IS 6911", status: "PASS" }
        ]
      },
      {
        title: "8.1 Safety Performance Test",
        items: [
          { clause: "8.1.1", parameter: "Vacuum Retention Test", found: "-", requirement: "Report Required", status: "MISSING" }
        ]
      }
    ],
    summary: { checked: 8, passed: 6, review: 1, missing: 1 },
    readiness: 75,
    readinessLabel: "Moderate Readiness",
    actionRequired: {
      clause: "Clause 8.1 - Missing Evidence",
      desc: "Safety performance test report is required to complete verification."
    }
  },
  {
    id: "type-kettle",
    name: "Type_Test_Report_Electric_Kettle_2200W.pdf",
    standard_id: "IS 302-2-15:2009",
    standard_title: "Safety of Household and Similar Electrical Appliances - Electric Kettles",
    description: "Electrical type test report for 1.7L cordless electric kettle (Supports Clauses 7.1, 13.2, 19.101 - Missing Clause 22.103)",
    sections: [
      {
        title: "7.1 Marking and Instructions",
        items: [
          { clause: "7.1.1", parameter: "Rated Voltage & Wattage Marking", found: "230V, 2200W marked", requirement: "Legible & durable", status: "PASS" },
          { clause: "7.1.2", parameter: "ISI Standard Mark Symbol", found: "Present with CM/L", requirement: "Mandatory under QCO", status: "PASS" }
        ]
      },
      {
        title: "13.2 Leakage Current and Electric Strength",
        items: [
          { clause: "13.2.1", parameter: "Leakage Current at Operating Temp", found: "0.22 mA", requirement: "< 0.75 mA", status: "PASS" },
          { clause: "13.2.2", parameter: "High Voltage Withstand Test", found: "1500 V / 1 min (No Flashover)", requirement: "1500 V AC", status: "PASS" }
        ]
      },
      {
        title: "22.103 Dry Boil Protection Safety Cutoff",
        items: [
          { clause: "22.103.1", parameter: "Thermal Cutout Response Time", found: "-", requirement: "Auto shutoff < 45s", status: "MISSING" }
        ]
      }
    ],
    summary: { checked: 10, passed: 8, review: 1, missing: 1 },
    readiness: 80,
    readinessLabel: "High Readiness",
    actionRequired: {
      clause: "Clause 22.103 - Missing Dry Boil Cutoff Test",
      desc: "Upload thermal limiter cutoff test certificate to complete certification."
    }
  },
  {
    id: "micro-water",
    name: "Microbiology_Test_Packaged_Water.pdf",
    standard_id: "IS 14543:2018",
    standard_title: "Packaged Drinking Water (Other than Natural Mineral Water) - Specification",
    description: "Lab test report for microbiological parameters & container test (Supports Clauses 3.2, 4.1 - Missing Clause 5.3)",
    sections: [
      {
        title: "3.2 Microbiological Requirements",
        items: [
          { clause: "3.2.1", parameter: "Total Coliforms in 250ml", found: "Absent", requirement: "Nil / Absent", status: "PASS" },
          { clause: "3.2.2", parameter: "E. Coli in 250ml", found: "Absent", requirement: "Nil / Absent", status: "PASS" },
          { clause: "3.2.3", parameter: "Yeast and Mould in 250ml", found: "Absent", requirement: "Nil / Absent", status: "PASS" }
        ]
      },
      {
        title: "4.1 Physical & Chemical Tests",
        items: [
          { clause: "4.1.1", parameter: "Total Dissolved Solids (TDS)", found: "110 mg/l", requirement: "75 to 500 mg/l", status: "PASS" }
        ]
      },
      {
        title: "5.3 Container Migration Test",
        items: [
          { clause: "5.3.1", parameter: "Food Grade PET Leaching Test", found: "-", requirement: "IS 12252 Compliance", status: "MISSING" }
        ]
      }
    ],
    summary: { checked: 9, passed: 7, review: 1, missing: 1 },
    readiness: 78,
    readinessLabel: "Moderate Readiness",
    actionRequired: {
      clause: "Clause 5.3 - Missing PET Bottle Food Grade Certificate",
      desc: "Provide IS 12252 virgin polymer certificate for packaging bottles."
    }
  }
];

export default function DocumentAnalyzerView({ onOpenEvidence, onExportPDF }) {
  const [activeReport, setActiveReport] = useState(BENCHMARK_REPORTS[0]);
  const [analyzing, setAnalyzing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(null);

  const handleSelectReport = (report) => {
    setActiveReport(report);
    setUploadedFileName(null);
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    setUploadedFileName(file.name);
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
    }, 800);
  };

  const handleAuditClick = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
    }, 600);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#fbfcfd] p-4 sm:p-6 lg:p-8 animate-fade-in font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ========================================================================= */}
        {/* 1. HERO SECTION WITH MONUMENT SILHOUETTE & TRICOLOR WAFT                 */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-xs p-6 sm:p-8">
          
          {/* Top-right Rashtrapati Bhavan / Parliament Silhouette with Indian Flag */}
          <div className="absolute right-0 top-0 bottom-0 w-80 md:w-96 pointer-events-none opacity-20 hidden md:flex items-center justify-end overflow-hidden">
            <svg viewBox="0 0 400 200" fill="none" className="w-full h-full text-slate-800">
              <path d="M50 20 C 150 10, 250 80, 400 40 L 400 50 C 250 90, 150 20, 50 30 Z" fill="#ea580c" />
              <path d="M50 30 C 150 20, 250 90, 400 50 L 400 60 C 250 100, 150 30, 50 40 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
              <path d="M50 40 C 150 30, 250 100, 400 60 L 400 70 C 250 110, 150 40, 50 50 Z" fill="#16a34a" />
              <path d="M260 200 V120 H280 V100 Q310 60 340 100 V120 H360 V200 Z" fill="currentColor" />
              <circle cx="310" cy="55" r="5" fill="#ea580c" />
              <line x1="310" y1="50" x2="310" y2="35" stroke="#ea580c" strokeWidth="2" />
              <rect x="220" y="140" width="180" height="60" rx="2" fill="currentColor" opacity="0.6" />
            </svg>
          </div>

          <div className="relative z-10 space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold tracking-wider uppercase shadow-2xs">
              <FileCheck size={14} className="text-emerald-600" />
              <span>Automated Compliance Evidence & Test Report Auditor</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-[#0b2545] tracking-tight">
              Document → Standard Clause Verification
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Upload NABL test certificates, raw material mill sheets, or inspection logs to automatically verify statutory requirements and identify missing tests.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. 1-CLICK BENCHMARK TEST REPORTS (CAROUSEL SLIDER)                       */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
            1-Click Benchmark Test Reports:
          </span>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {BENCHMARK_REPORTS.map((report) => {
              const isSelected = activeReport.id === report.id;
              return (
                <div
                  key={report.id}
                  className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between space-y-3 ${
                    isSelected ? 'border-orange-500 shadow-md ring-1 ring-orange-500' : 'border-slate-200/90 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center font-bold text-xs shrink-0">
                          PDF
                        </div>
                        <span className="text-xs font-bold text-slate-900 leading-tight line-clamp-1">
                          {report.name}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold shrink-0 border border-slate-200">
                        {report.standard_id}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {report.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectReport(report)}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                      isSelected
                        ? 'bg-[#0b2545] text-white hover:bg-[#133b68]'
                        : 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {isSelected ? '✓ Selected Benchmark' : 'Use Report'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. ACTIVE DOCUMENT AUDIT STUDIO (UPLOAD & EVIDENCE TABLE)                 */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
          
          {/* Active Header Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                <FileText size={16} />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-700">
                Active Document: <b className="text-slate-900">{uploadedFileName || activeReport.name}</b>
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <label className="cursor-pointer px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs flex-1 sm:flex-initial">
                <Upload size={14} className="text-slate-600" />
                <span>Choose Document (PDF/TXT)</span>
                <input
                  type="file"
                  accept=".txt,.pdf,.csv,.json,.docx"
                  onChange={(e) => handleFileUpload(e.target.files?.[0])}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleAuditClick}
                disabled={analyzing}
                className="px-5 py-2 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 flex-1 sm:flex-initial"
              >
                {analyzing ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                <span>{analyzing ? "Auditing..." : "Audit Document Clauses"}</span>
              </button>
            </div>
          </div>

          {/* Studio Split Grid: Left Upload Zone, Right Evidence Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Drag & Drop Upload Zone (4 Cols) */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  handleFileUpload(e.dataTransfer.files?.[0]);
                }}
                className={`p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center space-y-3 min-h-[220px] ${
                  isDragOver ? 'border-orange-500 bg-orange-50/50' : 'border-slate-300 bg-slate-50/60'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                  <UploadCloud size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Drag & drop your documents here
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    PDF, TXT, DOCX, CSV • Up to 10MB
                  </p>
                </div>
                <label className="cursor-pointer px-4 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition-colors shadow-2xs">
                  <span>Browse Files</span>
                  <input
                    type="file"
                    accept=".txt,.pdf,.csv,.json,.docx"
                    onChange={(e) => handleFileUpload(e.target.files?.[0])}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-[11px] text-slate-600">
                <Lock size={14} className="text-slate-500 shrink-0" />
                <span>Your documents are processed securely and are not shared with third parties.</span>
              </div>
            </div>

            {/* Right: Extracted Document Evidence Table (8 Cols) */}
            <div className="lg:col-span-8 rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs bg-white flex flex-col">
              
              {/* Evidence Table Header */}
              <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Extracted Document Evidence
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Standard Referenced: <b className="text-slate-900">{activeReport.standard_id}</b>
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                  AI ANALYSIS
                </span>
              </div>

              {/* Table Body */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/40 text-[11px] font-bold text-slate-500">
                      <th className="py-2.5 px-4">Clause</th>
                      <th className="py-2.5 px-4">Parameter</th>
                      <th className="py-2.5 px-4">Found Value</th>
                      <th className="py-2.5 px-4">Requirement</th>
                      <th className="py-2.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeReport.sections.map((sec, secIdx) => (
                      <React.Fragment key={secIdx}>
                        {/* Section Header Row */}
                        <tr className="bg-slate-50/60 font-bold text-slate-800 text-[11px]">
                          <td colSpan={5} className="py-2 px-4 text-[#0b2545]">
                            {sec.title}
                          </td>
                        </tr>
                        {/* Parameter Rows */}
                        {sec.items.map((row, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-4 font-semibold text-slate-600">{row.clause}</td>
                            <td className="py-2.5 px-4 font-bold text-slate-900">{row.parameter}</td>
                            <td className="py-2.5 px-4 font-mono text-slate-700">{row.found}</td>
                            <td className="py-2.5 px-4 text-slate-600">{row.requirement}</td>
                            <td className="py-2.5 px-4 text-right">
                              {row.status === 'PASS' ? (
                                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
                                  ✓ PASS
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-[11px]">
                                  ⚠️ MISSING
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* 4. BOTTOM METRICS & ACTION CARDS (3-COLUMN GRID)                          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Audit Summary */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Audit Summary
            </h4>
            <div className="grid grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-lg font-black text-slate-900 block">{activeReport.summary.checked}</span>
                <span className="text-[9px] text-slate-500 font-bold block">Clauses Checked</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-lg font-black text-emerald-700 block">{activeReport.summary.passed}</span>
                <span className="text-[9px] text-emerald-700 font-bold block">Passed</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-lg font-black text-amber-700 block">{activeReport.summary.review}</span>
                <span className="text-[9px] text-amber-700 font-bold block">Needs Review</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
                <span className="text-lg font-black text-rose-700 block">{activeReport.summary.missing}</span>
                <span className="text-[9px] text-rose-700 font-bold block">Missing Evidence</span>
              </div>
            </div>
          </div>

          {/* Card 2: Compliance Readiness */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Compliance Readiness
            </h4>
            <div className="space-y-1.5">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-600">{activeReport.readiness}%</span>
                <span className="text-xs font-bold text-slate-600">{activeReport.readinessLabel}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${activeReport.readiness}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Card 3: Action Required */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
            <h4 className="text-xs font-bold text-orange-700 uppercase tracking-wider">
              Action Required
            </h4>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-900">
                {activeReport.actionRequired.clause}
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">
                {activeReport.actionRequired.desc}
              </p>
            </div>
            <button
              type="button"
              onClick={() => alert(`Uploading evidence for ${activeReport.actionRequired.clause}...`)}
              className="w-full py-2 rounded-xl border border-orange-500 hover:bg-orange-50 text-orange-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Upload size={13} />
              <span>Upload Evidence</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
