import React, { useState, useEffect } from 'react';
import { Layers, Search, BookOpen, ShieldAlert, CheckCircle2, RefreshCw, ExternalLink } from 'lucide-react';
import { getAdminContent } from '../../services/api';

export default function AdminContent() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminContent()
      .then(data => setContent(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const standardCategories = [
    { title: "Consumer Goods & Kitchen Utensils", count: 4, standards: ["IS 2347:2017 (Pressure Cookers)", "IS 17803:2022 (Vacuum Flasks)", "IS 17526:2021 (Single-Walled Bottles)"] },
    { title: "Household Electrical Safety", count: 5, standards: ["IS 302 (Part 2/Sec 21):2024 (Geysers)", "IS 302-2-15:2009 (Electric Kettles)", "IS 1293:2019 (Plugs & Sockets)"] },
    { title: "Footwear & Sports Goods", count: 3, standards: ["IS 15844 (Part 1):2023 (Sports Footwear)", "IS 15844 (Part 3):2024 (Leather Footwear)"] },
    { title: "Public Health, Food & Water", count: 4, standards: ["IS 10500:2012 (Drinking Water)", "IS 14543:2004 (Packaged Water)", "IS 15410:2003 (Containers)"] },
    { title: "Automotive Safety & Helmets", count: 2, standards: ["IS 4151:2015 (Two Wheeler Helmets)", "IS 3196:2013 (LPG Cylinders)"] },
    { title: "Medical & Healthcare Devices", count: 2, standards: ["IS 18266:2023 (Respirators)", "IS 80601-2-30:2018 (Sphygmomanometers)"] }
  ];

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
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0d1424] border border-blue-500/30">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Verified Standards</span>
          <p className="text-2xl font-black text-white mt-1">24 Gazette Standards</p>
          <p className="text-xs text-blue-400 mt-0.5">High-density chunk indexed</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d1424] border border-amber-500/30">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Mandatory QCO Orders</span>
          <p className="text-2xl font-black text-white mt-1">8 Active Mandates</p>
          <p className="text-xs text-amber-400 mt-0.5">Strict legal compliance required</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0d1424] border border-emerald-500/30">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Registered CML Licenses</span>
          <p className="text-2xl font-black text-white mt-1">11 Seed Registries</p>
          <p className="text-xs text-emerald-400 mt-0.5">Active ISI manufacturer licences</p>
        </div>
      </div>

      {/* Regulated Sector Categories */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Regulated Sectors & Standard Mappings</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {standardCategories.map((cat, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-xs">{cat.title}</h3>
                <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 text-[10px] font-bold border border-blue-800/60">
                  {cat.count} Standards
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                {cat.standards.map((std, i) => (
                  <div key={i} className="p-2 rounded-xl bg-[#090e1c] border border-slate-800/80 flex items-center justify-between">
                    <span className="font-mono text-blue-400 font-semibold">{std}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">QCO Active</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
