import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, FileText, Building2, CheckCircle2, Filter, Sparkles, ExternalLink, ArrowRight, Check, X, ShieldAlert, BookOpen, Upload, Calendar, Settings, FileCheck, Layers, Beaker, Users, Award, ShieldCheck, XCircle, RefreshCw, Stamp } from 'lucide-react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';

export default function NotificationsView({
  onNavigate,
  onCheckComplianceForStandard,
  onAskAIAboutStandard,
  onOpenEvidence
}) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'verification' | 'qco' | 'amendments' | 'impact' | 'labs'
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLiveNotifications = async () => {
    try {
      const data = await getNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (e) {
      console.warn("Failed to load notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveNotifications();
    const interval = setInterval(fetchLiveNotifications, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleToggleRead = async (id, currentUnread) => {
    if (currentUnread) {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => (n.id === id || n._id === id) ? { ...n, unread: false } : n));
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const filteredNotifications = notifications.filter(n => {
    if (unreadOnly && !n.unread) return false;
    if (activeFilter === 'all') return true;
    if (activeFilter === 'verification') return n.type === 'verification' || n.type === 'licence';
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
              { id: 'verification', label: 'Verifications & Licences', icon: '🏛️' },
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
          {loading ? (
            <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
              <RefreshCw size={24} className="text-blue-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500">Loading statutory updates...</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => {
              const isVerificationApproved = notif.badge === 'VERIFICATION APPROVED' || notif.type === 'licence';
              const isVerificationRejected = notif.badge === 'VERIFICATION REJECTED';

              const icon = isVerificationApproved ? (
                <Award size={18} />
              ) : isVerificationRejected ? (
                <XCircle size={18} />
              ) : notif.type === 'amendments' ? (
                <FileCheck size={18} />
              ) : notif.type === 'labs' ? (
                <Building2 size={18} />
              ) : notif.type === 'impact' ? (
                <Beaker size={18} />
              ) : (
                <FileText size={18} />
              );

              const iconBg = isVerificationApproved
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : isVerificationRejected
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : notif.iconBg || 'bg-blue-50 text-blue-600 border-blue-200';

              const nodeColor = isVerificationApproved
                ? 'bg-emerald-500'
                : isVerificationRejected
                ? 'bg-rose-500'
                : notif.nodeColor || 'bg-blue-500';

              const lineColor = isVerificationApproved
                ? 'border-emerald-200'
                : isVerificationRejected
                ? 'border-rose-200'
                : notif.lineColor || 'border-blue-200';

              const badgeClass = isVerificationApproved
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isVerificationRejected
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : notif.badge_class || notif.badgeClass || 'bg-blue-50 text-blue-700 border-blue-200';

              const impactText = isVerificationApproved
                ? 'Official ISI Marking Licence Granted'
                : isVerificationRejected
                ? 'Compliance Deficiency Action Required'
                : notif.impact || 'Statutory Compliance Notice';

              const primaryAction = notif.action_primary || notif.actionPrimary || (isVerificationApproved ? { label: 'View Issued Licence →', target: 'verification' } : isVerificationRejected ? { label: 'Review Deficiencies & Rectify →', target: 'compliance' } : null);
              const secondaryAction = notif.action_secondary || notif.actionSecondary || (isVerificationRejected ? { label: 'Ask AI How to Rectify', query: `How do I resolve this BIS deficiency under statutory standards: "${notif.description}"?` } : null);

              return (
                <div key={notif.id || notif._id} className="relative pl-6 sm:pl-8 group">
                  {/* Vertical Timeline Line & Node */}
                  <div className={`absolute left-2.5 top-0 bottom-0 w-0.5 ${lineColor} group-last:bottom-1/2`}></div>
                  <div className={`absolute left-1.5 top-6 w-2.5 h-2.5 rounded-full ${nodeColor} ring-4 ring-white shadow-2xs`}></div>

                  {/* Main Notification Card */}
                  <div className={`bg-white rounded-3xl border shadow-sm p-5 sm:p-6 space-y-3.5 transition-all ${
                    isVerificationApproved
                      ? 'border-emerald-200 hover:border-emerald-300'
                      : isVerificationRejected
                      ? 'border-rose-200 hover:border-rose-300'
                      : notif.unread
                      ? 'border-blue-200/90'
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}>
                    {/* Top Bar: Icon + Badge + Authority + Date & Dot */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-2xl border ${iconBg} flex items-center justify-center shrink-0 shadow-2xs mt-0.5`}>
                          {icon}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${badgeClass}`}>
                              {notif.badge}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400">
                              {notif.authority || 'Bureau of Indian Standards'}
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
                          <button
                            type="button"
                            onClick={() => handleToggleRead(notif.id || notif._id, notif.unread)}
                            className={`w-2.5 h-2.5 rounded-full ${nodeColor} hover:opacity-75 transition-opacity`}
                            title="Mark as read"
                          />
                        )}
                      </div>
                    </div>

                    {/* Special Officer Feedback Callout for Rejected Applications */}
                    {isVerificationRejected && (
                      <div className="p-4 rounded-2xl bg-rose-50/90 border border-rose-200/90 text-rose-950 text-xs space-y-2 ml-0 sm:ml-13 shadow-2xs">
                        <div className="flex items-center gap-1.5 font-bold text-rose-800">
                          <AlertTriangle size={15} className="text-rose-600 shrink-0" />
                          <span>Regulatory Officer Feedback & Deficiency Details:</span>
                        </div>
                        <p className="font-mono text-[11px] text-rose-900 bg-white/90 p-3 rounded-xl border border-rose-200/80 leading-relaxed font-semibold">
                          {notif.description}
                        </p>
                      </div>
                    )}

                    {/* Special Success Callout for Approved Applications */}
                    {isVerificationApproved && (
                      <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 text-emerald-950 text-xs space-y-2 ml-0 sm:ml-13 shadow-2xs">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                          <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                          <span>Official ISI Certification Granted:</span>
                        </div>
                        <p className="text-[11px] text-emerald-900 bg-white/90 p-3 rounded-xl border border-emerald-200/80 leading-relaxed font-semibold">
                          {notif.description}
                        </p>
                      </div>
                    )}

                    {/* Standard Description (for general notices) */}
                    {!isVerificationRejected && !isVerificationApproved && (
                      <p className="text-xs text-slate-600 leading-relaxed font-normal pl-0 sm:pl-13">
                        {notif.description}
                      </p>
                    )}

                    {/* Bottom Impact Chip & Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-0 sm:pl-13">
                      <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-xl border w-fit shadow-2xs ${
                        isVerificationApproved
                          ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                          : isVerificationRejected
                          ? 'text-rose-800 bg-rose-50 border-rose-200'
                          : 'text-orange-700 bg-orange-50/80 border-orange-200/80'
                      }`}>
                        {isVerificationApproved ? (
                          <Award size={13} className="text-emerald-600" />
                        ) : isVerificationRejected ? (
                          <AlertTriangle size={13} className="text-rose-600" />
                        ) : (
                          <AlertTriangle size={13} className="text-orange-600" />
                        )}
                        <span>{impactText}</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {secondaryAction && (
                          <button
                            type="button"
                            onClick={() => handleAction(secondaryAction)}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                          >
                            <Sparkles size={12} className="text-blue-600" />
                            <span>{secondaryAction.label}</span>
                          </button>
                        )}

                        {primaryAction && (
                          <button
                            type="button"
                            onClick={() => handleAction(primaryAction)}
                            className={`px-4 py-1.5 rounded-xl text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                              isVerificationApproved
                                ? 'bg-emerald-600 hover:bg-emerald-500'
                                : isVerificationRejected
                                ? 'bg-rose-600 hover:bg-rose-500'
                                : 'bg-[#0b2545] hover:bg-[#133b68]'
                            }`}
                          >
                            <span>{primaryAction.label}</span>
                            <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
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
