import React, { useState, useEffect } from 'react';
import { Search, Filter, Sparkles, Eye, ChevronLeft, ChevronRight, Info, ExternalLink, X, BookOpen, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { getDatasetStats, getStandardByHsCode } from '../services/api';
import Footer from './Footer';

export default function StandardsView({
  onOpenEvidence,
  onCheckComplianceForStandard,
  onAskAIAboutStandard,
  onNavigate
}) {
  const [standards, setStandards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStandardForDetails, setSelectedStandardForDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // HS-Code & Standards Direct Search State
  const [hsState, setHsState] = useState({
    searched: false,
    loading: false,
    query: '',
    result: null,
    resultType: null,
    notFound: false,
    invalid: false,
    error: null
  });

  const executeHsSearch = async (codeToSearch) => {
    const raw = (codeToSearch !== undefined ? codeToSearch : searchQuery).trim();
    if (!raw) {
      setHsState({
        searched: true,
        loading: false,
        query: '',
        result: null,
        resultType: null,
        notFound: false,
        invalid: true,
        error: "Please enter an HS Code (e.g. 0101.29.10, 8432) or standard keyword."
      });
      return;
    }

    setHsState({
      searched: true,
      loading: true,
      query: raw,
      result: null,
      resultType: null,
      notFound: false,
      invalid: false,
      error: null
    });

    try {
      const res = await getStandardByHsCode(raw);
      if (res && res.success && res.data) {
        setHsState({
          searched: true,
          loading: false,
          query: raw,
          result: res.data,
          resultType: res.type || (res.data.hs_code ? 'hs_code' : 'standard'),
          notFound: false,
          invalid: false,
          error: null
        });
      } else if (res && (res.message === "HS Code not found" || !res.success)) {
        setHsState({
          searched: true,
          loading: false,
          query: raw,
          result: null,
          resultType: null,
          notFound: true,
          invalid: false,
          error: null
        });
      } else {
        setHsState({
          searched: true,
          loading: false,
          query: raw,
          result: null,
          resultType: null,
          notFound: false,
          invalid: false,
          error: res?.message || "Server error occurred while searching database."
        });
      }
    } catch (err) {
      setHsState({
        searched: true,
        loading: false,
        query: raw,
        result: null,
        resultType: null,
        notFound: false,
        invalid: false,
        error: "Server connection failed. Please ensure the backend is running."
      });
    }
  };

  useEffect(() => {
    fetch('/standards_metadata.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setStandards(data);
        } else {
          throw new Error("Invalid standards data");
        }
      })
      .catch(() => {
        getDatasetStats().then(data => {
          if (data && data.standards) setStandards(data.standards);
        });
      });
  }, []);

  const categories = [
    'All Categories',
    'Electrical',
    'Medical',
    'Food',
    'Footwear',
    'Textiles',
    'Construction',
    'Chemicals',
    'Safety'
  ];

  // Helper to get category mapping and thumbnails
  const getStandardThumbnail = (std) => {
    const title = (std.title || '').toLowerCase();
    const id = (std.id || '').toLowerCase();
    if (id.includes('2347') || title.includes('cooker')) return '🍳';
    if (id.includes('18739') || title.includes('bedsheet') || title.includes('textile')) return '🛏️';
    if (id.includes('80601') || title.includes('sphygmomanometer') || title.includes('blood pressure')) return '🩺';
    if (id.includes('18266') || title.includes('respirator')) return '😷';
    if (id.includes('13422') || title.includes('glove')) return '🧤';
    if (id.includes('15844') || title.includes('footwear') || title.includes('shoe')) return '👟';
    if (id.includes('13688') || title.includes('milk')) return '🥛';
    if (id.includes('2557') || title.includes('annatto') || title.includes('colour')) return '🎨';
    if (id.includes('2791') || title.includes('coffee')) return '☕';
    if (id.includes('15787') || title.includes('socket')) return '🔌';
    if (id.includes('411') || title.includes('titanium') || title.includes('dioxide')) return '🧪';
    if (id.includes('3652') || title.includes('sprayer') || title.includes('crop')) return '🌾';
    if (id.includes('9131') || title.includes('lock') || title.includes('latch')) return '🔒';
    if (id.includes('10086') || title.includes('mould')) return '🧱';
    if (id.includes('4658') || title.includes('paper') || title.includes('board')) return '📜';
    if (id.includes('269') || id.includes('18189') || title.includes('cement')) return '🏗️';
    if (id.includes('4151') || title.includes('helmet')) return '⛑️';
    if (id.includes('10500') || title.includes('water')) return '💧';
    if (id.includes('302') || title.includes('heater') || title.includes('geyser') || title.includes('washing') || title.includes('iron') || title.includes('appliance')) return '⚡';
    return '📄';
  };

  const getEffectiveDate = (std) => {
    if (std.effective_date) return `Effective: ${std.effective_date}`;
    if (std.year) return `Effective: Year ${std.year}`;
    return 'Effective: Current Gazetted Standard';
  };

  const getCategorySubtitle = (std) => {
    const sec = std.sector || '';
    if (sec.includes('Electrical')) return 'Electrical Appliances & Safety';
    if (sec.includes('Medical')) return 'Medical Devices & Healthcare';
    if (sec.includes('Food') || sec.includes('Additives')) return 'Food, Dairy & Public Health';
    if (sec.includes('Footwear')) return 'Footwear & Athletic Gear';
    if (sec.includes('Textiles')) return 'Textiles & Bedding Materials';
    if (sec.includes('Construction') || sec.includes('Civil') || sec.includes('Cement')) return 'Civil Infrastructure & Cement';
    if (sec.includes('Utensils') || sec.includes('Utensil')) return 'Domestic Utensils & Cookware';
    if (sec.includes('Automotive')) return 'Vehicle & Personal Protection';
    if (sec.includes('Chemicals') || sec.includes('Paper') || sec.includes('Agriculture')) return 'Chemicals, Paper & Agrochemicals';
    if (sec.includes('Hardware') || sec.includes('Security')) return 'Building Hardware & Locks';
    return std.sector || 'National Standards Specification';
  };

  const getRelevanceBadge = (idx) => {
    if (idx % 3 === 0) return { label: 'High', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (idx % 3 === 1) return { label: 'Medium', class: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'Low', class: 'bg-blue-50 text-blue-700 border-blue-200' };
  };

  // Filter standards
  const filteredStandards = standards.filter(std => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      std.id?.toLowerCase().includes(q) ||
      std.title?.toLowerCase().includes(q) ||
      std.sector?.toLowerCase().includes(q) ||
      (std.applicable_products && std.applicable_products.some(p => p.toLowerCase().includes(q)));

    if (selectedCategory === 'All Categories') return matchesSearch;
    const cat = selectedCategory.toLowerCase();
    const matchesCat = (std.sector || '').toLowerCase().includes(cat) || (std.title || '').toLowerCase().includes(cat);
    return matchesSearch && matchesCat;
  });

  const totalResults = filteredStandards.length;
  const totalPages = Math.ceil(totalResults / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedStandards = filteredStandards.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] flex flex-col justify-between animate-fade-in font-sans">
      <div className="p-6 sm:p-8 space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* 1. Header Title & Subtitle */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b2545] tracking-tight">
              Standards
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Search and explore Indian Standards
            </p>
          </div>

          {/* 2. Search Bar + Action Button */}
          <div className="space-y-2">
            <form onSubmit={(e) => { e.preventDefault(); executeHsSearch(); }} className="flex flex-col sm:flex-row items-stretch gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Enter HS Code (e.g. 0101.29.10, 8432) or standard keyword..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-medium outline-none focus:border-[#0b2545] focus:ring-1 focus:ring-[#0b2545] transition-all placeholder:text-slate-400 shadow-2xs"
                />
              </div>

              <button
                type="submit"
                disabled={hsState.loading}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white text-xs font-bold transition-colors shadow-xs shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {hsState.loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search size={14} />
                    <span>Search</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs shrink-0"
              >
                <Filter size={14} />
                <span>Filters</span>
              </button>
            </form>

            {/* Quick HS Code & Standards Samples */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 overflow-x-auto no-scrollbar pt-1">
              <span className="font-semibold text-slate-600 whitespace-nowrap">Try Query:</span>
              {['0101.29.10', '0201.30.00', '0304.49.40', '8432', 'IS 2347', 'boneless', 'tuna'].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setSearchQuery(sample);
                    executeHsSearch(sample);
                  }}
                  className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 hover:border-[#0b2545] hover:text-[#0b2545] text-slate-700 font-mono transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Lookup Result States */}
          {hsState.searched && (
            <div className="animate-fade-in">
              {/* 1. Loading State */}
              {hsState.loading && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex items-center justify-center gap-3">
                  <Loader2 size={20} className="animate-spin text-[#0b2545]" />
                  <span className="text-xs font-bold text-slate-700">
                    Searching database for <span className="font-mono text-[#0b2545]">"{hsState.query}"</span>...
                  </span>
                </div>
              )}

              {/* 2. Found State — HSN Code Result */}
              {!hsState.loading && hsState.result && hsState.result.hs_code && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span className="font-bold text-xs uppercase tracking-wider text-emerald-800">
                        Official HSN Record Found
                      </span>
                      <span className="hidden sm:inline-block text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-mono">
                        HSN / ITC-HS Catalog
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHsState(prev => ({ ...prev, searched: false, result: null }))}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Dismiss"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        HS Code:
                      </span>
                      <span className="text-lg font-extrabold text-[#0b2545] font-mono mt-1 block">
                        {hsState.result.hs_code}
                      </span>
                    </div>
                    <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Product Description:
                      </span>
                      <p className="text-sm font-semibold text-slate-800 mt-1">
                        {hsState.result.description}
                      </p>
                    </div>
                  </div>

                  {hsState.result.related_items && hsState.result.related_items.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Related Sub-Items & Headings:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {hsState.result.related_items.slice(0, 6).map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setSearchQuery(item.hs_code);
                              executeHsSearch(item.hs_code);
                            }}
                            className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white hover:border-[#0b2545] transition-all cursor-pointer text-xs"
                          >
                            <span className="font-mono font-bold text-[#0b2545]">{item.hs_code}</span>
                            <p className="text-slate-600 line-clamp-1 mt-0.5">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        if (onAskAIAboutStandard) {
                          onAskAIAboutStandard({
                            id: `HSN ${hsState.result.hs_code}`,
                            title: hsState.result.description
                          });
                        }
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      <Sparkles size={13} className="text-orange-400" />
                      <span>Ask AI About HS Code {hsState.result.hs_code}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Found State — Standard Result */}
              {!hsState.loading && hsState.result && hsState.result.id && !hsState.result.hs_code && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span className="font-bold text-xs uppercase tracking-wider text-emerald-800">
                        Official BIS Standard Found
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHsState(prev => ({ ...prev, searched: false, result: null }))}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Dismiss"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-lg font-extrabold text-[#0b2545]">
                          {hsState.result.id}
                        </span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          {hsState.result.status || 'Current National Standard'}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 mt-1">
                        {hsState.result.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Sector: {hsState.result.sector || 'National Standards Specification'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedStandardForDetails(hsState.result)}
                      className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                    >
                      View Mandatory Clauses
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onAskAIAboutStandard) {
                          onAskAIAboutStandard({
                            id: hsState.result.id,
                            title: hsState.result.title
                          });
                        }
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      <Sparkles size={13} className="text-orange-400" />
                      <span>Ask AI / Gemini About This Standard</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 4. Not Found State */}
              {!hsState.loading && hsState.notFound && (
                <div className="bg-amber-50/90 rounded-2xl border border-amber-200 p-5 flex items-start justify-between gap-3 shadow-xs">
                  <div className="flex items-start gap-3">
                    <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-amber-900">
                        No product found for this HS Code.
                      </h4>
                      <p className="text-xs text-amber-700">
                        No matching record found for <span className="font-mono font-bold">"{hsState.query}"</span> in the database.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHsState(prev => ({ ...prev, searched: false }))}
                    className="p-1 text-amber-600 hover:text-amber-800 rounded-lg"
                    title="Dismiss"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* 5. Invalid Input State */}
              {!hsState.loading && hsState.invalid && (
                <div className="bg-red-50/90 rounded-2xl border border-red-200 p-5 flex items-start justify-between gap-3 shadow-xs">
                  <div className="flex items-start gap-3">
                    <Info size={18} className="text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-red-900">
                        Invalid Input
                      </h4>
                      <p className="text-xs text-red-700">
                        {hsState.error || "Please enter a valid HS Code (e.g., 0101.29.10, 8432) or standard keyword."}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHsState(prev => ({ ...prev, searched: false }))}
                    className="p-1 text-red-600 hover:text-red-800 rounded-lg"
                    title="Dismiss"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat, idx) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${isActive
                      ? 'bg-[#0b2545] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* 4. Standards Table / List Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">

                {/* Table Header */}
                <thead>
                  <tr className="border-b border-slate-100 bg-white text-slate-500 font-semibold text-[11px]">
                    <th className="py-3 px-6 w-1/2">Standard</th>
                    <th className="py-3 px-6 w-1/6">Status</th>
                    <th className="py-3 px-6 w-1/8 text-center">Relevance</th>
                    <th className="py-3 px-6 text-right w-1/4">Action</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-slate-100">
                  {displayedStandards.length > 0 ? (
                    displayedStandards.map((std, idx) => {
                      const globalIdx = startIndex + idx;
                      const relevance = getRelevanceBadge(globalIdx);
                      const thumbnail = getStandardThumbnail(std);
                      const effectiveDate = getEffectiveDate(std);
                      const categorySubtitle = getCategorySubtitle(std);

                      return (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">

                          {/* Standard Column (Thumbnail + Code + Title + Subtitle) */}
                          <td className="py-4 px-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-14 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-xl shrink-0">
                                {thumbnail}
                              </div>
                              <div className="min-w-0 space-y-0.5">
                                <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                                  {std.id}
                                </h3>
                                <p className="text-xs text-slate-700 font-medium leading-snug">
                                  {std.title}
                                </p>
                                <p className="text-[11px] text-slate-400 font-normal">
                                  {categorySubtitle}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Status Column */}
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 font-bold text-emerald-700 text-xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>Current</span>
                              </div>
                              <p className="text-[10px] text-slate-400">
                                {effectiveDate}
                              </p>
                            </div>
                          </td>

                          {/* Relevance Column */}
                          <td className="py-4 px-6 text-center whitespace-nowrap">
                            <span className={`inline-block px-3 py-1 rounded-lg text-[11px] font-bold border ${relevance.class}`}>
                              {relevance.label}
                            </span>
                          </td>

                          {/* Action Column ([View] + [✨ Ask AI]) */}
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedStandardForDetails(std)}
                                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors shadow-2xs"
                              >
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => onAskAIAboutStandard && onAskAIAboutStandard({ id: std.id, title: std.title })}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white font-bold text-xs transition-colors shadow-xs"
                              >
                                <Sparkles size={13} />
                                <span>Ask AI</span>
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        {hsState.result && hsState.result.hs_code ? (
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-700 text-xs">
                              Showing Official HSN Record above for "{hsState.query}"
                            </p>
                            <p className="text-[11px] text-slate-400">
                              To search BIS National Standards, query by standard code (e.g. IS 2347, IS 17803) or generic product category.
                            </p>
                          </div>
                        ) : (
                          `No standards found matching "${searchQuery}". Try searching by standard number or product name.`
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing {displayedStandards.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, totalResults)} of {totalResults} results
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30"
                >
                  <ChevronLeft size={14} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${currentPage === page
                        ? 'bg-[#0b2545] text-white shadow-xs'
                        : 'hover:bg-slate-100 text-slate-700'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

          </div>

          {/* 5. Bottom Help Callout Banner */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700">
              <div className="w-6 h-6 rounded-full bg-[#0b2545] text-white flex items-center justify-center font-bold text-xs shrink-0">
                i
              </div>
              <span>
                Can't find the standard you're looking for? Ask BIS Sahayak to help you.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onAskAIAboutStandard && onAskAIAboutStandard({ id: 'Custom Query', title: 'Find Standard' })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-[#0b2545] font-bold text-xs shadow-2xs transition-colors shrink-0"
            >
              <Sparkles size={13} className="text-orange-500" />
              <span>Ask Now</span>
            </button>
          </div>

          {/* Details Modal when clicking [View] */}
          {selectedStandardForDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
              <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <div>
                    <span className="text-xs font-bold text-orange-600">{selectedStandardForDetails.id}</span>
                    <h3 className="font-extrabold text-sm text-slate-900 mt-0.5">{selectedStandardForDetails.title}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedStandardForDetails(null)}
                    className="p-1 rounded-xl text-slate-400 hover:text-slate-700"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[10px]">Gazette Scope & Regulated Products:</span>
                    <p className="text-slate-800 mt-1 font-medium leading-relaxed">
                      {Array.isArray(selectedStandardForDetails.intended_use)
                        ? selectedStandardForDetails.intended_use.join('; ')
                        : selectedStandardForDetails.intended_use || 'Official gazetted standard scope.'}
                    </p>
                  </div>

                  {selectedStandardForDetails.key_clauses && selectedStandardForDetails.key_clauses.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-bold text-slate-400 uppercase text-[10px]">Mandatory Statutory Clauses:</span>
                      <div className="space-y-2">
                        {selectedStandardForDetails.key_clauses.map((c, i) => (
                          <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#0b2545]">{c.section || `Clause ${c.clause_id}`} - {c.title}</span>
                              <span className="text-slate-400">Page {c.page}</span>
                            </div>
                            <p className="text-slate-600 font-mono text-[11px] leading-relaxed">"{c.requirement_text}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50">
                  <a
                    href={selectedStandardForDetails.source_url || "https://www.services.bis.gov.in"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#0b2545] hover:underline flex items-center gap-1"
                  >
                    <span>Open in Official BIS Portal</span>
                    <ExternalLink size={12} />
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const std = selectedStandardForDetails;
                        setSelectedStandardForDetails(null);
                        onCheckComplianceForStandard(std);
                      }}
                      className="px-4 py-1.5 bg-[#0b2545] hover:bg-[#133b68] text-white font-bold text-xs rounded-xl"
                    >
                      Check Compliance
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
