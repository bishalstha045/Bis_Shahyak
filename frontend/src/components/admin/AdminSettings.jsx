import React, { useState, useEffect } from 'react';
import { Settings, Shield, Server, Lock, CheckCircle2, Save, RefreshCw } from 'lucide-react';
import { getAdminSettings } from '../../services/api';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    system_name: "Bureau of Indian Standards — Compliance Control Gateway",
    version: "2.0.0",
    qco_enforcement_mode: "Strict Gazette Mandatory",
    rag_gateway_url: "http://127.0.0.1:8000",
    auto_cml_issuance: true,
    require_dual_signoff: false,
    log_retention_days: 90
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getAdminSettings().then(data => {
      if (data) setSettings(prev => ({ ...prev, ...data }));
    }).catch(() => {});
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Statutory System Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure BIS conformity assessment parameters, security guardrails, and audit retention.
          </p>
        </div>

        {saved && (
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 animate-fade-in">
            <CheckCircle2 size={14} /> Settings Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* General Settings */}
        <div className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm pb-2 border-b border-slate-800">
            Platform Gateway Identity
          </h3>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Regulatory System Title</label>
            <input
              type="text"
              value={settings.system_name}
              onChange={(e) => setSettings({ ...settings, system_name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-[#090e1c] border border-slate-700 text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">QCO Regulatory Enforcement</label>
              <select
                value={settings.qco_enforcement_mode}
                onChange={(e) => setSettings({ ...settings, qco_enforcement_mode: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#090e1c] border border-slate-700 text-white"
              >
                <option value="Strict Gazette Mandatory">Strict Gazette Mandatory (QCO)</option>
                <option value="Advisory Voluntary">Advisory Voluntary Mode</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Audit Log Retention (Days)</label>
              <input
                type="number"
                value={settings.log_retention_days}
                onChange={(e) => setSettings({ ...settings, log_retention_days: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#090e1c] border border-slate-700 text-white"
              />
            </div>
          </div>
        </div>

        {/* Security & Verification Automation */}
        <div className="p-5 rounded-2xl bg-[#0d1424] border border-slate-800 space-y-4">
          <h3 className="font-bold text-white text-sm pb-2 border-b border-slate-800">
            Conformity Assessment Automation & Guardrails
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#090e1c] border border-slate-800 cursor-pointer">
              <div>
                <p className="font-bold text-slate-200">Automatic 7-Digit CM/L Licence Generation</p>
                <p className="text-[11px] text-slate-400">Generates unique statutory licence number upon officer approval.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.auto_cml_issuance}
                onChange={(e) => setSettings({ ...settings, auto_cml_issuance: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#090e1c] border border-slate-800 cursor-pointer">
              <div>
                <p className="font-bold text-slate-200">Mandatory Dual-Signoff for High-Risk Categories</p>
                <p className="text-[11px] text-slate-400">Requires Deputy Director counter-signature on Medical & Automotive dossiers.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.require_dual_signoff}
                onChange={(e) => setSettings({ ...settings, require_dual_signoff: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Save size={15} />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
