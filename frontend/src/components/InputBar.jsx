import React, { useState, useRef } from 'react';
import { Send, Sparkles, ShieldCheck, Globe, Zap, Cpu, Database } from 'lucide-react';
import VoiceButton from './VoiceButton';
import { INDIC_LANGUAGES } from '../utils/constants';

export default function InputBar({
  onSend,
  isLoading,
  language = 'auto',
  onLanguageChange,
  onOpenVerifier
}) {
  const [input, setInput] = useState('');
  const [engineMode, setEngineMode] = useState('auto'); // 'auto' | 'gemini' | 'rag'
  const textareaRef = useRef(null);
  const isSubmittingRef = useRef(false);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (isSubmittingRef.current) return;
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    isSubmittingRef.current = true;
    onSend(trimmed, engineMode, language);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setTimeout(() => {
      isSubmittingRef.current = false;
    }, 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  const handleVoiceInterim = (transcript) => {
    if (transcript) {
      setInput(transcript);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
      }
    }
  };

  const handleVoiceFinal = (finalText) => {
    if (!finalText || !finalText.trim()) return;
    const cleanText = finalText.trim();
    setInput(cleanText);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
      textareaRef.current.focus();
    }
  };

  return (
    <div className="border-t border-slate-200/90 bg-white/95 backdrop-blur-md px-4 sm:px-8 lg:px-12 py-3.5 space-y-2.5 shrink-0">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-2">
        
        {/* Top Control Bar: Engine Mode Switcher + Language Selector */}
        <div className="flex items-center justify-between gap-2 px-1">
          {/* AI Mode Selector: Auto | Gemini | RAG */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setEngineMode('auto')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                engineMode === 'auto'
                  ? 'bg-white text-blue-900 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Auto (Hybrid): Intelligent fallback between Gemini and Grounded BIS"
            >
              <Zap size={12} className={engineMode === 'auto' ? 'text-amber-500 fill-amber-500' : 'text-slate-400'} />
              <span>Auto (Hybrid)</span>
            </button>

            <button
              type="button"
              onClick={() => setEngineMode('gemini')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                engineMode === 'gemini'
                  ? 'bg-white text-purple-900 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Powered by Gemini AI"
            >
              <Cpu size={12} className={engineMode === 'gemini' ? 'text-purple-600' : 'text-slate-400'} />
              <span>Gemini</span>
            </button>

            <button
              type="button"
              onClick={() => setEngineMode('rag')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                engineMode === 'rag'
                  ? 'bg-white text-emerald-900 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Grounded BIS Knowledge (Standards Repository)"
            >
              <Database size={12} className={engineMode === 'rag' ? 'text-emerald-600' : 'text-slate-400'} />
              <span>RAG</span>
            </button>
          </div>

          {/* Quick Language Selector with Bhashini Support */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-700 transition-colors">
            <Globe size={13} className="text-orange-600 shrink-0" />
            <select
              value={language}
              onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
              className="bg-transparent text-[11px] font-bold outline-none cursor-pointer pr-1 text-slate-800"
              title="Change response language via Government of India Bhashini"
            >
              {INDIC_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input Box */}
        <div className="relative flex items-center gap-2 bg-slate-50/80 rounded-2xl border border-slate-300 focus-within:border-[#0b2545] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-900/10 shadow-xs transition-all px-3.5 py-2">
          
          <div className="text-slate-400 pl-1 shrink-0">
            <Sparkles size={18} />
          </div>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={
              language === 'hi'
                ? 'भारतीय मानकों (BIS), ISI मार्क, या नियमों के बारे में पूछें...'
                : language === 'ta'
                ? 'இந்திய தரநிலைகள் (BIS) பற்றி கேளுங்கள்...'
                : language === 'te'
                ? 'భారతీయ ప్రమాణాలు (BIS) గురించి అడగండి...'
                : 'Ask anything about BIS standards, QCO, certification, test clauses...'
            }
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent resize-none text-xs sm:text-sm leading-relaxed outline-none placeholder:text-slate-400 text-slate-900 py-1.5 max-h-[120px]"
          />

          <VoiceButton
            onResult={handleVoiceInterim}
            onFinal={handleVoiceFinal}
            language={language}
            disabled={isLoading}
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-xs hover:shadow transition-all shrink-0"
            title="Send Message"
          >
            <Send size={15} />
          </button>
        </div>

        {/* Footnote Bar */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-2 pt-0.5 font-medium">
          <div className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-slate-400" />
            <span>Active Engine: <strong className="text-slate-600 uppercase">{engineMode}</strong> • Powered by BIS Official Standards & Bhashini</span>
          </div>
          <span className="hidden sm:inline">Press Enter to send • Shift + Enter for new line</span>
        </div>
      </form>
    </div>
  );
}
