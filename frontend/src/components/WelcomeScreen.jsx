import React from 'react';
import { Search, Shield, Languages, FileCheck, Mic, Award, Zap, Flame, Droplets, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { DEMO_WORKFLOW_PROMPTS } from '../utils/constants';

export default function WelcomeScreen({ onSelectQuery, onOpenVerifier, onOpenChecklist }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 md:px-12 py-8 overflow-y-auto max-w-5xl mx-auto w-full">
      {/* Hero Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 text-xs font-semibold">
          <Sparkles size={13} />
          <span>Smart India Hackathon 2026 (SIH26107) · BIS Compliance Navigator</span>
        </div>
        
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xl font-bold shadow-xs">
            BS
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white">
            BIS Sahayak <span className="text-orange-600 dark:text-orange-400">V2</span>
          </h1>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          From Product → Applicable Standard → Why Standards Apply → Requirements → Evidence → Compliance Readiness → Next Action.
        </p>
      </div>

      {/* Suggested Demo Queries */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Recommended Benchmark Inquiries
          </p>
          <span className="text-xs text-orange-600 dark:text-orange-400 font-bold">Click to start</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {DEMO_WORKFLOW_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectQuery(item.query)}
              className="flex flex-col justify-between p-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-orange-400 hover:shadow-xs transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                  {item.category}
                </span>
                <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.2 rounded font-semibold text-gray-600 dark:text-gray-400">
                  {item.tag}
                </span>
              </div>
              <p className="text-xs font-bold text-gray-900 dark:text-gray-100 group-hover:text-orange-600 transition-colors">
                "{item.query}"
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                {item.desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
