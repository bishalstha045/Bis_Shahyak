import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Lock, ArrowLeft, ArrowRight, UserCheck, KeyRound, AlertTriangle, Building2, CheckCircle2 } from 'lucide-react';

export default function AdminAuthGate({
  auth,
  onExitToManufacturer,
  onAdminAuthenticated
}) {
  const [emailInput, setEmailInput] = useState('admin@admin.com');
  const [passwordInput, setPasswordInput] = useState('Admin@123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const currentUser = auth?.user;
  const isNormalUser = Boolean(currentUser && !currentUser.is_admin && currentUser.role?.toLowerCase() !== 'admin');

  const handleAdminSignIn = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);

    try {
      const user = await auth.login(emailInput || 'admin@admin.com', passwordInput || 'Admin@123');
      if (user && (user.is_admin || user.role === 'admin' || user.role === 'officer' || user.role === 'director')) {
        if (onAdminAuthenticated) onAdminAuthenticated(user);
        return;
      }
      setLocalError("Access Denied: Administrative privileges required.");
    } catch (err) {
      setLocalError(err.message || "Invalid officer email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdminDemo = async () => {
    setIsSubmitting(true);
    setLocalError(null);
    try {
      const user = await auth.adminDemoLogin();
      if (onAdminAuthenticated) onAdminAuthenticated(user);
    } catch (err) {
      setLocalError("Failed to load admin session.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Case 1: User is logged in as a normal user (403 Unauthorized)
  if (isNormalUser) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans select-none">
        <div className="w-full max-w-lg bg-[#0d1424] border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in relative overflow-hidden">
          {/* Top ambient glow */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <ShieldAlert size={26} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">403 — Restricted Administration Zone</h2>
              <p className="text-xs text-slate-400">Restricted to verified regulatory officers</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#090e1c] border border-slate-800 space-y-3 text-xs text-slate-300">
            <p>
              Your currently signed-in enterprise account (<span className="font-mono text-amber-400">{currentUser.email || currentUser.full_name}</span>) is a manufacturer profile.
            </p>
            <p className="text-slate-400">
              Click below to switch immediately to the <strong>Statutory Regulatory Directorate</strong> session.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onExitToManufacturer}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Return to Portal</span>
            </button>

            <button
              type="button"
              onClick={handleQuickAdminDemo}
              disabled={isSubmitting}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
            >
              <UserCheck size={14} />
              <span>Switch to Officer Session</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Unauthenticated / Sign-in required
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-[#0d1424] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-fade-in relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header Branding */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-[#0b2545] border border-blue-400/30 text-white flex items-center justify-center shrink-0 shadow-md">
            <Building2 size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 text-[10px] font-black uppercase tracking-wider border border-blue-700/40">
                Statutory Directorate
              </span>
            </div>
            <h1 className="text-lg font-black text-white leading-tight">Admin Control Panel</h1>
            <p className="text-[11px] text-slate-400">Conformity Assessment & Regulatory Portal</p>
          </div>
        </div>

        {/* Pre-configured Credentials Info Banner */}
        <div className="p-3 rounded-2xl bg-blue-950/50 border border-blue-800/60 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-300 flex items-center gap-1.5 text-[11px]">
              <ShieldCheck size={13} className="text-blue-400" />
              <span>Officer Evaluation Credentials</span>
            </span>
            <span className="text-[10px] font-mono bg-blue-900/80 text-blue-200 px-1.5 py-0.5 rounded border border-blue-700/60">
              DIRECTORATE
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-[#080d19] p-2 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500 text-[10px] block">Officer ID:</span>
              <span className="text-slate-200 font-semibold text-[10px] truncate block">admin@admin.com</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Passcode:</span>
              <span className="text-amber-400 font-semibold text-[10px] block">Admin@123</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {localError && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fade-in">
            <AlertTriangle size={15} className="shrink-0 mt-0.5 text-rose-400" />
            <span>{localError}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleAdminSignIn} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="block font-bold text-slate-300">Official Officer ID / Email</label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="admin@admin.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090e1c] border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-300">Secret Directorate Passcode</label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Admin@123"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#090e1c] border border-slate-700 text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-600/30 disabled:opacity-50 cursor-pointer"
          >
            <Lock size={15} />
            <span>{isSubmitting ? 'Authenticating Security Token...' : 'Enter Admin Gateway'}</span>
          </button>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Evaluation & Judge Access</span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 size={11} /> 1-Click Ready
            </span>
          </div>

          <button
            type="button"
            onClick={handleQuickAdminDemo}
            disabled={isSubmitting}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 border border-amber-500/30 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <KeyRound size={14} className="text-amber-400" />
            <span>One-Click Admin Access (Dr. Rajesh Verma)</span>
          </button>
        </div>

        {/* Exit Button */}
        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={onExitToManufacturer}
            className="text-slate-400 hover:text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Return to Public Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
