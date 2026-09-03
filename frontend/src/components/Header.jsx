import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, HelpCircle, Bell, User, LogOut, Globe, ChevronRight, Menu, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, ChevronDown } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

export default function Header({
  language,
  onLanguageChange,
  onOpenHelp,
  onOpenAuthModal,
  auth,
  onMenuClick,
  onTabChange
}) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // When a user logs in or switches, resolve unread notifications for a clean state
  useEffect(() => {
    setUnreadCount(0);
  }, [auth?.user?.id]);

  // Click outside listener for notification dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleNotifications = () => {
    setShowNotifDropdown(!showNotifDropdown);
    // User interacted with notifications, clear the active badge indicator
    setUnreadCount(0);
  };

  const quickNotifications = [
    {
      id: 1,
      title: 'IS 17803 Mandatory QCO Notification',
      badge: 'QCO Mandate',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      desc: 'Quality Control Order published. Compliance mandatory by 01 July 2026.',
      time: '10m ago',
      target: 'compliance'
    },
    {
      id: 2,
      title: 'ISI Licence CM/L-7128394 Renewal Due',
      badge: 'Licence Expiry',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      desc: 'Licence validity expires in 45 days. Submit Form V audit report.',
      time: '3h ago',
      target: 'verification'
    },
    {
      id: 3,
      title: 'New NABL Test Report Analyzed',
      badge: 'Document Evidence',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      desc: 'Readiness at 75%. Uploading Clause 8.1 report increases score to 95%.',
      time: '2d ago',
      target: 'documents'
    }
  ];

  return (
    <header className="w-full bg-white border-b border-slate-200/90 sticky top-0 z-30 shrink-0 shadow-2xs font-sans select-none">
      <div className="px-4 sm:px-8 lg:px-10 py-2.5 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo + Divider */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors"
            title="Toggle Menu"
          >
            <Menu size={20} />
          </button>

          <div
            className="flex items-center cursor-pointer py-0.5 transition-transform hover:scale-[1.01]"
            onClick={() => onTabChange && onTabChange('home')}
            title="BIS Sahayak - Return to Home"
          >
            <img
              src="/bis-sahayak-logo.png"
              alt="BIS Sahayak"
              className="h-9 sm:h-10 w-auto object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          </div>

          <div className="hidden sm:block h-6 w-px bg-slate-200 ml-1"></div>
        </div>

        {/* Center: "Standards Guide the Nation" Card */}
        <div
          onClick={() => onTabChange && onTabChange('compliance')}
          className="hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 cursor-pointer transition-all shadow-2xs group"
          title="Explore Standards & Compliance Studio"
        >
          <div className="w-7 h-7 rounded-xl bg-[#0b2545] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <Sparkles size={14} />
          </div>
          <div className="text-left leading-tight">
            <p className="text-xs font-bold text-slate-900">Standards Guide the Nation</p>
            <p className="text-[10px] text-slate-600 font-medium">सही मानक, सुरक्षित भारत</p>
            <div className="flex items-center gap-0.5 mt-0.5 w-12 h-0.5 rounded-full overflow-hidden">
              <span className="flex-1 h-full bg-[#ea580c]"></span>
              <span className="flex-1 h-full bg-[#e2e8f0]"></span>
              <span className="flex-1 h-full bg-[#16a34a]"></span>
            </div>
          </div>
          <span className="text-slate-400 text-xs font-bold pl-1 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all">
            ›
          </span>
        </div>

        {/* Right: Language Selector, Help, Notifications, Sign In / Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 text-xs font-semibold text-slate-700">
          
          {/* Language Selector */}
          <LanguageSelector language={language} onChange={onLanguageChange} />

          {/* Help Button */}
          <button
            type="button"
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 text-slate-700 hover:text-[#0b2545] transition-colors py-1.5 px-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200"
          >
            <HelpCircle size={15} className="text-slate-500" />
            <span>Help</span>
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={handleToggleNotifications}
              className={`relative p-2 text-slate-600 hover:text-[#0b2545] transition-colors rounded-xl border ${
                showNotifDropdown ? 'bg-slate-100 text-[#0b2545] border-slate-200' : 'hover:bg-slate-50 border-transparent'
              }`}
              title="Notifications"
            >
              <Bell size={17} />
              
              {/* Red Badge Indicator */}
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-2xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 space-y-3 z-50 animate-fade-in text-xs font-normal">
                <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-100 font-bold">
                  <div className="flex items-center gap-2 text-slate-900">
                    <span className="text-sm font-bold">Notifications</span>
                    {unreadCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                        {unreadCount} New
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">
                        All Caught Up
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotifDropdown(false);
                      onTabChange && onTabChange('notifications');
                    }}
                    className="text-[11px] text-[#0b2545] font-bold hover:underline"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {quickNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        setShowNotifDropdown(false);
                        onTabChange && onTabChange(notif.target);
                      }}
                      className="p-3 rounded-xl bg-slate-50/80 hover:bg-blue-50/70 border border-slate-100 hover:border-blue-200 transition-all cursor-pointer space-y-1 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${notif.badgeClass}`}>
                          {notif.badge}
                        </span>
                        <span className="text-[10px] text-slate-400">{notif.time}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight group-hover:text-[#0b2545]">
                        {notif.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {notif.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowNotifDropdown(false);
                    onTabChange && onTabChange('notifications');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Open Notification Center</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>

          {/* User Profile / Sign In Button */}
          {auth?.user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#0b2545] text-white flex items-center justify-center text-xs font-black shadow-xs shrink-0">
                {auth.user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AS'}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                  {auth.user.full_name}
                </span>
                <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                  {auth.user.company_name || 'Alpha Stainless Works...'}
                </span>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
              <button
                type="button"
                onClick={() => auth.logout()}
                className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors ml-1 rounded-lg hover:bg-rose-50"
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white text-xs font-bold transition-all shadow-xs"
            >
              <User size={15} />
              <span>Sign In</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
