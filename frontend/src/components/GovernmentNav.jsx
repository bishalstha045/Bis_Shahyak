import React from 'react';
import { Home, BookOpen, ShieldCheck, FileCheck, BadgeCheck, GitCompare, Sparkles, HelpCircle } from 'lucide-react';

export default function GovernmentNav({ activeTab, onTabChange, indexedCount = 21 }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: <Home size={15} /> },
    { id: 'standards', label: 'Standards', icon: <BookOpen size={15} /> },
    { id: 'compliance', label: 'Compliance', icon: <ShieldCheck size={15} /> },
    { id: 'documents', label: 'Documents', icon: <FileCheck size={15} /> },
    { id: 'verification', label: 'Verification', icon: <BadgeCheck size={15} /> },
    { id: 'compare', label: 'Compare', icon: <GitCompare size={15} /> },
    { id: 'assistant', label: 'AI Assistant', icon: <Sparkles size={15} /> },
  ];

  return (
    <nav className="bg-[#0b2545] text-slate-200 border-b border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto no-scrollbar">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 py-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white/15 text-white border-b-2 border-orange-500'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className={isActive ? 'text-orange-400' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Knowledge Status */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-300 pl-4">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{indexedCount} Standards Indexed</span>
        </div>

      </div>
    </nav>
  );
}
