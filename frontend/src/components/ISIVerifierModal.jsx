import React, { useState } from 'react';
import { X, Search, BadgeCheck, ShieldAlert, CheckCircle2, Shield, ExternalLink, HelpCircle } from 'lucide-react';
import { verifyISILicense } from '../services/api';

export default function ISIVerifierModal({ isOpen, onClose, isStandalone = false }) {
  const [cmlNumber, setCmlNumber] = useState('CM/L-7128394');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const sampleLicences = [
    { label: "Bajaj Electricals (IS 302-2-15)", code: "CM/L-7128394" },
    { label: "Bharat Petroleum LPG (IS 3196)", code: "CM/L-8291042" },
    { label: "Bisleri Packaged Water (IS 14543)", code: "CM/L-9043211" },
    { label: "Funskool Toys (IS 9873)", code: "CM/L-6321908" },
    { label: "Tata Solar PV (IS 14286)", code: "CM/L-5519203" }
  ];

  const handleVerify = async (targetCode = cmlNumber) => {
    if (!targetCode.trim()) return;
    setLoading(true);
    try {
      const data = await verifyISILicense(targetCode.trim());
      setResult(data);
    } catch (err) {
      setResult({
        is_valid: false,
        status: "Error",
        message: "Unable to verify licence number against BIS registry records."
      });
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="space-y-6 text-xs animate-fade-in">
      
      {/* Search Input */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
        <label className="block font-bold text-slate-700 dark:text-slate-300">
          Enter 7-Digit CM/L Licence Number:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={cmlNumber}
            onChange={(e) => setCmlNumber(e.target.value)}
            placeholder="e.g. CM/L-7128394"
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold outline-none focus:border-orange-500"
          />
          <button
            type="button"
            onClick={() => handleVerify()}
            disabled={loading || !cmlNumber.trim()}
            className="px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50 shrink-0"
          >
            {loading ? "Verifying..." : "Verify Licence"}
          </button>
        </div>

        {/* Sample Quick-Picks */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Quick Samples:</span>
          {sampleLicences.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCmlNumber(sample.code);
                handleVerify(sample.code);
              }}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-orange-950 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Result Card */}
      {result && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              {result.is_valid ? (
                <BadgeCheck size={22} className="text-emerald-500" />
              ) : (
                <ShieldAlert size={22} className="text-amber-500" />
              )}
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {result.is_valid ? "Licence Information Found in Official Records" : "Licence Record Not Found"}
              </h4>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
              result.is_valid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700'
            }`}>
              {result.status}
            </span>
          </div>

          {result.is_valid ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Manufacturer / Organization</span>
                <p className="font-extrabold text-slate-900 dark:text-white mt-0.5 text-sm">{result.manufacturer_name}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Applicable Indian Standard</span>
                <p className="font-extrabold text-orange-600 dark:text-orange-400 mt-0.5 text-sm">{result.standard_id}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Product Category</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{result.product_category}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Licence Validity</span>
                <p className="font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">Valid up to {result.valid_up_to}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {result.message || "No matching active manufacturer licence found for this CM/L number. Please verify the 7-digit code printed under the ISI logo."}
            </p>
          )}

          {/* Authenticity Disclaimer */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 leading-relaxed">
            <b>Important Regulatory Disclaimer:</b> BIS Sahayak validates licence status against verified BIS gazette registry entries. This confirms regulatory registration and does not solely certify physical goods authenticity.
          </div>
        </div>
      )}
    </div>
  );

  if (isStandalone) {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-10 max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-extrabold tracking-wide border border-teal-200">
            <BadgeCheck size={14} />
            <span>Official ISI Mark & Licence Verification Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Verify BIS Certification Licence
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Authenticate 7-digit CM/L licence numbers and verify manufacturer registration details against official Bureau of Indian Standards records.
          </p>
        </div>
        {content}
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <BadgeCheck size={20} className="text-orange-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Verify BIS ISI Licence Number</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {content}
        </div>
      </div>
    </div>
  );
}
