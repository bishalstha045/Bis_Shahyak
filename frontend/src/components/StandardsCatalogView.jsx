import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, ShieldCheck, FileText, ExternalLink, ChevronDown, ChevronUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { getDatasetStats } from '../services/api';

export default function StandardsCatalogView({ onOpenEvidence, onSelectStandardForCompliance }) {
  const [standards, setStandards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/backend/data/standards_metadata.json')
      .then(res => res.json())
      .then(data => {
        setStandards(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to API dataset stats
        getDatasetStats().then(data => {
          if (data && data.standards) {
            setStandards(data.standards);
          }
          setLoading(false);
        });
      });
  }, []);

  const sectors = [
    'All',
    'Consumer Goods & Utensils',
    'Electrical & Consumer Electronics',
    'Pressure Vessels & Gas',
    'Food Products & Beverages',
    'Toys & Children Goods',
    'Precious Metals & Jewellery',
    'Electronics, Energy & EV',
    'Civil Engineering & Building Materials',
    'Solar & Renewable Energy',
    'Automotive Safety & Consumer Goods'
  ];

  const filteredStandards = standards.filter(std => {
    const matchesSector = selectedSector === 'All' || std.sector === selectedSector;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      std.id?.toLowerCase().includes(q) ||
      std.title?.toLowerCase().includes(q) ||
      std.sector?.toLowerCase().includes(q) ||
      (std.applicable_products && std.applicable_products.some(p => p.toLowerCase().includes(q)));
    return matchesSector && matchesSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-10 max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs font-extrabold tracking-wide">
          <BookOpen size={14} />
          <span>Official Bureau of Indian Standards (BIS) Registry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          BIS Standards Knowledge Hub & Gazette Specifications
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          Explore complete mandatory testing protocols, raw material thresholds, and Quality Control Orders (QCO) for all 21 indexed Indian Standards.
        </p>
      </div>

      {/* Search & Sector Filter Bar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by IS code (e.g. IS 17803, IS 302, IS 3196) or product..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium outline-none focus:border-orange-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap hidden sm:inline">Found:</span>
            <span className="px-3.5 py-3 rounded-2xl bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-extrabold text-xs whitespace-nowrap border border-orange-200 dark:border-orange-800">
              {filteredStandards.length} Standards
            </span>
          </div>
        </div>

        {/* Sector Pill Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {sectors.map((sec, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedSector(sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSector === sec
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Standards Grid */}
      <div className="space-y-4">
        {filteredStandards.map((std, idx) => {
          const isExpanded = expandedId === std.id;
          return (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-orange-300 transition-all space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-black text-orange-600 dark:text-orange-400">
                      {std.id}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {std.sector}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                      {std.status || 'Active Gazette Standard'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-950 dark:text-white leading-snug">
                    {std.title}
                  </h3>

                  {std.intended_use && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      <b>Scope & Use:</b> {Array.isArray(std.intended_use) ? std.intended_use.join('; ') : std.intended_use}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : std.id)}
                    className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <span>{isExpanded ? 'Hide Clauses' : 'Inspect Clauses'}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {onSelectStandardForCompliance && (
                    <button
                      type="button"
                      onClick={() => onSelectStandardForCompliance(std)}
                      className="px-4 py-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      Start Assessment
                    </button>
                  )}
                </div>
              </div>

              {/* Expandable Clause & STI Inspector */}
              {isExpanded && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-fade-in">
                  
                  {/* Products & Characteristics Chips */}
                  {std.applicable_products && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        Regulated Products:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {std.applicable_products.map((prod, pIdx) => (
                          <span
                            key={pIdx}
                            className="px-2.5 py-1 rounded-lg bg-orange-50/70 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 text-xs font-medium border border-orange-200/60 dark:border-orange-800/40"
                          >
                            {prod}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Clauses Grid */}
                  {std.key_clauses && std.key_clauses.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        Mandatory Statutory Clauses ({std.key_clauses.length}):
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {std.key_clauses.map((clause, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2 flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-extrabold text-orange-600 dark:text-orange-400">
                                  {clause.section || `Clause ${clause.clause_id}`}
                                </span>
                                <span className="text-slate-400 font-semibold">Page {clause.page}</span>
                              </div>
                              <h4 className="font-bold text-slate-900 dark:text-slate-100 mt-1">
                                {clause.title}
                              </h4>
                              <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed line-clamp-3">
                                {clause.requirement_text}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700 flex items-center justify-between">
                              <span className="text-[10px] font-semibold text-slate-500">
                                {clause.category}
                              </span>
                              <button
                                type="button"
                                onClick={() => onOpenEvidence && onOpenEvidence({
                                  ...clause,
                                  standard_id: std.id,
                                  title: std.title,
                                  year: std.year,
                                  url: std.source_url
                                })}
                                className="text-orange-600 dark:text-orange-400 font-bold hover:underline inline-flex items-center gap-1"
                              >
                                <span>View Statutory Evidence</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* External Source Link */}
                  <div className="flex justify-end pt-1">
                    <a
                      href={std.source_url || "https://www.services.bis.gov.in"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-orange-600 dark:text-slate-400 transition-colors"
                    >
                      <span>Official BIS Gazette Record</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
