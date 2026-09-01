import React from 'react';
import { Home, BookOpen, ShieldCheck, FileCheck, BadgeCheck, Sparkles, Scale, Bell, Headphones, X } from 'lucide-react';

export default function Sidebar({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  onOpenHelp
}) {
  const navigationItems = [
    { id: 'home', label: 'Home', icon: <Home size={18} /> },
    { id: 'standards', label: 'Standards', icon: <BookOpen size={18} /> },
    { id: 'compliance', label: 'Compliance', icon: <ShieldCheck size={18} /> },
    { id: 'documents', label: 'Documents', icon: <FileCheck size={18} /> },
    { id: 'verification', label: 'Verification', icon: <BadgeCheck size={18} /> },
    { id: 'assistant', label: 'AI Assistant', icon: <Sparkles size={18} /> },
    { id: 'compare', label: 'Compare', icon: <Scale size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Main Left Sidebar */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-60 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          
          {/* Mobile Close Button Area */}
          <div className="p-3 border-b border-slate-100 flex items-center justify-between lg:hidden">
            <span className="text-xs font-bold text-slate-800">Navigation</span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Items (Starting with Home at top, strictly named Compliance) */}
          <nav className="p-3 space-y-1.5 pt-4">
            {navigationItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onTabChange(item.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#0b2545] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Need Help Card + BIS Authority Card */}
        <div className="p-3 space-y-3 border-t border-slate-100 bg-white shrink-0">
          
          {/* Need Help? Card */}
          <div
            onClick={() => {
              onTabChange('assistant');
              if (window.innerWidth < 1024) onClose();
            }}
            className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 cursor-pointer transition-all flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#0b2545] flex items-center justify-center shrink-0">
                <Headphones size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 leading-tight">Need Help?</p>
                <p className="text-[10px] text-slate-500 truncate">Ask BIS Sahayak</p>
              </div>
            </div>
            <span className="text-slate-400 text-xs font-bold">›</span>
          </div>

          {/* Bureau of Indian Standards Official Authority Card with Tricolor Accent */}
          <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-8 shrink-0 flex items-center justify-center font-serif text-slate-800 text-sm font-black border border-slate-300 rounded bg-white shadow-2xs">
                🏛️
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="text-[10px] font-bold text-slate-800 leading-tight">
                  Empowering Compliance. Simplifying Standards.
                </p>
                <p className="text-[9px] text-slate-500 leading-snug">
                  Your trusted partner for BIS compliance.
                </p>
              </div>
            </div>

            {/* Tricolor Accent Bar */}
            <div className="flex h-1 w-full rounded-full overflow-hidden">
              <div className="w-1/3 bg-orange-500"></div>
              <div className="w-1/3 bg-white"></div>
              <div className="w-1/3 bg-emerald-600"></div>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}
