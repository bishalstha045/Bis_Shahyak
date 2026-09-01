import React, { useState } from 'react';
import { Search, Mic, ArrowRight, ShieldCheck, BookOpen, FileCheck, GitCompare, BadgeCheck, Sparkles, CheckCircle2, AlertTriangle, Layers, ExternalLink, Download } from 'lucide-react';
import { DEMO_WORKFLOW_PROMPTS } from '../utils/constants';

export default function OverviewView({
  onNavigate,
  onStartAnalysis,
  onOpenEvidence,
  indexedCount = 21,
  auth
}) {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
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
      if (onStartAnalysis) onStartAnalysis(text);
    };

    recognition.start();
  };

  const handleAnalyze = () => {
    if (!query.trim()) return;
    if (onStartAnalysis) onStartAnalysis(query);
  };

  const quickActions = [
    {
      id: 'navigator',
      icon: <ShieldCheck size={20} className="text-orange-600 dark:text-orange-400" />,
      title: 'Find Applicable Standard',
      desc: 'Enter product specifications to discover gazetted BIS standards and mandatory QCO rules.',
      tag: 'Core Flow'
    },
    {
      id: 'documents',
      icon: <FileCheck size={20} className="text-emerald-600 dark:text-emerald-400" />,
      title: 'Audit Test Reports',
      desc: 'Upload laboratory certificates to verify clause coverage and detect missing statutory tests.',
      tag: 'Evidence Match'
    },
    {
      id: 'standards',
      icon: <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />,
      title: 'Standards Library (21)',
      desc: 'Explore comprehensive Indian Standards with Scheme of Testing & Inspection (STI) protocols.',
      tag: 'Gazette Registry'
    },
    {
      id: 'compare',
      icon: <GitCompare size={20} className="text-indigo-600 dark:text-indigo-400" />,
      title: 'Compare Standards',
      desc: 'Side-by-side technical comparison of particular product specifications vs. base safety standards.',
      tag: 'Regulatory Analysis'
    },
    {
      id: 'verify',
      icon: <BadgeCheck size={20} className="text-teal-600 dark:text-teal-400" />,
      title: 'Verify BIS Licence',
      desc: 'Authenticate 7-digit CM/L license numbers and standard marks against verified registry records.',
      tag: 'Licence Check'
    },
    {
      id: 'assistant',
      icon: <Sparkles size={20} className="text-amber-600 dark:text-amber-400" />,
      title: 'Sahayak AI Assistant',
      desc: 'Ask complex regulatory questions with claim-level clause evidence in 14 Indian languages.',
      tag: 'Multilingual AI'
    }
  ];

  const regulatedSectors = [
    { name: 'Utensils & Stainless Steel', standards: 'IS 17803:2022, IS 17526:2021', icon: '🍶' },
    { name: 'Electrical & Liquid Heaters', standards: 'IS 302-2-15:2009, IS 302-1:2008', icon: '⚡' },
    { name: 'Pressure Vessels & LPG', standards: 'IS 3196 (Part 1 & 2):2013', icon: '🛢️' },
    { name: 'Food & Packaged Water', standards: 'IS 14543:2004, IS 13428:2005', icon: '💧' },
    { name: 'Plastics & PET Packaging', standards: 'IS 15410:2003', icon: '🧴' },
    { name: 'Toys & Child Safety', standards: 'IS 9873 (Part 1, 2, 3)', icon: '🧸' },
    { name: 'Gold & Silver Hallmarking', standards: 'IS 1417:2016, IS 2112:2014', icon: '🪙' },
    { name: 'Solar PV & Renewable Energy', standards: 'IS 14286:1995', icon: '☀️' },
    { name: 'Cement & TMT Steel Rebars', standards: 'IS 269:2015, IS 1786:2008', icon: '🏗️' },
    { name: 'Automotive & Rider Safety', standards: 'IS 4151:2015 (Helmets)', icon: '⛑️' },
    { name: 'Medical Devices & Masks', standards: 'IS 16289:2014', icon: '😷' },
    { name: 'Lithium Batteries & CRS', standards: 'IS 16046 (Part 2):2018', icon: '🔋' }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950 p-4 sm:p-8 md:p-12 space-y-10 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Hero Section */}
        <section className="text-center space-y-4 pt-2 sm:pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-900/60 text-orange-800 dark:text-orange-300 text-xs font-bold tracking-wide">
            <Sparkles size={14} className="text-orange-600 dark:text-orange-400" />
            <span>National AI-Powered BIS Compliance Decision Platform · SIH 2026</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-tight">
            Understand BIS Compliance.<br />
            <span className="text-orange-600 dark:text-orange-500">Know What To Do Next.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Find applicable standards, understand requirements, verify evidence, and track your compliance journey - all in one place.
          </p>
        </section>

        {/* Primary Intelligent Input Box */}
        <section className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="Describe your product (e.g. I manufacture stainless steel water bottles) or ask a BIS question..."
                className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`absolute right-3.5 top-3 p-1.5 rounded-xl text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors ${
                  isListening ? 'text-orange-600 animate-pulse bg-orange-100 dark:bg-orange-950' : ''
                }`}
                title="Voice Input (English / Hindi)"
              >
                <Mic size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!query.trim()}
                className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <span>Analyze Product</span>
                <ArrowRight size={15} />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('assistant')}
                className="px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold transition-all whitespace-nowrap"
              >
                Ask Assistant
              </button>
            </div>
          </div>

          {/* Quick Product Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Sample Inquiries:
            </span>
            {DEMO_WORKFLOW_PROMPTS.slice(0, 4).map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(item.query);
                  if (onStartAnalysis) onStartAnalysis(item.query);
                }}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-slate-700 dark:text-slate-300 hover:text-orange-700 dark:hover:text-orange-300 font-medium border border-slate-200/80 dark:border-slate-700 transition-colors"
              >
                {item.query}
              </button>
            ))}
          </div>
        </section>

        {/* Data Honesty & Platform Capabilities Row */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Indexed Standards</span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">
              {indexedCount} Standards
            </p>
            <p className="text-[11px] text-slate-500 font-medium">Verified core Gazette specifications</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Evidence Grounding</span>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              100% Grounded
            </p>
            <p className="text-[11px] text-slate-500 font-medium">Zero AI hallucinated clauses</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Regulated Sectors</span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">
              11 Sectors
            </p>
            <p className="text-[11px] text-slate-500 font-medium">Electronics, Utensils, Gas, Solar...</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Compliance Export</span>
            <p className="text-xl font-extrabold text-orange-600 dark:text-orange-400">
              Form V Ready
            </p>
            <p className="text-[11px] text-slate-500 font-medium">ReportLab PDF checklist output</p>
          </div>
        </section>

        {/* Quick Actions Workspace Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
                Compliance Workspaces & Tools
              </h2>
              <p className="text-xs text-slate-500">
                Direct access to core regulatory decision-support engines
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => onNavigate(action.id)}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-300 hover:shadow-xs transition-all text-left group flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-orange-50 dark:group-hover:bg-orange-950/60 transition-colors">
                    {action.icon}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {action.tag}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {action.desc}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Open Tool</span>
                  <ArrowRight size={13} />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Core Regulated Manufacturing Sectors */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
                Indexed National Manufacturing Sectors
              </h2>
              <p className="text-xs text-slate-500">
                Official specifications and test protocols currently available in BIS Sahayak
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('standards')}
              className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
            >
              <span>View All 21 Standards</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
            {regulatedSectors.map((sec, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('standards')}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{sec.icon}</span>
                  <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{sec.name}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 font-mono">
                  {sec.standards}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Trust Note */}
        <footer className="p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>
              <b>Government Authority Notice:</b> BIS Sahayak provides AI-assisted compliance decision support based on gazetted Bureau of Indian Standards records.
            </span>
          </div>
          <a
            href="https://www.services.bis.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-700 dark:text-slate-300 hover:text-orange-600 font-bold flex items-center gap-1 shrink-0"
          >
            <span>Official BIS Portal</span>
            <ExternalLink size={12} />
          </a>
        </footer>

      </div>
    </div>
  );
}
