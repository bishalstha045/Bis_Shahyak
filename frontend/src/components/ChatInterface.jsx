import React, { useRef, useEffect } from 'react';
import { Sparkles, Bot, User, ArrowRight, FileText, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle, Package, Shield, Globe2, Scale, Award, Coins } from 'lucide-react';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';

export default function ChatInterface({
  messages,
  isLoading,
  streamingText,
  language,
  onSendMessage,
  onOpenVerifier,
  onOpenChecklist,
  onOpenEvidence
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const promptCards = [
    {
      icon: <Package size={20} className="text-orange-600" />,
      iconBg: "bg-orange-50",
      category: "Product & Standard Mapping",
      query: "I manufacture stainless steel water bottles."
    },
    {
      icon: <ShieldCheck size={20} className="text-emerald-600" />,
      iconBg: "bg-emerald-50",
      category: "Safety & Test Requirements",
      query: "What safety standards apply to electric kettles?"
    },
    {
      icon: <Globe2 size={20} className="text-purple-600" />,
      iconBg: "bg-purple-50",
      category: "Hindi / Local Language",
      query: "IS 3196 के बारे में बताइए"
    },
    {
      icon: <Scale size={20} className="text-blue-600" />,
      iconBg: "bg-blue-50",
      category: "Standards Comparison",
      query: "Compare IS 302-2-15 and IS 302 (Part 1)"
    },
    {
      icon: <Package size={20} className="text-amber-600" />,
      iconBg: "bg-amber-50",
      category: "Toy Export Certification",
      query: "Which BIS certification do I need to export toys?"
    },
    {
      icon: <Award size={20} className="text-yellow-600" />,
      iconBg: "bg-yellow-50",
      category: "Gold Hallmarking & HUID",
      query: "What are the BIS gold hallmarking and HUID rules?"
    }
  ];

  const popularQuestions = [
    "BIS certification process",
    "IS 17803:2022 requirements",
    "Mandatory test clauses",
    "BIS license validity",
    "Lab recognition by BIS"
  ];

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#f8fafc] overflow-hidden">
      
      {/* Scrollable Message List / Hero Prompt View */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-4xl mx-auto py-6 space-y-8 animate-fade-in">
            
            {/* Top Assistant Badge */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold shadow-2xs">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-[#0b2545]">
                  BIS Sahayak AI Assistant
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Trusted. Accurate. BIS Knowledge at Your Fingertips.
                </p>
              </div>
            </div>

            {/* Centered Heading */}
            <div className="text-center space-y-2 py-2">
              <div className="flex items-center justify-center gap-2 text-orange-500 pb-1">
                <span className="w-12 h-px bg-orange-200"></span>
                <Sparkles size={16} />
                <span className="w-12 h-px bg-orange-200"></span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b2545] tracking-tight">
                How can I help you with BIS compliance today?
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Ask any question related to Indian Standards, certification, testing, documentation, lab requirements or compliance - in any Indian language.
              </p>
            </div>

            {/* 6 Structured Prompt Cards (2 Rows of 3) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {promptCards.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSendMessage({ query: p.query, language })}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all text-left group flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl ${p.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                      {p.icon}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-slate-700 block truncate">
                        {p.category}
                      </span>
                      <p className="text-xs font-semibold text-slate-900 group-hover:text-[#0b2545] mt-0.5 leading-snug">
                        "{p.query}"
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-300 group-hover:text-blue-600 font-bold text-sm shrink-0">›</span>
                </button>
              ))}
            </div>

            {/* Popular Questions Row */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Sparkles size={13} className="text-blue-600" />
                <span>Popular Questions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSendMessage({ query: q, language })}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-blue-50/80 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-[#0b2545] hover:border-blue-300 transition-all shadow-2xs"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onOpenEvidence={onOpenEvidence}
                onOpenChecklist={(m) => onOpenChecklist({ product: m.content.slice(0, 40), citations: m.citations })}
              />
            ))}
          </div>
        )}

        {/* Live Streaming Indicator */}
        {isLoading && (
          <div className="flex gap-3.5 max-w-4xl mx-auto px-2">
            <div className="w-8 h-8 rounded-xl bg-[#0b2545] text-white flex items-center justify-center text-xs font-black shrink-0 mt-1 shadow-xs">
              BS
            </div>
            <div className="flex-1 min-w-0">
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#0b2545] font-bold">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  <span>Searching Bureau of Indian Standards records & synthesizing evidence...</span>
                </div>
                {streamingText && (
                  <div className="text-xs sm:text-sm text-slate-700 font-sans leading-relaxed whitespace-pre-wrap">
                    {streamingText}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar at Bottom */}
      <InputBar
        onSend={(q) => onSendMessage({ query: q, language })}
        isLoading={isLoading}
        language={language}
        onOpenVerifier={onOpenVerifier}
      />
    </div>
  );
}
