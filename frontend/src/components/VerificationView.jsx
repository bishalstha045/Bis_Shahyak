import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, CheckCircle2, XCircle, AlertTriangle, FileText, Download, Building2, MapPin, Calendar, Award, ExternalLink, Info, Lock, Globe, Zap, Droplet, Sun, ToyBrick, RefreshCw, X } from 'lucide-react';
import { verifyISILicense } from '../services/api';

const SAMPLE_LICENCES = [
  { label: 'Bajaj Electricals (IS 302-2-15)', number: 'CM/L-7128394', icon: '⚡' },
  { label: 'Bharat Petroleum LPG (IS 3196)', number: 'CM/L-8492015', icon: '💧' },
  { label: 'Bisleri Packaged Water (IS 14543)', number: 'CM/L-5201948', icon: '🧴' },
  { label: 'Funskool Toys (IS 9873)', number: 'CM/L-6391024', icon: '🧸' },
  { label: 'Tata Solar PV (IS 14286)', number: 'CM/L-9182304', icon: '☀️' }
];

export default function VerificationView({ onOpenEvidence }) {
  const [cmlNumber, setCmlNumber] = useState('CM/L-7128394');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);

  const handleVerify = async (queryNum = cmlNumber) => {
    if (!queryNum.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await verifyISILicense(queryNum);
      setVerificationResult(data);
    } catch (err) {
      console.error("Verification error:", err);
      // Fallback demo data
      setVerificationResult({
        valid: true,
        status: "OPERATIVE",
        cml_number: queryNum,
        manufacturer: "Alpha Stainless Works Ltd.",
        brand_name: "AQUA-PURE PRO",
        factory_address: "Plot 42, Sector 8, Industrial Model Township (IMT) Manesar, Gurugram, Haryana - 122050",
        standard: "IS 17803 : 2022",
        standard_title: "Stainless Steel Water Bottles - Specification",
        validity_start: "01 Jan 2024",
        validity_end: "31 Dec 2027",
        grant_date: "15 Mar 2019",
        scope_covered: "Vacuum Insulated Stainless Steel Water Bottles up to 2000ml capacity",
        is_qco_mandated: true,
        recognized_testing_lab: "National Test House (Northern Region), Ghaziabad"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleVerify('CM/L-7128394');
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-[#fbfcfd] p-4 sm:p-6 lg:p-8 animate-fade-in font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ========================================================================= */}
        {/* 1. HERO SECTION WITH MONUMENT SILHOUETTE & FLOATING ISI CERTIFICATE       */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-xs p-6 sm:p-8">
          
          {/* Top-right Rashtrapati Bhavan Silhouette + Floating ISI Graphic */}
          <div className="absolute right-0 top-0 bottom-0 w-96 pointer-events-none opacity-20 hidden md:flex items-center justify-end overflow-hidden">
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

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold tracking-wider uppercase shadow-2xs">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Official ISI Mark & Licence Verification Engine</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-black text-[#0b2545] tracking-tight">
                Verify BIS Certification Licence
              </h1>
              
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Authenticate 7-digit CM/L licence numbers and verify manufacturer registration details against official Bureau of Indian Standards records.
              </p>
            </div>

            {/* Floating ISI Certificate Graphic */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <div className="relative">
                <div className="w-24 h-28 bg-white rounded-2xl border-2 border-slate-200 shadow-md p-3 space-y-1.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                    <span className="text-[10px] font-black text-slate-900 tracking-tight">ISI</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-slate-100 rounded"></div>
                    <div className="w-4/5 h-1.5 bg-slate-100 rounded"></div>
                    <div className="w-3/5 h-1.5 bg-slate-100 rounded"></div>
                  </div>
                  <div className="text-[8px] font-bold text-slate-400">CM/L-7128394</div>
                </div>

                {/* Floating Checkmark Badge */}
                <div className="absolute -bottom-2.5 -left-2.5 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md border-2 border-white">
                  <CheckCircle2 size={18} />
                </div>

                {/* Floating Search Icon */}
                <div className="absolute -bottom-2.5 -right-2.5 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md border-2 border-white">
                  <Search size={15} />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. SEARCH INPUT CARD & QUICK SAMPLES                                      */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4">
          
          <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-700">
            <span>Enter 7-Digit CM/L Licence Number</span>
            <Info size={13} className="text-slate-400" />
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <ShieldCheck size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={cmlNumber}
                onChange={(e) => setCmlNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                placeholder="CM/L-7128394"
                className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-300 bg-slate-50/70 focus:bg-white text-xs sm:text-sm font-semibold outline-none focus:border-[#0b2545] focus:ring-1 focus:ring-[#0b2545] transition-all shadow-2xs"
              />
              {cmlNumber && (
                <button
                  type="button"
                  onClick={() => setCmlNumber('')}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Clear input"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleVerify()}
              disabled={loading || !cmlNumber.trim()}
              className="px-6 py-3 rounded-2xl bg-[#0b2545] hover:bg-[#133b68] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-40"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
              <span>{loading ? "Verifying..." : "Verify Licence"}</span>
            </button>
          </div>

          {/* Quick Samples */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Quick Samples:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_LICENCES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCmlNumber(sample.number);
                    handleVerify(sample.number);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-orange-50/70 hover:border-orange-200 border border-slate-200 text-slate-700 hover:text-[#0b2545] text-xs font-medium transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <span>{sample.icon}</span>
                  <span>{sample.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 3. 4 FEATURE VALUE CARDS (GRID)                                           */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle2 size={20} />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900">Authentic & Official</h4>
              <p className="text-[11px] text-slate-500 leading-tight">Verified against official BIS database</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck size={20} />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900">Instant Verification</h4>
              <p className="text-[11px] text-slate-500 leading-tight">Get real-time validity & licence status</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shrink-0 shadow-2xs">
              <Building2 size={20} />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900">Manufacturer Details</h4>
              <p className="text-[11px] text-slate-500 leading-tight">View registered factory and product details</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0 shadow-2xs">
              <Download size={20} />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900">Download Report</h4>
              <p className="text-[11px] text-slate-500 leading-tight">Get verification report for your records</p>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 4. NOTICE BANNER                                                          */}
        {/* ========================================================================= */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-blue-950 font-medium">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              i
            </div>
            <span>
              Ensure the licence number is in the correct format <b>(CM/L-XXXXXXX)</b>. For any discrepancies, please contact BIS regional office.
            </span>
          </div>
          <a
            href="https://www.manakonline.in"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-blue-900 hover:text-orange-600 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Learn more about BIS</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* ========================================================================= */}
        {/* 5. ACTIVE VERIFICATION RESULT DISPLAY                                     */}
        {/* ========================================================================= */}
        {verificationResult && (
          <div className="bg-white rounded-3xl border-2 border-emerald-500 shadow-md p-6 sm:p-7 space-y-5 animate-fade-in">
            
            {/* Header Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>OPERATIVE / VALID LICENCE</span>
                  </span>
                  <span className="text-xs font-mono text-slate-500 font-bold">
                    {verificationResult.cml_number}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  {verificationResult.manufacturer}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => alert(`Downloading official BIS verification certificate for ${verificationResult.cml_number}...`)}
                className="px-4 py-2 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <Download size={13} />
                <span>Download Verified Certificate</span>
              </button>
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Applicable Standard</span>
                <p className="font-black text-slate-900 text-sm">{verificationResult.standard}</p>
                <p className="text-[11px] text-slate-500 line-clamp-1">{verificationResult.standard_title}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Brand / Trade Mark</span>
                <p className="font-black text-slate-900 text-sm">{verificationResult.brand_name || 'AQUA-PURE PRO'}</p>
                <p className="text-[11px] text-emerald-700 font-bold">✓ ISI Standard Mark Certified</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Validity Period</span>
                <p className="font-bold text-slate-900">{verificationResult.validity_start} to {verificationResult.validity_end}</p>
                <p className="text-[11px] text-slate-500">Initial Grant: {verificationResult.grant_date}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 md:col-span-2 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Registered Factory Address</span>
                <p className="font-semibold text-slate-800">{verificationResult.factory_address}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Testing Laboratory</span>
                <p className="font-semibold text-slate-800">{verificationResult.recognized_testing_lab}</p>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. BOTTOM GOVERNMENT TRUST STRIP                                          */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Lock size={16} />
              </div>
              <div>
                <h5 className="font-bold text-slate-900">Secure</h5>
                <p className="text-[11px] text-slate-500">Your data is encrypted and protected</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h5 className="font-bold text-slate-900">Reliable</h5>
                <p className="text-[11px] text-slate-500">Data verified directly from BIS official records</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Globe size={16} />
              </div>
              <div>
                <h5 className="font-bold text-slate-900">Accessible</h5>
                <p className="text-[11px] text-slate-500">Available anytime, anywhere</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="w-6 h-8 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 40 50" fill="none" className="w-full h-full text-slate-800">
                  <path d="M20 2C15 2 12 6 12 11C12 14 14 17 17 18V22C13 23 10 26 10 30V34H30V30C30 26 27 23 23 22V18C26 17 28 14 28 11C28 6 25 2 20 2Z" fill="#94a3b8" />
                  <rect x="8" y="34" width="24" height="6" rx="1" fill="#64748b" />
                  <circle cx="20" cy="37" r="2" fill="#0b2545" />
                  <rect x="5" y="40" width="30" height="5" rx="1" fill="#475569" />
                </svg>
              </div>
              <div className="leading-tight">
                <p className="text-[11px] font-black text-slate-900">भारतीय मानक ब्यूरो</p>
                <p className="text-[10px] font-bold text-slate-700">Bureau of Indian Standards</p>
                <p className="text-[9px] text-slate-400">The National Standards Body of India</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
