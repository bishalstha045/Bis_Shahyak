import React, { useState } from 'react';
import { Bell, AlertTriangle, FileText, Building2, CheckCircle2, Filter, Sparkles, ExternalLink, ArrowRight, Check, X, ShieldAlert, BookOpen, Upload, Calendar, Settings, FileCheck, Layers, Beaker, Users } from 'lucide-react';

export default function NotificationsView({
  onNavigate,
  onCheckComplianceForStandard,
  onAskAIAboutStandard,
  onOpenEvidence
}) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'qco' | 'amendments' | 'impact' | 'labs'
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      type: 'qco',
      badge: 'MANDATORY QCO ORDER',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      title: 'Quality Control Order Enforcement: IS 17803:2022 (Stainless Steel Water Bottles)',
      authority: 'Ministry of Commerce & Industry (DPIIT) • Gazette S.O. 4521(E)',
      date: '28 Aug 2026',
      unread: true,
      nodeColor: 'bg-rose-500',
      lineColor: 'border-rose-200',
      iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
      icon: <FileText size={18} />,
      impact: 'High Impact on Registered Product',
      description: 'Mandatory BIS ISI certification deadline has been confirmed for 15 October 2026. Production, stocking, or sale of non-ISI marked stainless steel bottles is prohibited under Section 16 of the BIS Act 2016.',
      actionPrimary: { label: 'Check Readiness (68%) →', target: 'compliance' },
      actionSecondary: { label: 'Ask AI About Grace Period', query: 'What is the grace period and penalty for non-compliance under IS 17803:2022 QCO?' }
    },
    {
      id: 'notif-2',
      type: 'amendments',
      badge: 'TECHNICAL AMENDMENT',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      title: 'Amendment No. 1 to IS 17803:2022 Published by MED-18',
      authority: 'Bureau of Indian Standards • Mechanical Engineering Department',
      date: '21 Aug 2026',
      unread: true,
      nodeColor: 'bg-blue-500',
      lineColor: 'border-blue-200',
      iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
      icon: <FileCheck size={18} />,
      impact: 'Direct Requirement Change',
      description: 'Clause 5.2.1 migration test limits for heavy metals (Lead & Cadmium) have been updated to align with global food-contact safety standards (ISO 8124). Testing protocols for caps and seals have been refined.',
      actionPrimary: { label: 'Compare Standard Diff →', target: 'compare' },
      actionSecondary: { label: 'Ask AI Details', query: 'Explain the changes in Amendment No. 1 of IS 17803:2022 and how it affects manufacturer testing.' }
    },
    {
      id: 'notif-3',
      type: 'impact',
      badge: 'ASSESSMENT GAP ALERT',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      title: 'Missing Evidence for Clause 5.2.1 Safety Performance Test',
      authority: 'BIS Sahayak Compliance Engine',
      date: '20 Aug 2026',
      unread: true,
      nodeColor: 'bg-amber-500',
      lineColor: 'border-amber-200',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
      icon: <Beaker size={18} />,
      impact: 'Action Required',
      description: 'Your registered product "Stainless Steel Water Bottle" currently lacks an uploaded test report from a BIS-recognized NABL laboratory. Uploading this evidence will elevate your compliance readiness score from 68% to 88%.',
      actionPrimary: { label: 'Upload Test Report →', target: 'documents' },
      actionSecondary: { label: 'View Checklist', target: 'compliance' }
    },
    {
      id: 'notif-4',
      type: 'labs',
      badge: 'LAB INFRASTRUCTURE',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      title: '4 New BIS-Recognized Testing Laboratories Empaneled',
      authority: 'BIS Central Marks Department (CMD-III)',
      date: '15 Aug 2026',
      unread: false,
      nodeColor: 'bg-emerald-500',
      lineColor: 'border-emerald-200',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      icon: <Building2 size={18} />,
      impact: 'Faster Testing Turnaround',
      description: 'Accredited NABL test facilities in Manesar, Bengaluru, Pune, and Ahmedabad have been approved for rapid turnaround sample testing for electrical appliances (IS 302-1) and consumer containers (IS 17803).',
      actionPrimary: { label: 'Ask AI for Lab Directory →', query: 'List BIS-recognized laboratories for testing stainless steel bottles and electrical appliances near Delhi NCR and Maharashtra.' },
      actionSecondary: null
    },
    {
      id: 'notif-5',
      type: 'training',
      badge: 'MSME CAPACITY BUILDING',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      title: 'National Virtual Workshop on BIS Conformity Assessment Scheme-I',
      authority: 'National Institute of Training for Standardization (NITS)',
      date: '10 Aug 2026',
      unread: false,
      nodeColor: 'bg-purple-500',
      lineColor: 'border-purple-200',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
      icon: <Users size={18} />,
      impact: 'Capacity Building & Subsidies',
      description: 'Free interactive session for MSME manufacturers explaining Scheme of Inspection and Testing (STI), ManakOnline portal filing, and government testing fee concessions (up to 50% for Micro & Women enterprises).',
      actionPrimary: { label: 'Ask AI About MSME Concessions →', query: 'What are the BIS fee concessions and subsidies available for MSMEs under the ManakOnline scheme?' },
      actionSecondary: null
    }
  ]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const toggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: !n.unread } : n));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const filteredNotifications = notifications.filter(n => {
    if (unreadOnly && !n.unread) return false;
    if (activeFilter === 'all') return true;
    if (activeFilter === 'qco') return n.type === 'qco';
    if (activeFilter === 'amendments') return n.type === 'amendments';
    if (activeFilter === 'impact') return n.type === 'impact';
    if (activeFilter === 'labs') return n.type === 'labs' || n.type === 'training';
    return true;
  });

  const handleAction = (action) => {
    if (!action) return;
    if (action.target && onNavigate) {
      onNavigate(action.target);
    } else if (action.query && onAskAIAboutStandard) {
      onAskAIAboutStandard({ id: 'Regulatory Notification', title: action.query });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#fbfcfd] p-4 sm:p-6 lg:p-8 animate-fade-in font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ========================================================================= */}
        {/* 1. HEADER WITH STATS & ACTION BUTTONS                                     */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-[#0b2545] tracking-tight">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white shadow-xs">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Stay updated with statutory amendments, QCO mandates, lab empanelments, and personalized compliance alerts.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={markAllAsRead}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Check size={13} />
              <span>Mark All as Read</span>
            </button>
            <button
              type="button"
              onClick={() => onAskAIAboutStandard({ id: 'Gazette Summary', title: 'Give me a summary of all active BIS QCO deadlines affecting Indian manufacturing in 2026' })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white text-xs font-bold transition-all shadow-md"
            >
              <Sparkles size={13} />
              <span>AI Impact Report</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. FILTER TABS & UNREAD ONLY CHECKBOX                                     */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
          
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'All Notifications', icon: '💼' },
              { id: 'qco', label: 'QCO Mandates', icon: '📑' },
              { id: 'amendments', label: 'Amendments', icon: '📄' },
              { id: 'impact', label: 'My Product Impact', icon: '⚠️' },
              { id: 'labs', label: 'Labs & Training', icon: '🧪' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilter === tab.id
                    ? 'bg-[#0b2545] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-2xs'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 shrink-0">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded border-slate-300 text-[#0b2545] focus:ring-0 w-3.5 h-3.5"
            />
            <span>Unread Only</span>
          </label>
        </div>

        {/* ========================================================================= */}
        {/* 3. TIMELINE NOTIFICATIONS FEED                                            */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <div key={notif.id} className="relative pl-6 sm:pl-8 group">
                
                {/* Vertical Timeline Line & Node */}
                <div className={`absolute left-2.5 top-0 bottom-0 w-0.5 ${notif.lineColor} group-last:bottom-1/2`}></div>
                <div className={`absolute left-1.5 top-6 w-2.5 h-2.5 rounded-full ${notif.nodeColor} ring-4 ring-white shadow-2xs`}></div>

                {/* Main Notification Card */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-3.5 hover:border-slate-300 transition-all">
                  
                  {/* Top Bar: Icon + Badge + Authority + Date & Dot */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-2xl border ${notif.iconBg} flex items-center justify-center shrink-0 shadow-2xs mt-0.5`}>
                        {notif.icon}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${notif.badgeClass}`}>
                            {notif.badge}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {notif.authority}
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                          {notif.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-xs">
                      <span className="text-[11px] text-slate-400 font-medium">{notif.date}</span>
                      {notif.unread && (
                        <span className={`w-2 h-2 rounded-full ${notif.nodeColor}`}></span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed font-normal pl-0 sm:pl-13">
                    {notif.description}
                  </p>

                  {/* Bottom Impact Chip & Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-0 sm:pl-13">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-orange-700 bg-orange-50/80 px-2.5 py-1 rounded-xl border border-orange-200/80 w-fit shadow-2xs">
                      <AlertTriangle size={12} className="text-orange-600" />
                      <span>{notif.impact}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {notif.actionSecondary && (
                        <button
                          type="button"
                          onClick={() => handleAction(notif.actionSecondary)}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors shadow-2xs"
                        >
                          {notif.actionSecondary.label}
                        </button>
                      )}

                      {notif.actionPrimary && (
                        <button
                          type="button"
                          onClick={() => handleAction(notif.actionPrimary)}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white font-bold text-xs transition-all shadow-xs"
                        >
                          <span>{notif.actionPrimary.label}</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            ))
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <Bell size={28} className="mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-700">No notifications found</p>
              <p className="text-[11px] text-slate-400">You are completely up to date with all BIS gazette mandates and alerts.</p>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. BOTTOM AUTOMATED REGULATORY WATCHDOG CARD                              */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 rounded-3xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0b2545] text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-xs">
              ⚡
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-[#0b2545]">Automated Regulatory Watchdog</h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                BIS Sahayak continuously monitors the Official Gazette of India and BIS Technical Committees to notify you before compliance deadlines.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onAskAIAboutStandard({ id: 'Regulatory Watchdog', title: 'How does BIS Sahayak monitor Gazette changes and what are upcoming deadlines for consumer goods?' })}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs shadow-2xs transition-colors shrink-0 flex items-center gap-1.5"
          >
            <Settings size={13} className="text-slate-500" />
            <span>Configure Watchdog</span>
          </button>
        </div>

      </div>
    </div>
  );
}
