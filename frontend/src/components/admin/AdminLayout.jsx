import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  FileText,
  Users,
  Layers,
  Activity,
  Settings,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Building2,
  CheckCircle2,
  Database,
  Cpu,
  Bell,
  ChevronRight,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { checkHealth } from '../../services/api';

export default function AdminLayout({
  activeSubRoute = 'dashboard',
  onSubRouteChange,
  onExitToManufacturer,
  onLogout,
  adminUser,
  children
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [systemHealth, setSystemHealth] = useState({
    db: 'Connected',
    rag: 'Online',
    standards: 24
  });

  useEffect(() => {
    checkHealth().then(data => {
      if (data) {
        setSystemHealth({
          db: data.database?.connected ? (data.database?.engine || 'Connected') : 'Offline',
          rag: data.rag_engine?.status === 'healthy' ? 'Healthy' : 'Standalone',
          standards: data.rag_engine?.indexed_standards_count || 24
        });
      }
    }).catch(() => {});
  }, []);

  const navGroups = [
    {
      group: "MAIN",
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} /> }
      ]
    },
    {
      group: "MODERATION",
      items: [
        { id: 'verification', label: 'Verification', icon: <ShieldCheck size={17} /> },
        { id: 'reports', label: 'Reports', icon: <FileText size={17} /> }
      ]
    },
    {
      group: "MANAGEMENT",
      items: [
        { id: 'users', label: 'Users', icon: <Users size={17} /> },
        { id: 'content', label: 'Content', icon: <Layers size={17} /> }
      ]
    },
    {
      group: "SYSTEM",
      items: [
        { id: 'activity', label: 'Activity Logs', icon: <Activity size={17} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={17} /> }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex font-sans select-none overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Dedicated Admin Sidebar */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#0d1424] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Top Brand Area */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-[#0b2545] border border-blue-400/30 text-white flex items-center justify-center font-black shadow-md shrink-0">
                🏛️
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.2 rounded bg-amber-400/15 text-amber-400 border border-amber-400/30">
                    DIRECTORATE
                  </span>
                </div>
                <h2 className="text-sm font-black text-white truncate">ADMIN CONTROL</h2>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links Grouped */}
          <nav className="p-3 space-y-4">
            {navGroups.map((grp) => (
              <div key={grp.group} className="space-y-1">
                <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {grp.group}
                </p>
                {grp.items.map((item) => {
                  const isActive = activeSubRoute === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSubRouteChange(item.id);
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isActive ? 'text-white' : 'text-slate-500'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight size={14} className="text-white/70" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer: Admin Profile & Actions */}
        <div className="p-3 border-t border-slate-800 bg-[#0a101d] space-y-2.5 shrink-0">
          {/* Admin User Card */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#0d1424] border border-slate-800">
            <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-black shadow-xs shrink-0">
              {adminUser?.full_name ? adminUser.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'RV'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {adminUser?.full_name || 'Dr. Rajesh Verma'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {adminUser?.email || 'admin@bis.gov.in'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              type="button"
              onClick={onExitToManufacturer}
              className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Return to Public Manufacturer App"
            >
              <ArrowLeft size={13} />
              <span>Public Site</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="py-1.5 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Sign Out of Administrator Session"
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Command Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#070b14]">
        {/* Top Command Bar */}
        <header className="h-14 px-4 sm:px-6 bg-[#0d1424] border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden cursor-pointer"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Admin</span>
              <span className="text-slate-600">/</span>
              <span className="text-white font-bold capitalize">{activeSubRoute}</span>
            </div>
          </div>

          {/* Right Status Pill & Actions */}
          <div className="flex items-center gap-3 text-xs">
            {/* Database & RAG Live Telemetry */}
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#090e1c] border border-slate-800 text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>DB: {systemHealth.db}</span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                <Cpu size={12} />
                <span>RAG Engine: {systemHealth.rag} ({systemHealth.standards} stds)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onExitToManufacturer}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">View Public Portal</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
