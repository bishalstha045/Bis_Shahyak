import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { INDIC_LANGUAGES } from '../utils/constants';

export default function LanguageSelector({ language, onChange }) {
  return (
    <div className="relative flex items-center">
      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1.5 text-xs text-slate-700 shadow-2xs hover:border-slate-300 transition-colors">
        <Globe size={14} className="text-orange-500 shrink-0" />
        <select
          value={language}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent text-xs font-bold outline-none cursor-pointer pr-1 text-slate-800 appearance-none"
        >
          {INDIC_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code} className="bg-white text-slate-900">
              {l.name}
            </option>
          ))}
        </select>
        <ChevronDown size={12} className="text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}
