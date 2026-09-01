import React from 'react';
import { FileText, ExternalLink, Bookmark } from 'lucide-react';

export default function CitationCard({ citation, onChecklistClick }) {
  return (
    <div className="group relative flex flex-col p-3 rounded-xl bg-white dark:bg-gray-900/90 border border-gray-200/80 dark:border-gray-800 hover:border-orange-400 dark:hover:border-orange-500 shadow-sm hover:shadow transition-all text-left">
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
          <FileText size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 tracking-tight">
              {citation.standard_id}
            </span>
            {citation.relevance && (
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.2 rounded-full border border-emerald-200/50 dark:border-emerald-800/40">
                {citation.relevance}% Match
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-2 mt-0.5">
            {citation.title}
          </p>
          {(citation.section || citation.page) && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              {citation.section && <span className="font-medium text-gray-700 dark:text-gray-300">{citation.section}</span>}
              {citation.page && <span> · Page {citation.page}</span>}
            </p>
          )}
          {citation.snippet && (
            <p className="text-[11px] text-gray-600 dark:text-gray-400 italic mt-1 line-clamp-2 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded border border-gray-100 dark:border-gray-800">
              "{citation.snippet}"
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-800/80 text-[11px]">
        <a
          href={citation.url || "https://www.services.bis.gov.in"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 hover:underline font-medium"
        >
          <span>Official BIS Portal</span>
          <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}
