import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, FileText, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, ShieldAlert, 
  Sparkles, ArrowRight, RefreshCw, FileCheck, Download, ChevronRight, ChevronLeft, 
  UploadCloud, Lock, X, Check, HelpCircle, ExternalLink
} from 'lucide-react';
import { analyzeDocument, uploadDocumentFile } from '../services/api';

const BENCHMARK_REPORTS = [
  {
    id: "nabl-flask",
    name: "NABL_Test_Report_Stainless_Steel_Flask.pdf",
    standard_id: "IS 17803:2022",
    standard_title: "Stainless Steel Vacuum Flasks and Bottles - Specification",
    product_name: "Stainless Steel Vacuum Flasks and Bottles",
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
    id: "cooker-test",
    name: "Pressure_Cooker_5L_Hydrostatic_NABL_Report.pdf",
    standard_id: "IS 2347:2017",
    standard_title: "Domestic Pressure Cookers - Specification",
    product_name: "Domestic Pressure Cookers",
    description: "Type examination test certificate for 5-litre aluminium alloy pressure cooker (Supports Clauses 4.1, 6.1, 7.2 - Missing Clause 8.1)",
    sections: [
      {
        title: "4.1 Raw Material Chemical Composition",
        items: [
          { clause: "4.1.1", parameter: "Aluminium Purity (Wrought IS 21)", found: "99.2 %", requirement: "Min 99.0 %", status: "PASS" },
          { clause: "4.1.2", parameter: "Lead (Pb) Leaching Level", found: "< 0.005 mg/kg", requirement: "< 0.01 mg/kg", status: "PASS" }
        ]
      },
      {
        title: "6.1 Operational Pressure Regulation",
        items: [
          { clause: "6.1.1", parameter: "Nominal Operating Pressure", found: "102 kPa", requirement: "90 - 110 kPa", status: "PASS" },
          { clause: "6.1.2", parameter: "Steam Vent Weight Release", found: "Smooth Discharge", requirement: "Zero Jamming", status: "PASS" }
        ]
      },
      {
        title: "7.2 Hydrostatic Proof Pressure Test",
        items: [
          { clause: "7.2.1", parameter: "Chamber Proof Pressure", found: "2.45 MPa / 5 min", requirement: "2.45 MPa (No Deformation)", status: "PASS" }
        ]
      },
      {
        title: "8.1 Emergency Safety Relief",
        items: [
          { clause: "8.1.1", parameter: "Fusible Plug Melting Temperature", found: "-", requirement: "Melts at 125°C - 140°C", status: "MISSING" }
        ]
      }
    ],
    summary: { checked: 6, passed: 5, review: 0, missing: 1 },
    readiness: 83,
    readinessLabel: "High Readiness",
    actionRequired: {
      clause: "Clause 8.1 - Missing Fusible Plug Melting Test",
      desc: "Attach metallurgical thermal melting certificate for safety fuse alloy."
    }
  },
  {
    id: "type-kettle",
    name: "Type_Test_Report_Electric_Kettle_2200W.pdf",
    standard_id: "IS 302-2-15:2009",
    standard_title: "Safety of Household and Similar Electrical Appliances - Electric Kettles",
    product_name: "Electric Kettles & Liquid Heaters",
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
    standard_id: "IS 14543:2004",
    standard_title: "Packaged Drinking Water (Other than Natural Mineral Water) - Specification",
    product_name: "Packaged Drinking Water",
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
  },
  {
    id: "lpg-cylinder",
    name: "LPG_Cylinder_14.2kg_Hydrostatic_Stretch.pdf",
    standard_id: "IS 3196 (Part 1):2013",
    standard_title: "Welded Low Carbon Steel Cylinders for LPG - Specification",
    product_name: "Welded Low Carbon Steel Cylinders for LPG",
    description: "Batch mill test report and hydrostatic stretch testing for 14.2kg domestic LPG gas cylinder (Supports Clauses 4.1, 9.1 - Missing Clause 8.2)",
    sections: [
      {
        title: "4.1 Raw Material Grade & Tensile Test",
        items: [
          { clause: "4.1.1", parameter: "Yield Strength of Steel Plate", found: "258 MPa", requirement: "Min 240 MPa", status: "PASS" },
          { clause: "4.1.2", parameter: "Elongation at Break", found: "28 %", requirement: "Min 25 %", status: "PASS" }
        ]
      },
      {
        title: "9.1 Pneumatic Joint Sealing",
        items: [
          { clause: "9.1.1", parameter: "Submerged Joint Leakage Test", found: "Zero Bubbles (1.2 MPa)", requirement: "Air tightness at 1.2 MPa", status: "PASS" }
        ]
      },
      {
        title: "8.2 Hydrostatic Volumetric Expansion",
        items: [
          { clause: "8.2.1", parameter: "Volumetric Water Jacket Stretch", found: "-", requirement: "Permanent expansion < 10%", status: "MISSING" }
        ]
      }
    ],
    summary: { checked: 6, passed: 4, review: 1, missing: 1 },
    readiness: 67,
    readinessLabel: "Moderate Readiness",
    actionRequired: {
      clause: "Clause 8.2 - Missing Volumetric Water Jacket Expansion Test",
      desc: "Provide NABL test record of hydrostatic permanent stretch percentage."
    }
  },
  {
    id: "toy-safety",
    name: "Toy_Mechanical_Physical_Safety_Test.pdf",
    standard_id: "IS 9873 (Part 1):2019",
    standard_title: "Safety of Toys - Mechanical and Physical Properties",
    product_name: "Children's Toys",
    description: "Mechanical safety dossier for children's plastic construction building set (Supports Clauses 4.4, 4.7 - Missing Clause 7.1)",
    sections: [
      {
        title: "4.4 Choking Hazard & Small Parts",
        items: [
          { clause: "4.4.1", parameter: "Small Parts Truncated Cylinder Test", found: "No parts fit cylinder", requirement: "No small parts for < 36 months", status: "PASS" }
        ]
      },
      {
        title: "4.7 Accessible Sharp Edges & Points",
        items: [
          { clause: "4.7.1", parameter: "Tactile Sharp Edge Gauge Test", found: "Smooth Radii (> 0.5mm)", requirement: "Zero sharp edges", status: "PASS" }
        ]
      },
      {
        title: "7.1 Statutory Warning & Age Label",
        items: [
          { clause: "7.1.1", parameter: "Age Suitability Stamping & ISI Mark", found: "-", requirement: "Mandatory indelibly marked warning", status: "MISSING" }
        ]
      }
    ],
    summary: { checked: 5, passed: 4, review: 0, missing: 1 },
    readiness: 80,
    readinessLabel: "High Readiness",
    actionRequired: {
      clause: "Clause 7.1 - Missing Packaging Age Grading Artwork",
      desc: "Provide packaging layout displaying statutory age warning symbol and ISI Mark."
    }
  }
];

