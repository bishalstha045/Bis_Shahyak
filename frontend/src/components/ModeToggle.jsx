import React from 'react';
import { BookOpen, Award } from 'lucide-react';

export default function ModeToggle({ mode, onChange }) {
  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800/80 rounded-full p-0.5 border border-gray-200/60 dark:border-gray-700/60">
      <button
        type="button"
        onClick={() => onChange('simple')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
          mode === 'simple'
            ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
        title="Simplified language for consumers, MSMEs & citizens"
      >
        <BookOpen size={12} />
        <span>Simple</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('expert')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
          mode === 'expert'
            ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
        title="Technical clauses, tolerances & testing protocols for engineers & QA"
      >
        <Award size={12} />
        <span>Expert</span>
      </button>
    </div>
  );
}
