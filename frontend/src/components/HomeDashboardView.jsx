import React, { useState } from 'react';
import { Search, Mic, Sparkles, BookOpen, ShieldCheck, FileText, Scale, BadgeCheck, Eye, ChevronRight, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Upload } from 'lucide-react';

export default function HomeDashboardView({
  onNavigate,
  onStartSearch,
  onOpenEvidence,
  onCheckComplianceForStandard,
  onAskAIAboutStandard,
  onAskAI
}) {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setQuery(text);
      if (onAskAI) onAskAI(text);
      else if (onStartSearch) onStartSearch(text);
    };

    recognition.start();
  };

  const handleRunSearch = () => {
    const q = query.trim() || "I manufacture stainless steel water bottles for children";
    if (onAskAI) {
      onAskAI(q);
    } else if (onStartSearch) {
      onStartSearch(q);
    }
  };

  const topStandards = [
    {
      id: 'IS 17803 : 2022',
      title: 'Stainless Steel Water Bottles - Specification',
      relevance: 'High',
      relevanceClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      status: 'Current'
    },
    {
      id: 'IS 302-1 : 2008',
      title: 'Stainless Steel Vacuum Flasks - Specification',
      relevance: 'Medium',
      relevanceClass: 'bg-amber-50 text-amber-700 border-amber-200',
      status: 'Current'
    },
    {
      id: 'IS 10171 : 2019',
      title: 'Drinking Water, Specification (Second Revision)',
      relevance: 'Low',
      relevanceClass: 'bg-blue-50 text-blue-700 border-blue-200',
      status: 'Current'
    }
  ];

  const announcements = [
    {
      tag: 'NEW',
      tagColor: 'bg-rose-100 text-rose-700 border-rose-200',
      title: 'Amendment in IS 17803:2022',
      date: 'Amendment No. 1 • 21 Apr 2025'
    },
    {
      tag: 'GAZETTE',
      tagColor: 'bg-blue-100 text-blue-700 border-blue-200',
      title: 'Gazette Notification',
      date: 'Mandatory Compliance • 10 Apr 2025'
    },
    {
      tag: 'TRAINING',
      tagColor: 'bg-teal-100 text-teal-700 border-teal-200',
      title: 'BIS Training Program',
      date: 'Registration Open • 05 Apr 2025'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* ================= LEFT 2 COLUMNS: MAIN WORKSPACE ================= */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. Hero Card with Dome Graphic & Search & 5 Action Cards */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5 relative overflow-hidden">
            
            {/* Background Parliament / Dome Silhouette Illustration */}
            <div className="absolute right-3 top-2 opacity-10 pointer-events-none hidden sm:block">
              <svg width="220" height="130" viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M110 10V25M110 10L125 18L110 25" stroke="#0b2545" strokeWidth="2" />
                <path d="M70 65C70 42.9 87.9 25 110 25C132.1 25 150 42.9 150 65H70Z" fill="#0b2545" />
                <rect x="50" y="65" width="120" height="12" fill="#0b2545" />
                <rect x="60" y="77" width="10" height="40" fill="#0b2545" />
                <rect x="80" y="77" width="10" height="40" fill="#0b2545" />
                <rect x="105" y="77" width="10" height="40" fill="#0b2545" />
                <rect x="130" y="77" width="10" height="40" fill="#0b2545" />
                <rect x="150" y="77" width="10" height="40" fill="#0b2545" />
                <rect x="40" y="117" width="140" height="12" fill="#0b2545" />
              </svg>
            </div>

            <div className="space-y-1 relative z-10">
              <span className="text-xs font-semibold text-slate-500">Welcome to BIS Sahayak</span>
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b2545] tracking-tight">
                  Understand. Comply. Grow.
                </h1>
                <div className="w-12 h-1 bg-orange-500 rounded-full"></div>
              </div>
              <p className="text-xs text-slate-600 pt-1">
                Your AI assistant for BIS standards, compliance guidance, and evidence-based recommendations.
              </p>
            </div>

            {/* Search Input Bar */}
            <div className="space-y-1.5 relative z-10">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunSearch()}
                  placeholder="Describe your product, requirement or ask a BIS question..."
                  className="w-full pl-4 pr-32 py-3 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-sm text-slate-900 font-medium outline-none focus:border-[#0b2545] focus:bg-white transition-all placeholder:text-slate-400"
                />
                <div className="absolute right-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`p-1.5 rounded-lg text-slate-400 hover:text-orange-600 transition-colors ${
                      isListening ? 'text-orange-600 bg-orange-50 animate-pulse' : ''
                    }`}
                    title="Voice Input"
                  >
                    <Mic size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleRunSearch}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <Sparkles size={13} />
                    <span>Ask AI</span>
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                <span className="font-semibold text-slate-500">Example:</span> I manufacture stainless steel water bottles for children.
              </p>
            </div>

            {/* 5 Focused Action Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1 relative z-10">
              
              {/* 1. Find Applicable Standard */}
              <button
                type="button"
                onClick={() => onNavigate('standards')}
                className="p-3 rounded-2xl bg-blue-50/50 hover:bg-blue-50 border border-blue-100 hover:border-blue-300 text-left transition-all space-y-1.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <BookOpen size={16} />
                </div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 leading-tight">
                  Find Applicable Standard
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Discover relevant BIS standards
                </p>
              </button>

              {/* 2. Check Compliance */}
              <button
                type="button"
                onClick={() => onNavigate('compliance')}
                className="p-3 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 hover:border-emerald-300 text-left transition-all space-y-1.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 leading-tight">
                  Check Compliance
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Assess your compliance readiness
                </p>
              </button>

              {/* 3. Analyze Document */}
              <button
                type="button"
                onClick={() => onNavigate('documents')}
                className="p-3 rounded-2xl bg-amber-50/50 hover:bg-amber-50 border border-amber-100 hover:border-amber-300 text-left transition-all space-y-1.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <FileText size={16} />
                </div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-amber-700 leading-tight">
                  Analyze Document
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Upload and analyze your documents
                </p>
              </button>

              {/* 4. Compare Standards */}
              <button
                type="button"
                onClick={() => onNavigate('compare')}
                className="p-3 rounded-2xl bg-purple-50/50 hover:bg-purple-50 border border-purple-100 hover:border-purple-300 text-left transition-all space-y-1.5 group"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Scale size={16} />
                </div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-purple-700 leading-tight">
                  Compare Standards
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Compare multiple standards
                </p>
              </button>

              {/* 5. Verify Information */}
              <button
                type="button"
                onClick={() => onNavigate('verification')}
                className="p-3 rounded-2xl bg-teal-50/50 hover:bg-teal-50 border border-teal-100 hover:border-teal-300 text-left transition-all space-y-1.5 group col-span-2 sm:col-span-1"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <BadgeCheck size={16} />
                </div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-teal-700 leading-tight">
                  Verify Information
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Verify BIS licenses, labs and more
                </p>
              </button>

            </div>
          </div>

          {/* 2. Middle Row: Recent Compliance Assessment + Next Best Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Recent Compliance Assessment Card */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Recent Compliance Assessment</h3>
                <button
                  type="button"
                  onClick={() => onNavigate('compliance')}
                  className="text-[11px] font-semibold text-[#0b2545] hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-14 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center text-xl shrink-0">
                  🍶
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    Stainless Steel Water Bottle (for Children)
                  </h4>
                  <p className="text-[11px] font-semibold text-[#0b2545] mt-0.5">
                    IS 17803 : 2022
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-semibold text-slate-400">Compliance Readiness</span>
                  <div className="text-2xl font-black text-emerald-600">68%</div>
                  <div className="text-[10px] text-slate-500 font-medium space-y-0.2">
                    <p className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> 5 Complete</p>
                    <p className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> 2 Needs Review</p>
                    <p className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> 1 Missing</p>
                  </div>
                </div>

                {/* Circular Segmented Donut Chart SVG */}
                <div className="flex flex-col items-end">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      {/* Background circle */}
                      <path
                        className="text-slate-100"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      {/* Complete green segment */}
                      <path
                        className="text-emerald-500"
                        strokeDasharray="68, 100"
                        strokeWidth="4"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      {/* Review amber segment */}
                      <path
                        className="text-amber-500"
                        strokeDasharray="18, 100"
                        strokeDashoffset="-68"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">Last assessed: 2 May 2025</span>
                </div>
              </div>
            </div>

            {/* Next Best Action Card with Illustrated Checklist Graphic */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Next Best Action</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                  High Priority
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                    Upload the required safety test report.
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Why: Clause 5.2.1 of IS 17803:2022 requires safety performance test report from BIS-recognized lab.
                  </p>
                </div>

                {/* Checklist Illustration */}
                <div className="w-12 h-14 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-col items-center justify-center p-1 text-blue-700 shrink-0">
                  <div className="w-4 h-1.5 bg-blue-400 rounded-xs mb-1" />
                  <div className="space-y-1 w-full px-1">
                    <div className="flex items-center gap-0.5 text-[8px] font-bold">✓ <div className="h-0.5 bg-blue-300 w-full" /></div>
                    <div className="flex items-center gap-0.5 text-[8px] font-bold">✓ <div className="h-0.5 bg-blue-300 w-full" /></div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onNavigate('documents')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <Upload size={13} />
                  <span>Upload Evidence</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('compliance')}
                  className="text-xs font-bold text-[#0b2545] hover:underline"
                >
                  View Requirement →
                </button>
              </div>
            </div>

          </div>

          {/* 3. Bottom Row: Applicable Standards Table + Announcements */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Applicable Standards (Top Matches) - 2 Cols */}
            <div className="sm:col-span-2 p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">
                  Applicable Standards <span className="text-slate-400 font-normal">(Top Matches)</span>
                </h3>
                <button
                  type="button"
                  onClick={() => onNavigate('standards')}
                  className="text-[11px] font-semibold text-[#0b2545] hover:underline"
                >
                  View All Standards
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                      <th className="pb-2">Standard Number</th>
                      <th className="pb-2">Title</th>
                      <th className="pb-2">Relevance</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {topStandards.map((std, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 font-bold text-slate-900 whitespace-nowrap">
                          {std.id}
                        </td>
                        <td className="py-2.5 text-slate-600 max-w-[170px] truncate">
                          {std.title}
                        </td>
                        <td className="py-2.5 whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${std.relevanceClass}`}>
                            {std.relevance}
                          </span>
                        </td>
                        <td className="py-2.5 whitespace-nowrap text-emerald-600 font-bold text-[11px]">
                          {std.status}
                        </td>
                        <td className="py-2.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onNavigate('standards')}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                            title="View Standard"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Announcements - 1 Col */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900">Announcements</h3>
                <button
                  type="button"
                  onClick={() => onNavigate('standards')}
                  className="text-[11px] font-semibold text-[#0b2545] hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2">
                {announcements.map((ann, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between gap-2 cursor-pointer">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${ann.tagColor}`}>
                          {ann.tag}
                        </span>
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {ann.title}
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {ann.date}
                      </p>
                    </div>
                    <ChevronRight size={13} className="text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* ================= RIGHT 1 COLUMN: YOUR COMPLIANCE JOURNEY ================= */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-[#0b2545]">Your Compliance Journey</h3>
            <p className="text-xs text-slate-500">6-stage guided compliance roadmap</p>
          </div>

          <div className="space-y-4 text-xs">
            
            {/* 1. Product */}
            <div className="flex items-start gap-3 relative pb-4 border-l-2 border-slate-200 pl-4 ml-3">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#0b2545] text-white flex items-center justify-center text-[9px] font-black">
                1
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Product</h4>
                <p className="text-[11px] text-slate-500">Describe your product</p>
              </div>
            </div>

            {/* 2. Applicable Standard */}
            <div className="flex items-start gap-3 relative pb-4 border-l-2 border-slate-200 pl-4 ml-3">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black">
                2
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Applicable Standard</h4>
                <p className="text-[11px] text-slate-500">AI suggests relevant BIS standards</p>
              </div>
            </div>

            {/* 3. Requirements */}
            <div className="flex items-start gap-3 relative pb-4 border-l-2 border-slate-200 pl-4 ml-3">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black">
                3
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Requirements</h4>
                <p className="text-[11px] text-slate-500">AI extracts key requirements</p>
              </div>
            </div>

            {/* 4. Evidence */}
            <div className="flex items-start gap-3 relative pb-4 border-l-2 border-slate-200 pl-4 ml-3">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center text-[9px] font-black">
                4
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Evidence</h4>
                <p className="text-[11px] text-slate-500">Upload documents and reports</p>
              </div>
            </div>

            {/* 5. Compliance Readiness */}
            <div className="flex items-start gap-3 relative pb-4 border-l-2 border-slate-200 pl-4 ml-3">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px] font-black">
                5
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Compliance Readiness</h4>
                <p className="text-[11px] text-slate-500">Get your compliance score</p>
              </div>
            </div>

            {/* 6. Next Best Action */}
            <div className="flex items-start gap-3 relative pl-4 ml-3">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#0b2545] text-white flex items-center justify-center text-[9px] font-black">
                6
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Next Best Action</h4>
                <p className="text-[11px] text-slate-500">AI recommends next steps</p>
              </div>
            </div>

          </div>

          <button
            type="button"
            onClick={() => onNavigate('compliance')}
            className="w-full py-2.5 rounded-xl border border-[#0b2545] text-[#0b2545] hover:bg-[#0b2545] hover:text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>Start Full Assessment</span>
            <ArrowRight size={13} />
          </button>
        </div>

      </div>
    </div>
  );
}
