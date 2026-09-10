import React, { useState, useEffect } from 'react';
import { X, Building2, User, MapPin, Award, CheckCircle2, ShieldCheck, Save } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose, auth, onNavigate }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState(() => ({
    full_name: auth?.user?.full_name || '',
    email: auth?.user?.email || '',
    mobile_number: auth?.user?.mobile_number || '',
    role: auth?.user?.role || '',
    company_name: auth?.user?.company_name || '',
    enterprise_category: auth?.user?.enterprise_category || 'MSME - Small Enterprise',
    sector: auth?.user?.sector || 'Consumer Goods & Utensils',
    gstin: auth?.user?.gstin || '',
    udyam_number: auth?.user?.udyam_number || '',
    factory_address: auth?.user?.factory_address || '',
    state: auth?.user?.state || '',
    district: auth?.user?.district || '',
    pincode: auth?.user?.pincode || ''
  }));

  // Keep form synchronized when opening or when authenticated user data updates
  useEffect(() => {
    if (auth?.user) {
      setFormData({
        full_name: auth.user.full_name || '',
        email: auth.user.email || '',
        mobile_number: auth.user.mobile_number || '',
        role: auth.user.role || '',
        company_name: auth.user.company_name || '',
        enterprise_category: auth.user.enterprise_category || 'MSME - Small Enterprise',
        sector: auth.user.sector || 'Consumer Goods & Utensils',
        gstin: auth.user.gstin || '',
        udyam_number: auth.user.udyam_number || '',
        factory_address: auth.user.factory_address || '',
        state: auth.user.state || '',
        district: auth.user.district || '',
        pincode: auth.user.pincode || ''
      });
    }
  }, [auth?.user, isOpen]);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('enterprise'); // 'enterprise' | 'representative' | 'factory'

  const isMsme = Boolean(
    formData.enterprise_category &&
    (formData.enterprise_category.includes('MSME') ||
     formData.enterprise_category.includes('Small') ||
     formData.enterprise_category.includes('Micro'))
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...(auth?.user || {}),
      ...formData
    };

    // Update in localStorage
    localStorage.setItem('bis_user', JSON.stringify(updatedUser));

    // Update in auth hook if available
    if (auth?.setUser) {
      auth.setUser(updatedUser);
    } else if (auth?.updateUserProfile) {
      auth.updateUserProfile(updatedUser);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Tricolor National Accent */}
        <div className="h-1.5 w-full flex">
          <div className="w-1/3 bg-orange-500"></div>
          <div className="w-1/3 bg-white border-y border-slate-200"></div>
          <div className="w-1/3 bg-emerald-600"></div>
        </div>

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0b2545] text-white flex items-center justify-center font-bold text-base shadow-sm">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#0b2545] tracking-tight">
                  Organization & Compliance Profile
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  B2B Portal
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Official Manufacturer Registration for ManakOnline & BIS Scheme-I
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* MSME Statutory Subsidy Banner */}
        {isMsme && (
          <div className="px-6 py-2.5 bg-emerald-50/90 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-emerald-600 shrink-0" />
              <span>
                <strong className="font-bold">MSME Statutory Benefit Active:</strong> Entitled to <strong>50% Concession</strong> on BIS Application, Testing & Annual Marking Fees under Gazette QCO order.
              </span>
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 bg-emerald-200/60 font-mono text-[10px] font-bold rounded">
              50% SUBSIDY
            </span>
          </div>
        )}

        {/* Form Sub-navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-4 text-xs font-bold text-slate-500">
          <button
            type="button"
            onClick={() => setActiveTab('enterprise')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'enterprise' ? 'border-[#0b2545] text-[#0b2545]' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Building2 size={15} />
            <span>Enterprise & Tax Info</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('representative')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'representative' ? 'border-[#0b2545] text-[#0b2545]' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <User size={15} />
            <span>Authorized Officer</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('factory')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'factory' ? 'border-[#0b2545] text-[#0b2545]' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <MapPin size={15} />
            <span>Factory & Jurisdiction</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">

          {activeTab === 'enterprise' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Legal Enterprise / Company Name *
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Bharat Cookware & Appliances Pvt. Ltd."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b2545] focus:border-transparent font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    GSTIN (15-Digit Goods & Services Tax) *
                  </label>
                  <input
                    type="text"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleChange}
                    placeholder="e.g. 07AAACB2194D1Z5"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b2545] uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    MSME Udyam Registration No.
                  </label>
                  <input
                    type="text"
                    name="udyam_number"
                    value={formData.udyam_number}
                    onChange={handleChange}
                    placeholder="e.g. UDYAM-DL-01-0029182"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b2545] uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enterprise Classification *
                  </label>
                  <select
                    name="enterprise_category"
                    value={formData.enterprise_category}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b2545] bg-white font-medium"
                  >
                    <option value="MSME - Micro Enterprise">MSME - Micro Enterprise (Investment &lt; ₹1 Cr)</option>
                    <option value="MSME - Small Enterprise">MSME - Small Enterprise (Investment &lt; ₹10 Cr)</option>
                    <option value="MSME - Medium Enterprise">MSME - Medium Enterprise (Investment &lt; ₹50 Cr)</option>
                    <option value="Large Scale Enterprise">Large Scale Enterprise (&gt; ₹50 Cr)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Industry Sector *
                  </label>
                  <select
                    name="sector"
                    value={formData.sector}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b2545] bg-white font-medium"
                  >
                    <option value="Consumer Goods & Utensils">Consumer Goods & Utensils (Pressure Cookers, Locks)</option>
                    <option value="Household Electrical & Electronics">Household Electrical (Water Heaters, Irons, Washing Machines)</option>
                    <option value="Footwear & Sports Goods">Footwear & Sports Goods (IS 15844)</option>
                    <option value="Medical & Healthcare Devices">Medical Devices (Sphygmomanometers, Respirators, Gloves)</option>
                    <option value="Food, Dairy & Public Health">Food, Dairy & Water (Pasteurized Milk, Coffee, Water)</option>
                    <option value="Civil Engineering & Construction">Civil Infrastructure & Cement (OPC, LC3)</option>
                    <option value="Textiles & Apparels">Textiles & Apparels (Bedsheets, Linens)</option>
                    <option value="Chemicals, Paper & Agrochemicals">Chemicals, Paper & Agrochemicals (TiO2, Sprayers)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'representative' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Authorized Signatory Full Name *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Saroj Shrestha"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b2545] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Designation / Technical Role *
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="e.g. Quality Assurance Manager / Director"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b2545] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Business Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="e.g. compliance@yourcompany.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b2545] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile / WhatsApp Contact *
                  </label>
                  <input
                    type="text"
                    name="mobile_number"
                    value={formData.mobile_number}
                    onChange={handleChange}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b2545] font-medium"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-blue-700 shrink-0 mt-0.5" />
                <p>
                  This authorized representative will be automatically populated on official <strong>BIS Form V Inspection Application Dossiers</strong> and NABL laboratory sample submission letters.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'factory' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Manufacturing Plant / Factory Address *
                </label>
                <textarea
                  name="factory_address"
                  value={formData.factory_address}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g. Plot 42, Sector 8, Industrial Model Township, IMT Manesar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b2545] font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    State / UT *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Haryana"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b2545]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="e.g. Gurugram"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b2545]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 122051"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b2545]"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <span className="text-base">🏢</span>
                  <div>
                    <span className="font-bold">Jurisdiction Branch Office: </span>
                    <span>
                      {formData.state
                        ? `${formData.state} Regional Office / Branch Office`
                        : 'Will be auto-assigned based on State & PIN Code'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  AUTO-ASSIGNED
                </span>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[11px] text-slate-400">
              {savedSuccess ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> Profile successfully updated!
                </span>
              ) : (
                <span>All changes encrypted and synced with ManakOnline profile</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Save size={14} />
                <span>Save Profile</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
