import React, { useState, useRef } from 'react';
import { Send, Sparkles, Mic, ShieldCheck } from 'lucide-react';
import VoiceButton from './VoiceButton';

export default function InputBar({ onSend, isLoading, language, onOpenVerifier }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
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

  const handleVoiceInput = (transcript, isFinal) => {
    setInput(transcript);
    if (isFinal && transcript.trim()) {
      onSend(transcript.trim());
      setInput('');
    }
  };

  return (
    <div className="border-t border-slate-200/90 bg-white/95 backdrop-blur-md px-4 sm:px-8 lg:px-12 py-3.5 space-y-2 shrink-0">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="relative flex items-center gap-2 bg-slate-50/80 rounded-2xl border border-slate-300 focus-within:border-[#0b2545] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-900/10 shadow-xs transition-all px-3.5 py-2">
          
          {/* Sparkles Icon */}
          <div className="text-slate-400 pl-1 shrink-0">
            <Sparkles size={18} />
          </div>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={language === 'hi' ? 'भारतीय मानकों (BIS), ISI मार्क, या नियमों के बारे में पूछें...' : 'Ask anything about BIS standards, certification, test clauses...'}
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent resize-none text-xs sm:text-sm leading-relaxed outline-none placeholder:text-slate-400 text-slate-900 py-1.5 max-h-[120px]"
          />

          {/* Voice Input */}
          <VoiceButton
            onResult={handleVoiceInput}
            language={language}
            disabled={isLoading}
          />

          {/* Blue / Navy Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-xs hover:shadow transition-all shrink-0"
            title="Send Message"
          >
            <Send size={15} />
          </button>
        </div>

        {/* Footnote Bar */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-2 pt-1.5 font-medium">
          <div className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-slate-400" />
            <span>AI responses are based on official BIS data and publications.</span>
          </div>
          <span className="hidden sm:inline">Press Enter to send • Shift + Enter for new line</span>
        </div>
      </form>
    </div>
  );
}
