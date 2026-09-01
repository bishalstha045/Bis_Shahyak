import React, { useState } from 'react';
import { X, Download, FileCheck, CheckSquare, Square, Building2, User, HelpCircle, Loader2 } from 'lucide-react';
import { downloadChecklistPDF } from '../services/api';

export default function ComplianceChecklist({ isOpen, onClose, contextData }) {
  const [productDesc, setProductDesc] = useState(contextData?.product || "Electric Kettles & Heating Appliances");
  const [companyName, setCompanyName] = useState("Alpha Appliances Pvt Ltd (MSME)");
  const [isExporting, setIsExporting] = useState(false);
  
  const [checklistItems, setChecklistItems] = useState([
    { id: 1, text: "Verify product classification and applicable IS standard code (e.g. IS 302-2-15)", checked: true },
    { id: 2, text: "Confirm compliance with mandatory Quality Control Order (QCO) gazette notification", checked: true },
    { id: 3, text: "Establish in-house testing laboratory according to Scheme of Testing & Inspection (STI)", checked: false },
    { id: 4, text: "Calibrate test gauges, high-voltage test bench, and leakage current testers", checked: false },
    { id: 5, text: "Submit Form V digital application on BIS Manakonline portal", checked: false },
    { id: 6, text: "Complete type testing at NABL / BIS recognized third-party laboratory", checked: false },
    { id: 7, text: "Host on-site factory audit by BIS Bureau assessment officer", checked: false },
    { id: 8, text: "Obtain Grant of License (CML Number) and implement ISI marking on product labels", checked: false }
  ]);

  if (!isOpen) return null;

  const toggleCheck = (id) => {
    setChecklistItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      const standardsList = (contextData?.citations && contextData.citations.length > 0)
        ? contextData.citations.map(c => c.standard_id)
        : ["IS 302-2-15", "IS 302 (Part 1)"];

      await downloadChecklistPDF({
        product_description: productDesc,
        standards: standardsList,
        company_name: companyName,
        language: "en"
      });
    } catch (err) {
      console.error("PDF Export error:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <FileCheck size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
                BIS Compliance Checklist & Audit Readiness
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Interactive compliance checklist with official PDF export
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Target Product / Standard Scope
              </label>
              <input
                type="text"
                value={productDesc}
                onChange={(e) => setProductDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100 outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Applicant / Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100 outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Mandatory Conformity Steps (Scheme-I ISI Mark)
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                {checklistItems.filter(i => i.checked).length} of {checklistItems.length} Completed
              </span>
            </div>

            <div className="space-y-2">
              {checklistItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    item.checked
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="mt-0.5 text-emerald-600 dark:text-emerald-400">
                    {item.checked ? <CheckSquare size={16} /> : <Square size={16} className="text-gray-400" />}
                  </div>
                  <span className={`text-xs leading-relaxed ${item.checked ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Form V ready format under BIS Act 2016
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              <span>Download PDF Checklist</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