export default function DocumentAnalyzerView({ onOpenEvidence, onExportPDF, onNavigate, auth, onOpenAuthModal }) {
  const [activeReport, setActiveReport] = useState(BENCHMARK_REPORTS[0]);
  const [analyzing, setAnalyzing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [relevanceModal, setRelevanceModal] = useState(null);
  const fileInputRef = useRef(null);

  const handleSelectReport = (report) => {
    setActiveReport(report);
    setUploadedFileName(null);
    setRelevanceModal(null);
  };

  const handleStandardChange = (selectedId) => {
    const bench = BENCHMARK_REPORTS.find(
      b => b.standard_id === selectedId || b.standard_id.split(':')[0].trim() === selectedId.split(':')[0].trim()
    );
    if (bench) {
      setActiveReport(bench);
      setUploadedFileName(null);
      setRelevanceModal(null);
    } else {
      setActiveReport(prev => ({
        ...prev,
        standard_id: selectedId,
        standard_title: "Indian Standard Conformance",
        product_name: "Applicable Product Range"
      }));
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!auth?.user) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    setUploadedFileName(file.name);
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (activeReport?.standard_id) {
        formData.append('standard_id', activeReport.standard_id);
      }
      const data = await uploadDocumentFile(formData);
      
      if (data) {
        // Trigger the popup modal if document is unrelated or cross-product mismatched
        if (data.is_relevant === false || data.product_mismatch || data.relevance_warning) {
          setRelevanceModal({
            isOpen: true,
            isMismatch: !!data.product_mismatch,
            title: data.product_mismatch ? "Product Mismatch Alert" : "Non-Compliant / Unrelated Document Detected",
            warning: data.relevance_warning || "The uploaded file does not contain recognized BIS/ISI laboratory test parameters for your product.",
            fileName: file.name,
            targetStandard: data.standard_id || activeReport?.standard_id || "IS 17803:2022",
            targetProduct: data.target_product || activeReport?.product_name || activeReport?.standard_title || "Selected Product",
            detectedStandard: data.detected_standard,
            detectedProduct: data.detected_product || "Generic Non-BIS Document",
            potentialIssues: data.potential_issues || []
          });
        }

        if (data.sections || data.summary) {
          const isDocRelevant = data.is_relevant !== false;
          setActiveReport({
            id: `uploaded-${Date.now()}`,
            name: data.file_name || file.name,
            standard_id: data.standard_id || activeReport?.standard_id || "IS Standard",
            standard_title: data.standard_title || activeReport?.standard_title || "Official BIS Conformance Standard",
            product_name: data.target_product || activeReport?.product_name || "Specified Product",
            is_relevant: isDocRelevant,
            product_mismatch: data.product_mismatch,
            relevance_warning: data.relevance_warning,
            description: !isDocRelevant 
              ? (data.product_mismatch 
                  ? `Product Mismatch: Document corresponds to ${data.detected_product || 'another product'} instead of ${data.target_product || activeReport?.standard_id}`
                  : "Verification Failed: Document lacks recognized statutory testing evidence")
              : `Laboratory Test Report audited against ${data.standard_id || activeReport?.standard_id}`,
            sections: data.sections || [],
            summary: data.summary || { checked: 5, passed: isDocRelevant ? 4 : 0, review: 0, missing: isDocRelevant ? 1 : 5 },
            readiness: data.readiness ?? (isDocRelevant ? 80 : 0),
            readinessLabel: !isDocRelevant 
              ? "Non-Conforming (0%)" 
              : ((data.readiness >= 80) ? "High Readiness" : ((data.readiness >= 50) ? "Moderate Readiness" : "Action Required")),
            actionRequired: data.action_required ? {
              clause: data.action_required.clause || "Statutory Requirement",
              desc: data.action_required.desc || "Review pending lab tests before submission."
            } : {
              clause: "Documentation Review",
              desc: "Ensure all parameters have NABL certified reports."
            }
          });
        }
      }
    } catch (err) {
      console.warn('Document upload notice:', err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAuditClick = async () => {
    setAnalyzing(true);
    try {
      const data = await analyzeDocument({
        file_name: uploadedFileName || activeReport.name,
        content_text: activeReport.description + " " + (activeReport.sections ? activeReport.sections.flatMap(s => s.items.map(i => `${i.parameter}: ${i.found}`)).join(" ") : ""),
        standard_id: activeReport.standard_id
      });
      if (data) {
        if (data.is_relevant === false || data.product_mismatch || data.relevance_warning) {
          setRelevanceModal({
            isOpen: true,
            isMismatch: !!data.product_mismatch,
            title: data.product_mismatch ? "Product Mismatch Alert" : "Non-Compliant / Unrelated Document Detected",
            warning: data.relevance_warning || "The document is not related to the statutory BIS/ISI specifications or your selected product.",
            fileName: uploadedFileName || activeReport.name,
            targetStandard: activeReport.standard_id,
            targetProduct: data.target_product || activeReport.product_name || activeReport.standard_title,
            detectedStandard: data.detected_standard,
            detectedProduct: data.detected_product || "Non-BIS Document",
            potentialIssues: data.potential_issues || []
          });
        }

        if (data.sections || data.summary) {
          const isDocRelevant = data.is_relevant !== false;
          setActiveReport(prev => ({
            ...prev,
            is_relevant: isDocRelevant,
            product_mismatch: data.product_mismatch,
            relevance_warning: data.relevance_warning,
            sections: data.sections || prev.sections,
            summary: data.summary || prev.summary,
            readiness: data.readiness ?? prev.readiness,
            readinessLabel: !isDocRelevant ? "Non-Conforming (0%)" : (((data.readiness ?? prev.readiness) >= 80) ? "High Readiness" : (((data.readiness ?? prev.readiness) >= 50) ? "Moderate Readiness" : "Action Required")),
            actionRequired: data.action_required || prev.actionRequired
          }));
        }
      }
    } catch (err) {
      console.warn("Audit document call note:", err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#fbfcfd] p-4 sm:p-6 lg:p-8 animate-fade-in font-sans relative">
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
              Upload NABL test certificates, raw material mill sheets, or inspection logs to automatically verify statutory requirements and identify missing tests matching your specific product.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. 1-CLICK BENCHMARK TEST REPORTS                                         */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              1-Click Benchmark Test Reports (Select Your Product Domain):
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {BENCHMARK_REPORTS.length} Verified Standards
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {BENCHMARK_REPORTS.map((report) => {
              const isSelected = activeReport.standard_id === report.standard_id && !uploadedFileName;
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
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold shrink-0 border border-slate-200 font-mono">
                        {report.standard_id}
                      </span>
                    </div>

                    <div className="text-[11px] font-bold text-[#0b2545] line-clamp-1">
                      {report.product_name}
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {report.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectReport(report)}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
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
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <FileText size={16} />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-700">
                  Active Document: <b className="text-slate-900">{uploadedFileName || activeReport.name}</b>
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Target Indian Standard:</span>
                <select
                  value={activeReport.standard_id}
                  onChange={(e) => handleStandardChange(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 outline-none focus:border-blue-600 focus:bg-white shadow-2xs"
                >
                  <option value="IS 17803:2022">IS 17803:2022 — Stainless Steel Vacuum Flasks & Bottles</option>
                  <option value="IS 2347:2017">IS 2347:2017 — Domestic Pressure Cookers</option>
                  <option value="IS 302-2-15:2009">IS 302-2-15:2009 — Electric Kettles & Liquid Heaters</option>
                  <option value="IS 14543:2004">IS 14543:2004 — Packaged Drinking Water</option>
                  <option value="IS 3196 (Part 1):2013">IS 3196 (Part 1):2013 — Welded Steel Cylinders for LPG</option>
                  <option value="IS 9873 (Part 1):2019">IS 9873 (Part 1):2019 — Safety of Children's Toys</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full lg:w-auto">
              <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs flex-1 lg:flex-initial">
                <Upload size={14} className="text-slate-600" />
                <span>Choose Document (PDF/TXT)</span>
                <input
                  ref={fileInputRef}
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
                className="px-5 py-2.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 flex-1 sm:flex-initial cursor-pointer"
              >
                {analyzing ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                <span>{analyzing ? "Auditing..." : "Audit Document Clauses"}</span>
              </button>
            </div>
          </div>

          {/* Persistent In-Page Warning Banner if document is unrelated or mismatched */}
          {activeReport.is_relevant === false && (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-900 flex items-start justify-between gap-3 shadow-2xs animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 border border-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle size={18} />
                </div>
                <div className="space-y-1 text-xs">
                  <div className="font-black text-amber-950 flex items-center gap-2">
                    <span>Document Not Compliant With Product Standard ({activeReport.standard_id})</span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold">
                      NON-CONFORMING
                    </span>
                  </div>
                  <p className="text-amber-800 leading-relaxed font-normal">
                    {activeReport.relevance_warning || "The uploaded file does not contain valid statutory BIS/ISI laboratory test parameters for your product. To maintain certification integrity, the Document section requires authentic test evidence."}
                  </p>
                  <div className="pt-1 flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-700 text-white text-[11px] font-bold hover:bg-amber-800 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Upload size={12} />
                      <span>Upload Valid Lab Report</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const bench = BENCHMARK_REPORTS.find(b => b.standard_id === activeReport.standard_id) || BENCHMARK_REPORTS[0];
                        handleSelectReport(bench);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 text-[11px] font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      <span>Load Authentic Benchmark Report</span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRelevanceModal(null)}
                className="text-amber-500 hover:text-amber-700 p-1"
                title="Hide notice"
              >
                <X size={16} />
              </button>
            </div>
          )}

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
                    Drag & drop your product report
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    NABL Lab Test Report, Mill Certificate, PDF/TXT
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
                <span>Uploaded evidence is evaluated under BIS (Conformity Assessment) Regulations.</span>
              </div>
            </div>

            {/* Right: Extracted Document Evidence Table (8 Cols) */}
            <div className="lg:col-span-8 rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs bg-white flex flex-col">
              
              {/* Evidence Table Header */}
              <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Extracted Statutory Clause Evidence
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Evaluated Against: <b className="text-slate-900">{activeReport.standard_id}</b> ({activeReport.product_name || activeReport.standard_title})
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
                  activeReport.is_relevant === false 
                    ? 'bg-rose-50 text-rose-700 border-rose-200' 
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {activeReport.is_relevant === false ? "VERIFICATION FAILED" : "AI AUDITED"}
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
                    {activeReport.sections && activeReport.sections.length > 0 ? (
                      activeReport.sections.map((sec, secIdx) => (
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                          No clause data available. Upload a certified laboratory report or select a benchmark standard.
                        </td>
                      </tr>
                    )}
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
                <span className="text-lg font-black text-slate-900 block">{activeReport.summary?.checked ?? 0}</span>
                <span className="text-[9px] text-slate-500 font-bold block">Clauses Checked</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-lg font-black text-emerald-700 block">{activeReport.summary?.passed ?? 0}</span>
                <span className="text-[9px] text-emerald-700 font-bold block">Passed</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-lg font-black text-amber-700 block">{activeReport.summary?.review ?? 0}</span>
                <span className="text-[9px] text-amber-700 font-bold block">Needs Review</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-center">
                <span className="text-lg font-black text-rose-700 block">{activeReport.summary?.missing ?? 0}</span>
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
                <span className={`text-3xl font-black ${
                  activeReport.readiness >= 80 ? 'text-emerald-600' : (activeReport.readiness >= 50 ? 'text-amber-600' : 'text-rose-600')
                }`}>
                  {activeReport.readiness}%
                </span>
                <span className="text-xs font-bold text-slate-600">{activeReport.readinessLabel}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    activeReport.readiness >= 80 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                      : (activeReport.readiness >= 50 ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-rose-500')
                  }`}
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
                {activeReport.actionRequired?.clause || "Documentation Review"}
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">
                {activeReport.actionRequired?.desc || "Ensure all technical testing parameters match your product standard."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="flex-1 py-2.5 rounded-xl border border-orange-500 hover:bg-orange-50 text-orange-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Upload size={13} />
                <span>Upload Evidence PDF</span>
              </button>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('verification')}
                  className="py-2.5 px-3 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                  title="Submit this report in verification dossier"
                >
                  <ShieldCheck size={13} className="text-amber-400" />
                  <span>Verify</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. POP-UP MODAL ("POPO"): UNRELATED DOCUMENT & PRODUCT MISMATCH WARNING    */}
      {/* ========================================================================= */}
      {relevanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-7 space-y-5 relative overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Top Tricolor Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-white to-emerald-500" />

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pt-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0 shadow-sm">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                    <span>DOCUMENT SECTION ALIGNMENT NOTICE</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1 leading-snug">
                    {relevanceModal.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRelevanceModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Main Warning Callout */}
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 text-xs leading-relaxed space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldAlert size={15} className="text-amber-700" />
                <span>Document Compatibility Notice:</span>
              </div>
              <p className="text-amber-900 font-medium">
                {relevanceModal.warning}
              </p>
            </div>

            {/* Side-by-Side Product Alignment Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Active Selected Product:
                </span>
                <div className="font-bold text-[#0b2545] line-clamp-2">
                  {relevanceModal.targetProduct}
                </div>
                <div className="font-mono text-[11px] text-slate-600 font-bold">
                  {relevanceModal.targetStandard}
                </div>
              </div>

              <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Uploaded File & Detected Content:
                </span>
                <div className="font-bold text-rose-700 line-clamp-1">
                  {relevanceModal.fileName}
                </div>
                <div className="font-medium text-slate-700 text-[11px]">
                  Detected Scope: <b className="text-slate-900">{relevanceModal.detectedProduct}</b>
                </div>
              </div>
            </div>

            {/* Guidance Note */}
            <div className="text-[11px] text-slate-600 leading-relaxed space-y-1">
              <p className="font-semibold text-slate-800">
                How the BIS Sahayak Document Section works:
              </p>
              <p>
                To complete your BIS ISI certification readiness assessment, uploaded files must be authentic laboratory test certificates (NABL ISO/IEC 17025 accredited) or raw material mill test sheets specifically for your chosen product. Generic, non-technical, or unrelated documents cannot be audited.
              </p>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-100">
              
              {/* If a recognized standard was detected from the document that differs from target */}
              {relevanceModal.detectedStandard && relevanceModal.detectedStandard !== relevanceModal.targetStandard && (
                <button
                  type="button"
                  onClick={() => {
                    handleStandardChange(relevanceModal.detectedStandard);
                    setRelevanceModal(null);
                  }}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Switch to {relevanceModal.detectedStandard}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setRelevanceModal(null);
                  fileInputRef.current?.click();
                }}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Upload size={13} />
                <span>Upload Valid Lab Report</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const bench = BENCHMARK_REPORTS.find(b => b.standard_id === relevanceModal.targetStandard) || BENCHMARK_REPORTS[0];
                  handleSelectReport(bench);
                  setRelevanceModal(null);
                }}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <span>Use Sample Report</span>
              </button>

              <button
                type="button"
                onClick={() => setRelevanceModal(null)}
                className="w-full sm:w-auto py-2.5 px-3 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
              >
                <span>Dismiss</span>
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
