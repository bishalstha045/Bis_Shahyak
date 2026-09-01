import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Copy, Check, Volume2, VolumeX, FileText, ChevronDown, ChevronUp, ShieldCheck, ArrowRight } from 'lucide-react';
import CitationCard from './CitationCard';
import ConfidenceBadge from './ConfidenceBadge';
import { submitFeedback } from '../services/api';

export default function MessageBubble({ message, onOpenEvidence, onOpenChecklist }) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showTechnical, setShowTechnical] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = message.content.replace(/[#*`_\[\]]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = message.language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleRate = async (rating) => {
    setFeedback(rating);
    try {
      await submitFeedback({
        message_id: message.id,
        rating,
        session_id: message.sessionId || "default"
      });
    } catch (err) {
      console.error("Feedback error:", err);
    }
  };

  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('## ') || line.startsWith('### ')) {
        const hText = line.replace(/^#+\s/, '');
        return <h3 key={idx} className="text-sm font-black text-gray-950 dark:text-white mt-3 mb-1">{hText}</h3>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const itemText = line.slice(2);
        return (
          <li key={idx} className="ml-4 list-disc text-xs sm:text-sm text-gray-800 dark:text-gray-200 my-1 leading-relaxed">
            {formatBold(itemText)}
          </li>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        const itemText = line.replace(/^\d+\.\s/, '');
        return (
          <li key={idx} className="ml-4 list-decimal text-xs sm:text-sm text-gray-800 dark:text-gray-200 my-1 leading-relaxed">
            {formatBold(itemText)}
          </li>
        );
      }
      if (!line.trim()) return <div key={idx} className="h-1.5" />;
      return <p key={idx} className="text-xs sm:text-sm leading-relaxed text-gray-800 dark:text-gray-200 my-1">{formatBold(line)}</p>;
    });
  };

  const formatBold = (str) => {
    const parts = str.split(/(\*\*.*?\*\*|\[Source:.*?\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-gray-950 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('[Source:') && part.endsWith(']')) {
        return (
          <span
            key={i}
            onClick={() => onOpenEvidence && onOpenEvidence({ snippet: part.slice(1, -1), standard_id: part.slice(9, 20).trim() })}
            className="inline-flex items-center px-1.5 py-0.2 mx-1 text-[11px] font-bold bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 rounded border border-orange-300/60 dark:border-orange-800/60 cursor-pointer hover:underline"
          >
            {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end max-w-4xl mx-auto px-2">
        <div className="max-w-[85%] md:max-w-[70%] bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-xs">
          <p className="text-xs sm:text-sm leading-relaxed font-normal whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 max-w-4xl mx-auto px-2 text-left">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-black shadow-xs shrink-0 mt-1">
        BS
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        {/* Main Content Bubble */}
        <div className={`p-4 md:p-5 rounded-2xl rounded-tl-sm bg-white dark:bg-gray-900 border ${
          message.isError
            ? 'border-rose-200 dark:border-rose-900/60'
            : 'border-gray-200 dark:border-gray-800'
        } shadow-xs space-y-3`}>
          
          {/* Header Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
            <div className="flex items-center gap-2">
              {message.confidence !== undefined && (
                <ConfidenceBadge score={message.confidence} />
              )}
              {message.compliance_readiness !== undefined && message.compliance_readiness > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200">
                  Readiness: {message.compliance_readiness}%
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase">
              Official BIS Compliance Synthesis
            </span>
          </div>

          {/* Formatted Content */}
          <div className="prose dark:prose-invert max-w-none">
            {renderFormattedText(message.content)}
          </div>

          {/* Expandable Technical Details Button */}
          {message.citations && message.citations.length > 0 && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowTechnical(!showTechnical)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <FileText size={13} className="text-orange-500" />
                <span>{showTechnical ? "Hide Technical Evidence Details" : "Expand Technical Details & STI Clauses"}</span>
                {showTechnical ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>

              {onOpenChecklist && (
                <button
                  type="button"
                  onClick={() => onOpenChecklist(message)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
                >
                  <span>Export Compliance PDF</span>
                  <ArrowRight size={12} />
                </button>
              )}
            </div>
          )}

          {/* Technical Citations Expanded Section */}
          {showTechnical && message.citations && message.citations.length > 0 && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl space-y-2 border border-gray-200 dark:border-gray-700 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Verified Statutory Source Clauses ({message.citations.length}):
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {message.citations.map((c, i) => (
                  <div key={i} className="p-2.5 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-orange-600 dark:text-orange-400">{c.standard_id}</span>
                      <span className="text-gray-400">Page {c.page || '1'}</span>
                    </div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 line-clamp-1">{c.section || c.title}</p>
                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 italic">"{c.snippet}"</p>
                    <div className="mt-1.5 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onOpenEvidence && onOpenEvidence(c)}
                        className="text-[10px] font-bold text-orange-600 hover:underline"
                      >
                        Inspect Official Evidence
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        {!message.isError && (
          <div className="flex items-center gap-1 text-gray-400 pt-0.5 text-xs">
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 transition-colors"
              title="Copy"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            </button>
            <button
              type="button"
              onClick={handleSpeak}
              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                isSpeaking ? 'text-orange-500' : 'hover:text-gray-700'
              }`}
              title="Read aloud"
            >
              {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>

            <div className="w-px h-3 bg-gray-200 dark:bg-gray-800 mx-1" />

            <button
              type="button"
              onClick={() => handleRate('up')}
              className={`p-1 rounded transition-colors ${feedback === 'up' ? 'text-emerald-600 font-bold' : 'hover:text-emerald-600'}`}
              title="Accurate"
            >
              <ThumbsUp size={13} />
            </button>
            <button
              type="button"
              onClick={() => handleRate('down')}
              className={`p-1 rounded transition-colors ${feedback === 'down' ? 'text-rose-600 font-bold' : 'hover:text-rose-600'}`}
              title="Inaccurate"
            >
              <ThumbsDown size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
