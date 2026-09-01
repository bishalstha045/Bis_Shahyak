import React from 'react';
import { HelpCircle, User, LogIn, LogOut, ExternalLink, Shield } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

export default function GovernmentHeader({
  language,
  onLanguageChange,
  auth,
  onOpenAuthModal,
  onOpenHelp
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Top Tricolor Government Accent Stripe */}
      <div className="gov-tricolor-bar w-full" />

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Left Brand Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#0b2545] text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
            BIS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-slate-900 tracking-tight">
                BIS Sahayak
              </span>
              <span className="text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                AI Assistant
              </span>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded hidden sm:inline">
                SIH 2026
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium -mt-0.5 hidden sm:block">
              AI-Powered BIS Compliance Assistant & Decision Navigator
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          
          {/* Language Selector */}
          <LanguageSelector language={language} onChange={onLanguageChange} />

          {/* Help & Documentation Modal Trigger */}
          <button
            type="button"
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Platform Guide & FAQ"
          >
            <HelpCircle size={14} className="text-slate-500" />
            <span className="hidden md:inline">Guide & Help</span>
          </button>

          {/* User Account / Sign In */}
          {auth?.user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 leading-tight">{auth.user.full_name}</span>
                <span className="text-[10px] text-slate-500 truncate max-w-[140px]">{auth.user.company_name}</span>
              </div>
              <button
                type="button"
                onClick={() => auth.logout()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0b2545] hover:bg-[#133b68] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
