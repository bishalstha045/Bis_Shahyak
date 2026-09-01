import React, { useState } from 'react';
import { Search, Mic, ArrowRight, BookOpen, ShieldCheck, FileCheck, GitCompare, BadgeCheck, Sparkles, ExternalLink } from 'lucide-react';
import { DEMO_WORKFLOW_PROMPTS } from '../utils/constants';

export default function HomeView({
  onNavigate,
  onStartSearch,
  indexedCount = 21
}) {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Voice recognition is not supported in this browser. Please use Google Chrome or Edge.");
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
      if (onStartSearch) onStartSearch(text);
    };

    recognition.start();
  };

  const handleRunSearch = () => {
    if (!query.trim()) return;
    if (onStartSearch) onStartSearch(query);
  };

  const fiveActions = [
    {
      id: 'standards',
      icon: <BookOpen size={20} className="text-[#0b2545]" />,
      title: 'Find Applicable Standard',
      desc: 'Discover gazetted Indian Standards and mandatory Quality Control Orders (QCO) for your product.'
    },
    {
      id: 'compliance',
      icon: <ShieldCheck size={20} className="text-orange-600" />,
      title: 'Check Compliance',
      desc: 'Evaluate mandatory statutory clauses, test requirements, and calculate certification readiness.'
    },
    {
      id: 'documents',
      icon: <FileCheck size={20} className="text-emerald-700" />,
      title: 'Analyze Document',
      desc: 'Audit laboratory test reports and material mill certificates against standard clauses.'
    },
    {
      id: 'compare',
      icon: <GitCompare size={20} className="text-blue-700" />,
      title: 'Compare Standards',
      desc: 'Compare particular product specifications vs. base safety standards side-by-side.'
    },
    {
      id: 'verification',
      icon: <BadgeCheck size={20} className="text-teal-700" />,
      title: 'Verify BIS Information',
      desc: 'Check official 7-digit CM/L license numbers and standard mark records.'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/60 p-4 sm:p-8 md:p-12 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Primary Positioning Header */}
        <section className="text-center space-y-3 pt-2 sm:pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
            <span>Find → Understand → Check → Verify → Act</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0b2545] tracking-tight leading-tight">
            Tell us about your product or ask a BIS question.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            BIS provides the standards and official specifications. BIS Sahayak helps you understand how they apply to your product and what to do next.
          </p>
        </section>

        {/* Primary Product & Regulatory Search Input */}
        <section className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunSearch()}
                placeholder="Describe your product, requirement or BIS question (e.g. I manufacture stainless steel water bottles)..."
                className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm text-slate-900 font-medium outline-none focus:border-[#0b2545] focus:bg-white transition-all placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`absolute right-3 top-2.5 p-1.5 rounded-lg text-slate-400 hover:text-orange-600 transition-colors ${
                  isListening ? 'text-orange-600 bg-orange-50 animate-pulse' : ''
                }`}
                title="Voice Query (English / Hindi)"
              >
                <Mic size={17} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleRunSearch}
              disabled={!query.trim()}
              className="px-6 py-3 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-40"
            >
              <span>Analyze Product</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Quick Demo Inquiries */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="font-bold text-slate-400 uppercase text-[11px] mr-1">Suggested:</span>
            {DEMO_WORKFLOW_PROMPTS.slice(0, 4).map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(p.query);
                  if (onStartSearch) onStartSearch(p.query);
                }}
                className="px-3 py-1 bg-slate-100 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 border border-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
              >
                {p.query}
              </button>
            ))}
          </div>
        </section>

        {/* 5 Focused Core Actions */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 text-center">
            Or Choose a Dedicated Compliance Action
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {fiveActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => onNavigate(action.id)}
                className="p-5 rounded-xl bg-white border border-slate-200 hover:border-orange-500 hover:shadow-xs transition-all text-left group flex flex-col justify-between space-y-3"
              >
                <div className="p-2 rounded-lg bg-slate-50 w-fit group-hover:bg-orange-50 transition-colors">
                  {action.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {action.desc}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-700 group-hover:text-orange-600 transition-colors pt-1">
                  <span>Start Action</span>
                  <ArrowRight size={13} />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Official Authority & Knowledge Disclaimer */}
        <footer className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Verified Knowledge Base:</span>
            <span>{indexedCount} Indian Standards indexed with full statutory clause breakdowns</span>
          </div>
          <a
            href="https://www.services.bis.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0b2545] font-bold hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Official BIS Portal</span>
            <ExternalLink size={12} />
          </a>
        </footer>

      </div>
    </div>
  );
}
