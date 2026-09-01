import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

export default function VoiceButton({ onResult, language = 'auto', disabled = false }) {
  const { isListening, startListening, stopListening } = useVoice({
    language,
    onResult: (text, isFinal) => {
      if (text && onResult) {
        onResult(text, isFinal);
      }
    }
  });

  return (
    <button
      type="button"
      onClick={isListening ? stopListening : startListening}
      disabled={disabled}
      className={`relative p-2.5 rounded-xl transition-all shrink-0 ${
        isListening
          ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30 ring-2 ring-rose-300 dark:ring-rose-900'
          : 'text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
      title={isListening ? "Listening... Click to stop" : "Voice query in Hindi / English"}
    >
      {isListening ? (
        <MicOff size={18} className="animate-bounce" />
      ) : (
        <Mic size={18} />
      )}
      {isListening && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
        </span>
      )}
    </button>
  );
}
