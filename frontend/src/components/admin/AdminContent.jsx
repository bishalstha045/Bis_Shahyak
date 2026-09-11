import React, { useState, useEffect } from 'react';
import { Layers, Search, BookOpen, ShieldAlert, CheckCircle2, RefreshCw, ExternalLink } from 'lucide-react';
import { getAdminContent } from '../../services/api';

export default function AdminContent() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchContent = async () => {
    try {
      const data = await getAdminContent();
      if (data) setContent(data);
    } catch (e) {
      console.warn('Failed to fetch admin content:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchContent();
  };

  const defaultCategories = [
    { title: "Consumer Goods & Kitchen Utensils", count: 4, standards: [{ id: "IS 2347:2017", title: "Pressure Cookers", qco: true }, { id: "IS 17803:2022", title: "Vacuum Flasks", qco: true }, { id: "IS 17526:2021", title: "Single-Walled Bottles", qco: true }] },
    { title: "Household Electrical Safety", count: 5, standards: [{ id: "IS 302 (Part 2/Sec 21):2024", title: "Geysers", qco: true }, { id: "IS 302-2-15:2009", title: "Electric Kettles", qco: true }, { id: "IS 1293:2019", title: "Plugs & Sockets", qco: true }] },
    { title: "Footwear & Sports Goods", count: 3, standards: [{ id: "IS 15844 (Part 1):2023", title: "Sports Footwear", qco: true }, { id: "IS 15844 (Part 3):2024", title: "Leather Footwear", qco: true }] },
    { title: "Public Health, Food & Water", count: 4, standards: [{ id: "IS 10500:2012", title: "Drinking Water", qco: true }, { id: "IS 14543:2004", title: "Packaged Water", qco: true }, { id: "IS 15410:2003", title: "Containers", qco: true }] },
    { title: "Automotive Safety & Helmets", count: 2, standards: [{ id: "IS 4151:2015", title: "Two Wheeler Helmets", qco: true }, { id: "IS 3196:2013", title: "LPG Cylinders", qco: true }] },
    { title: "Medical & Healthcare Devices", count: 2, standards: [{ id: "IS 18266:2023", title: "Respirators", qco: true }, { id: "IS 80601-2-30:2018", title: "Sphygmomanometers", qco: true }] }
  ];

  const sectorGroups = content?.sector_groups && content.sector_groups.length > 0
    ? content.sector_groups
    : defaultCategories;

  const filteredGroups = sectorGroups.map(cat => {
    if (!search.trim()) return cat;
    const q = search.toLowerCase();
    const matchingStandards = (cat.standards || []).filter(std => {
      const text = typeof std === 'string' ? std : `${std.id || ''} ${std.title || ''}`;
      return text.toLowerCase().includes(q);
    });
    return {
      ...cat,
      standards: matchingStandards,
      count: matchingStandards.length
    };
  }).filter(cat => !search.trim() || cat.standards.length > 0 || cat.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Content & Standards Knowledge Base
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official Bureau standards catalog, gazetted QCO orders, and technical testing matrices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Overview Cards with Live Document Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0d1424] border border-blue-500/30 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verified Standards</span>
          <p className="text-2xl font-black text-white mt-1">
            {content?.indexed_standards ?? 24} Gazette Standards
          </p>
          <p className="text-xs text-blue-400 mt-0.5">High-density chunk indexed in MongoDB</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d1424] border border-amber-500/30 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mandatory QCO Orders</span>
          <p className="text-2xl font-black text-white mt-1">
            {content?.qco_advisories_count ?? 8} Active Mandates
          </p>
          <p className="text-xs text-amber-400 mt-0.5">Strict legal conformity required</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d1424] border border-emerald-500/30 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered CML Licenses</span>
          <p className="text-2xl font-black text-white mt-1">
            {content?.registered_licences_count ?? 11} Registries
          </p>
          <p className="text-xs text-emerald-400 mt-0.5">Active ISI manufacturer licences</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#0d1424] border border-slate-800">
        <Search size={16} className="text-slate-500 ml-1" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter standards by IS code, product title, or keyword..."
          className="bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none w-full"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
          >
            Clear
          </button>
        )}
      </div>

      {/* Regulated Sector Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Regulated Sectors & Standard Mappings</h2>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredGroups.length} sectors
          </span>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="p-8 text-center bg-[#0d1424] border border-slate-800 rounded-2xl">
            <p className="text-sm text-slate-400">No standards found matching "{search}".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGroups.map((cat, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-xs">{cat.title}</h3>
                  <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 text-[10px] font-bold border border-blue-800/60">
                    {cat.standards?.length ?? cat.count} Standards
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 max-h-60 overflow-y-auto pr-1">
                  {(cat.standards || []).map((std, i) => {
                    const isObj = typeof std === 'object';
                    const stdId = isObj ? std.id : std;
                    const stdTitle = isObj && std.title ? ` — ${std.title}` : '';
                    const isQco = isObj ? std.qco : true;

                    return (
                      <div key={i} className="p-2 rounded-xl bg-[#090e1c] border border-slate-800/80 flex items-center justify-between gap-2 hover:border-slate-700 transition-colors">
                        <span className="font-mono text-blue-400 font-semibold truncate text-[11px]">
                          {stdId}{stdTitle}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                          isQco
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isQco ? 'QCO Mandatory' : 'Standard'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

