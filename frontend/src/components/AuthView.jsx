import React, { useState, useEffect, useRef } from 'react';
import { User, Lock, Mail, Globe, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, Building, Sparkles, X, Check, Phone, Linkedin, Twitter, Instagram, Github } from 'lucide-react';

export default function AuthView({ initialMode = 'login', auth, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp'
  
  // OTP Verification States
  const [otpStage, setOtpStage] = useState('request'); // 'request' | 'verify'
  const [otpPhone, setOtpPhone] = useState('9876543210');
  const [otpDigits, setOtpDigits] = useState(['4', '5', '2', '1', '0', '8']);
  const [otpTimer, setOtpTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [otpSentNotice, setOtpSentNotice] = useState(false);
  const digitInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  // Signup Multi-Step Flow
  const [signupStep, setSignupStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [showPasswordSuggestion, setShowPasswordSuggestion] = useState(false);

  // Form Fields
  const [emailOrPhone, setEmailOrPhone] = useState('demo@msme.gov.in');
  const [loginPassword, setLoginPassword] = useState('Demo@1234');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [enterpriseCategory, setEnterpriseCategory] = useState('MSME - Small Enterprise');
  const [sector, setSector] = useState('Consumer Goods & Utensils (IS 17803)');
  const [gstin, setGstin] = useState('');
  const [formError, setFormError] = useState(null);

  // Dynamic Password Suggestion Generator
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const nums = '23456789';
    const syms = '!@#$%&*';
    let pass = 'Bis';
    for (let i = 0; i < 4; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    for (let i = 0; i < 2; i++) pass += nums.charAt(Math.floor(Math.random() * nums.length));
    pass += syms.charAt(Math.floor(Math.random() * syms.length));
    pass += '26';

    setSignupPassword(pass);
    setConfirmPassword(pass);
    setShowPassword(true);
    setShowPasswordSuggestion(false);
  };

  // OTP Countdown Timer
  useEffect(() => {
    let interval = null;
    if (loginMethod === 'otp' && otpStage === 'verify' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [loginMethod, otpStage, otpTimer]);

  const handlePasswordLoginSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (auth && auth.login) {
        await auth.login(emailOrPhone || 'demo@msme.gov.in', loginPassword || 'Demo@1234');
      }
      if (onAuthSuccess) onAuthSuccess();
      if (onClose) onClose();
    } catch (err) {
      setFormError(err.message || "Invalid credentials. Please verify email and password.");
    }
  };

  const handleRequestOtp = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!otpPhone || otpPhone.length < 10) {
      setFormError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setOtpSentNotice(true);
    setOtpStage('verify');
    setOtpTimer(30);
    setCanResend(false);
    setTimeout(() => {
      if (digitInputRefs[0]?.current) {
        digitInputRefs[0].current.focus();
      }
    }, 100);
  };

  const handleOtpDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    if (value && index < 5) {
      digitInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitInputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setFormError("Please enter all 6 digits of the OTP.");
      return;
    }
    try {
      if (auth && auth.quickDemoLogin) {
        await auth.quickDemoLogin();
      } else if (auth && auth.login) {
        await auth.login('demo@msme.gov.in', 'Demo@1234');
      }
      if (onAuthSuccess) onAuthSuccess();
      if (onClose) onClose();
    } catch (err) {
      setFormError("Invalid or expired OTP. Please try again.");
    }
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    setOtpDigits(['', '', '', '', '', '']);
    setOtpTimer(30);
    setCanResend(false);
    setOtpSentNotice(true);
    digitInputRefs[0]?.current?.focus();
  };

  // Step 1 ➔ Step 2
  const handleStep1Next = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim() || !email.trim() || !signupPassword.trim()) {
      setFormError("Please fill in all required fields (Full Name, Email, Password).");
      return;
    }
    if (confirmPassword && signupPassword !== confirmPassword) {
      setFormError("Passwords do not match. Please verify.");
      return;
    }
    if (!termsAgreed) {
      setFormError("Please accept the Terms of Service and Privacy Policy.");
      return;
    }
    setSignupStep(2);
  };

  // Step 2 ➔ Step 3
  const handleStep2Next = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!companyName.trim()) {
      setFormError("Please enter your Organization / Enterprise name.");
      return;
    }
    setSignupStep(3);
  };

  // Step 3: Complete Final Registration
  const handleFinalSignup = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (auth && auth.register) {
        await auth.register({
          email,
          password: signupPassword,
          full_name: fullName,
          company_name: companyName || 'Registered Enterprise',
          role: `${enterpriseCategory} (${sector})`
        });
      }
      if (onAuthSuccess) onAuthSuccess();
      if (onClose) onClose();
    } catch (err) {
      setFormError(err.message || "Registration failed. Please try again.");
      setSignupStep(1);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col justify-between bg-[#fbfcfd] relative font-sans select-none overflow-x-hidden overflow-y-auto box-border">
      
      {/* ========================================================================= */}
      {/* BACKGROUND DECORATIONS (ABSOLUTE, ZERO LAYOUT IMPACT)                     */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        
        {/* Ashoka Chakra Watermark Top Left */}
        <div className="absolute -left-10 -top-10 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 opacity-10">
          <svg viewBox="0 0 200 200" fill="none" className="w-full h-full text-blue-900">
            <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="3" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" />
            <circle cx="100" cy="100" r="16" fill="currentColor" />
            {Array.from({ length: 24 }).map((_, i) => (
              <line
                key={i}
                x1="100"
                y1="100"
                x2={100 + 80 * Math.cos((i * 15 * Math.PI) / 180)}
                y2={100 + 80 * Math.sin((i * 15 * Math.PI) / 180)}
                stroke="currentColor"
                strokeWidth="1.5"
              />
            ))}
          </svg>
        </div>

        {/* Sweeping Tricolor Ribbon (Right Side) */}
        <div className="absolute right-0 top-0 bottom-0 w-44 sm:w-60 md:w-72 opacity-25">
          <svg viewBox="0 0 300 600" preserveAspectRatio="none" fill="none" className="w-full h-full">
            <path d="M50 0 C 150 150, 0 300, 300 450 L 300 470 C 0 320, 150 170, 50 20 Z" fill="#ea580c" />
            <path d="M50 20 C 150 170, 0 320, 300 470 L 300 490 C 0 340, 150 190, 50 40 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
            <path d="M50 40 C 150 190, 0 340, 300 490 L 300 510 C 0 360, 150 210, 50 60 Z" fill="#16a34a" />
          </svg>
        </div>

        {/* Heritage Monuments Skyline Silhouette along Bottom */}
        <div className="absolute left-0 right-0 bottom-0 h-24 sm:h-32 md:h-40 opacity-15 flex items-end justify-center">
          <svg viewBox="0 0 1200 200" preserveAspectRatio="none" fill="none" className="w-full h-full text-slate-700">
            <polygon points="120,200 135,40 145,40 160,200" fill="currentColor" />
            <path d="M300 200 V130 H320 V110 Q350 70 380 110 V130 H400 V200 Z" fill="currentColor" />
            <rect x="560" y="80" width="100" height="120" rx="4" fill="currentColor" />
            <path d="M585 200 V130 C585 110 635 110 635 130 V200 Z" fill="#f8fafc" />
            <rect x="780" y="120" width="200" height="80" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP HEADER                                                             */}
      {/* ========================================================================= */}
      <header className="w-full bg-white px-4 sm:px-8 lg:px-12 py-2.5 sm:py-3 flex items-center justify-between z-20 border-b border-slate-200/80 shrink-0 shadow-2xs">
        
        {/* Left: BIS Sahayak Brand Logo */}
        <div className="flex items-center cursor-pointer" onClick={() => { if (onClose) onClose(); }}>
          <img
            src="/bis-sahayak-logo.png"
            alt="BIS Sahayak"
            className="h-8 sm:h-10 w-auto object-contain"
            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
          />
        </div>

        {/* Right: State Emblem of India + Bureau of Indian Standards */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-right">
          <div className="w-6 sm:w-7 h-8 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 40 50" fill="none" className="w-full h-full text-slate-800">
              <path d="M20 2C15 2 12 6 12 11C12 14 14 17 17 18V22C13 23 10 26 10 30V34H30V30C30 26 27 23 23 22V18C26 17 28 14 28 11C28 6 25 2 20 2Z" fill="#94a3b8" />
              <rect x="8" y="34" width="24" height="6" rx="1" fill="#64748b" />
              <circle cx="20" cy="37" r="2" fill="#0b2545" />
              <rect x="5" y="40" width="30" height="5" rx="1" fill="#475569" />
            </svg>
          </div>
          <div className="leading-tight text-right">
            <p className="text-[11px] sm:text-xs font-black text-slate-900">भारतीय मानक ब्यूरो</p>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-700 hidden sm:block">Bureau of Indian Standards</p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 ml-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title="Close"
            >
              <X size={17} />
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN SECTION (110% SCALED PROPORTIONS)                                 */}
      {/* ========================================================================= */}
      <main className="flex-1 w-full flex flex-col justify-center items-center py-4 sm:py-6 md:py-8 px-3 sm:px-5 z-10 min-h-0">
        
        {/* ========================================================================= */}
        {/* VIEW A: LOGIN CARD (110% OPTIMIZED SIZE)                                  */}
        {/* ========================================================================= */}
        {mode === 'login' && (
          <div className="w-full max-w-[420px] sm:max-w-[435px] flex flex-col items-center gap-3 animate-fade-in my-auto">
            
            {/* White Floating Card */}
            <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl p-5 sm:p-7 space-y-3.5">
              
              {/* Card Header & Shield Badge */}
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-[#0b2545] text-white flex items-center justify-center text-xs font-black shadow-xs">
                    BS
                  </div>
                </div>

                <div className="pt-0.5">
                  <span className="text-[11px] font-semibold text-slate-500">Welcome to</span>
                  <h1 className="text-2xl sm:text-[26px] font-black text-[#0b2545] tracking-tight">
                    BIS Sahayak
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">
                    National Compliance Decision Portal
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-slate-300 py-0.5">
                  <span className="w-7 h-px bg-slate-200"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  <span className="w-7 h-px bg-slate-200"></span>
                </div>

                <p className="text-[11px] text-slate-500 font-medium">
                  {loginMethod === 'otp' ? 'Login via Mobile One-Time Password' : 'Sign in to continue to your account'}
                </p>
              </div>

              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* Password Login Mode */}
              {loginMethod === 'password' && (
                <form onSubmit={handlePasswordLoginSubmit} className="space-y-3 text-xs sm:text-[13px]">
                  
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 text-xs">
                      Email Address / ईमेल पता
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        placeholder="demo@msme.gov.in"
                        className="w-full pl-9 pr-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-[13px] font-medium outline-none focus:border-[#0b2545] focus:ring-1 focus:ring-[#0b2545] transition-all placeholder:text-slate-400 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 text-xs">
                      Password / पासवर्ड
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2 sm:py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-[13px] font-medium outline-none focus:border-[#0b2545] focus:ring-1 focus:ring-[#0b2545] transition-all placeholder:text-slate-400 shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <div className="flex justify-end pt-0.5">
                      <button
                        type="button"
                        onClick={() => alert("Password reset instructions dispatched to your registered email.")}
                        className="text-[11px] font-bold text-[#133b68] hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={auth.loading}
                    className="w-full py-2.5 sm:py-3 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>{auth.loading ? "Authenticating..." : "Sign In"}</span>
                    <Lock size={13} className="text-blue-200" />
                    <span>→</span>
                  </button>
                </form>
              )}

              {/* OTP Login Mode */}
              {loginMethod === 'otp' && (
                <div className="space-y-3 text-xs sm:text-[13px] animate-fade-in">
                  {otpStage === 'request' && (
                    <form onSubmit={handleRequestOtp} className="space-y-2.5">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 text-xs">
                          Mobile Number / मोबाइल नंबर
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 text-slate-800 font-bold text-xs">
                            🇮🇳 +91
                          </span>
                          <input
                            type="tel"
                            maxLength={10}
                            required
                            value={otpPhone}
                            onChange={(e) => setOtpPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 10-digit mobile number"
                            className="flex-1 px-3 py-2 sm:py-2.5 rounded-r-xl border border-slate-300 bg-white text-xs sm:text-[13px] font-medium outline-none focus:border-[#0b2545] shadow-2xs"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 sm:py-3 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white font-bold text-xs sm:text-sm transition-colors shadow-md flex items-center justify-center gap-1.5"
                      >
                        <span>Get Verification Code (OTP) →</span>
                      </button>
                    </form>
                  )}

                  {otpStage === 'verify' && (
                    <form onSubmit={handleVerifyOtpSubmit} className="space-y-2.5 animate-fade-in">
                      {otpSentNotice && (
                        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-[11px] text-emerald-800 font-medium">
                          <span>✓ Sent to +91 {otpPhone} (Code: <b>452108</b>)</span>
                          <button
                            type="button"
                            onClick={() => { setOtpDigits(['4', '5', '2', '1', '0', '8']); }}
                            className="text-[11px] font-bold text-emerald-900 underline ml-2"
                          >
                            Auto-Fill
                          </button>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 text-xs">
                          Enter 6-Digit OTP / ओटीपी दर्ज करें
                        </label>
                        <div className="grid grid-cols-6 gap-1.5">
                          {otpDigits.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={digitInputRefs[idx]}
                              type="text"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              className="w-full h-9 sm:h-10 text-center text-base font-black rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#0b2545] outline-none shadow-2xs"
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-0.5">
                        <span className="text-slate-500">
                          {canResend ? "Didn't receive code?" : `Resend in ${otpTimer}s`}
                        </span>
                        <button
                          type="button"
                          disabled={!canResend}
                          onClick={handleResendOtp}
                          className={`font-bold ${canResend ? 'text-[#0b2545] hover:underline' : 'text-slate-400'}`}
                        >
                          Resend OTP
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={auth.loading}
                        className="w-full py-2.5 sm:py-3 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white font-bold text-xs sm:text-sm transition-colors shadow-md flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 size={15} />
                        <span>{auth.loading ? "Verifying..." : "Verify & Sign In"}</span>
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* OR Divider */}
              <div className="relative flex py-0.5 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase">OR</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Secondary Login Option */}
              <button
                type="button"
                onClick={() => {
                  setFormError(null);
                  setLoginMethod(loginMethod === 'password' ? 'otp' : 'password');
                  setOtpStage('request');
                }}
                className="w-full py-2 sm:py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-[13px] transition-all shadow-2xs flex items-center justify-center gap-2"
              >
                {loginMethod === 'password' ? (
                  <>
                    <Phone size={14} className="text-orange-600" />
                    <span>Login with OTP</span>
                  </>
                ) : (
                  <>
                    <Lock size={14} className="text-blue-600" />
                    <span>Login with Password</span>
                  </>
                )}
              </button>

              {/* DIRECT CREATE ACCOUNT LINK INSIDE CARD */}
              <div className="pt-2 text-center text-xs sm:text-[13px] text-slate-700 border-t border-slate-100 flex items-center justify-center gap-1.5">
                <span className="text-slate-500 font-medium">Don't have an account?</span>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setSignupStep(1); setFormError(null); }}
                  className="font-black text-[#0b2545] hover:text-orange-600 hover:underline transition-colors flex items-center gap-0.5"
                >
                  <span>Create Account</span>
                  <ArrowRight size={12} />
                </button>
              </div>

            </div>

            {/* Bottom 3 Trust Pillars */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-slate-600 px-1 w-full">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 font-bold text-slate-800 text-[11px]">
                  <ShieldCheck size={14} className="text-slate-700" />
                  <span>Secure</span>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight">Data protected</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 font-bold text-slate-800 text-[11px]">
                  <CheckCircle2 size={14} className="text-slate-700" />
                  <span>Reliable</span>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight">Verified BIS Info</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 font-bold text-slate-800 text-[11px]">
                  <Globe size={14} className="text-slate-700" />
                  <span>Accessible</span>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight">Multi-language</span>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW B: SIGNUP CARD ("CREATE YOUR ACCOUNT" 110% SCALED)                   */}
        {/* ========================================================================= */}
        {mode === 'signup' && (
          <div className="w-full max-w-[430px] sm:max-w-[450px] flex flex-col items-center gap-3 animate-fade-in my-auto">
            
            {/* White Floating Signup Card */}
            <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xl p-5 sm:p-7 space-y-3.5">
              
              {/* Header Badge & Title */}
              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-[#0b2545] text-white flex items-center justify-center text-xs font-black shadow-xs">
                    BS
                  </div>
                </div>

                <div className="pt-0.5">
                  <h1 className="text-2xl sm:text-[26px] font-black text-[#0b2545] tracking-tight">
                    Create Your Account
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Join BIS Sahayak and simplify your compliance journey
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-slate-300 py-0.5">
                  <span className="w-7 h-px bg-slate-200"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  <span className="w-7 h-px bg-slate-200"></span>
                </div>
              </div>

              {/* 3-Step Stepper */}
              <div className="flex items-center justify-between max-w-[300px] mx-auto text-xs px-1">
                <div className="flex flex-col items-center gap-0.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shadow-xs ${
                    signupStep >= 1 ? 'bg-[#0b2545] text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {signupStep > 1 ? '✓' : '1'}
                  </div>
                  <span className={`text-[10px] font-bold ${signupStep === 1 ? 'text-[#0b2545]' : 'text-slate-400'}`}>
                    Account
                  </span>
                </div>
                
                <div className={`flex-1 h-0.5 mx-2 ${signupStep >= 2 ? 'bg-[#0b2545]' : 'bg-slate-200'}`} />
                
                <div className="flex flex-col items-center gap-0.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    signupStep >= 2 ? 'bg-[#0b2545] text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {signupStep > 2 ? '✓' : '2'}
                  </div>
                  <span className={`text-[10px] font-bold ${signupStep === 2 ? 'text-[#0b2545]' : 'text-slate-400'}`}>
                    Organization
                  </span>
                </div>
                
                <div className={`flex-1 h-0.5 mx-2 ${signupStep >= 3 ? 'bg-[#0b2545]' : 'bg-slate-200'}`} />
                
                <div className="flex flex-col items-center gap-0.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    signupStep === 3 ? 'bg-[#0b2545] text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                  }`}>
                    3
                  </div>
                  <span className={`text-[10px] font-bold ${signupStep === 3 ? 'text-[#0b2545]' : 'text-slate-400'}`}>
                    Verify
                  </span>
                </div>
              </div>

              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* ================= STEP 1: ACCOUNT DETAILS ================= */}
              {signupStep === 1 && (
                <form onSubmit={handleStep1Next} className="space-y-2.5 text-xs sm:text-[13px] animate-fade-in">
                  
                  <div className="space-y-0.5">
                    <label className="block font-bold text-slate-700 text-xs">
                      Full Name / पूरा नाम <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-[13px] font-medium outline-none focus:border-[#0b2545] shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="block font-bold text-slate-700 text-xs">
                      Email Address / ईमेल पता <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-[13px] font-medium outline-none focus:border-[#0b2545] shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="block font-bold text-slate-700 text-xs">
                      Mobile Number / मोबाइल नंबर
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-2.5 rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 text-slate-700 font-bold text-xs">
                        🇮🇳 +91 ▾
                      </span>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="Enter mobile number"
                        className="flex-1 px-3 py-2 rounded-r-xl border border-slate-300 bg-white text-xs sm:text-[13px] font-medium outline-none focus:border-[#0b2545] shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Password with Contextual Suggestion */}
                  <div className="space-y-0.5 relative">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700 text-xs">
                        Password / पासवर्ड <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={generateStrongPassword}
                        className="flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-2 py-0.5 rounded transition-colors"
                        title="Click to suggest strong password"
                      >
                        <Sparkles size={10} className="text-amber-500" />
                        <span>Suggest</span>
                      </button>
                    </div>

                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        onFocus={() => { if (!signupPassword) setShowPasswordSuggestion(true); }}
                        placeholder="Create a strong password"
                        autoComplete="new-password"
                        className="w-full pl-8 pr-8 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-[13px] font-medium outline-none focus:border-[#0b2545] shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    {showPasswordSuggestion && !signupPassword && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-[11px] text-blue-950 mt-1 shadow-xs animate-fade-in">
                        <span className="truncate mr-1">Use suggested password: <b>Bis#Secure2026!</b></span>
                        <button
                          type="button"
                          onClick={generateStrongPassword}
                          className="px-2 py-0.5 bg-[#0b2545] text-white font-bold text-[10px] rounded shadow-2xs shrink-0"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <label className="block font-bold text-slate-700 text-xs">
                      Confirm Password / पासवर्ड की पुष्टि करें
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="w-full pl-8 pr-8 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-[13px] font-medium outline-none focus:border-[#0b2545] shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-0.5 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="rounded border-slate-300 text-[#0b2545] focus:ring-0 w-3.5 h-3.5"
                    />
                    <span className="text-[11px] text-slate-600">
                      I agree to the <a href="#" className="text-[#0b2545] font-bold hover:underline">Terms</a> & <a href="#" className="text-[#0b2545] font-bold hover:underline">Privacy</a>
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 sm:py-3 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>Continue to Organization Details</span>
                    <ArrowRight size={13} />
                  </button>

                  <div className="text-center pt-1.5 text-xs border-t border-slate-100">
                    <span className="text-slate-500">Already have an account? </span>
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setFormError(null); }}
                      className="font-bold text-[#0b2545] hover:underline"
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* ================= STEP 2: ORGANIZATION DETAILS ================= */}
              {signupStep === 2 && (
                <form onSubmit={handleStep2Next} className="space-y-3 text-xs sm:text-[13px] animate-fade-in">
                  
                  <div className="p-2.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-950">
                    <p className="font-bold">🏢 Enterprise Compliance Profile</p>
                    <p className="text-blue-800 text-[10px]">Provide manufacturing details for custom BIS tracking.</p>
                  </div>

                  <div className="space-y-0.5">
                    <label className="block font-bold text-slate-700 text-xs">
                      Organization Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Building size={14} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Apex Stainless Steel Works Ltd."
                        className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-[13px] font-medium outline-none focus:border-[#0b2545] shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="block font-bold text-slate-700 text-xs">
                      Enterprise Category / उद्यम श्रेणी
                    </label>
                    <select
                      value={enterpriseCategory}
                      onChange={(e) => setEnterpriseCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-[13px] font-medium outline-none focus:border-[#0b2545] shadow-2xs"
                    >
                      <option value="MSME - Micro Enterprise">MSME - Micro Enterprise (&lt; ₹1 Cr)</option>
                      <option value="MSME - Small Enterprise">MSME - Small Enterprise (&lt; ₹10 Cr)</option>
                      <option value="MSME - Medium Enterprise">MSME - Medium Enterprise (&lt; ₹50 Cr)</option>
                      <option value="Large Enterprise">Large Scale Enterprise</option>
                    </select>
                  </div>

                  <div className="space-y-0.5">
                    <label className="block font-bold text-slate-700 text-xs">
                      Primary Sector / प्राथमिक विनिर्माण क्षेत्र
                    </label>
                    <select
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-[13px] font-medium outline-none focus:border-[#0b2545] shadow-2xs"
                    >
                      <option value="Consumer Goods & Utensils (IS 17803)">Consumer Goods & Utensils (IS 17803 Stainless Steel)</option>
                      <option value="Electrical & Liquid Heaters (IS 302-2-15)">Electrical & Liquid Heaters (IS 302-1, IS 302-2-15)</option>
                      <option value="Pressure Vessels & Gas Cylinders (IS 3196)">Pressure Vessels & Gas (IS 3196 LPG Cylinders)</option>
                      <option value="Food & Packaged Drinking Water (IS 14543)">Food & Packaged Drinking Water (IS 14543)</option>
                      <option value="Toys & Children Products (IS 9873)">Toys & Children Products (IS 9873)</option>
                      <option value="Solar PV Modules (IS 14286)">Solar PV & Renewable Energy (IS 14286)</option>
                      <option value="Civil & Cement (IS 269)">Civil & Cement (IS 269, IS 1786 Steel)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setSignupStep(1)}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors shadow-2xs"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1"
                    >
                      <span>Proceed to Verification</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </form>
              )}

              {/* ================= STEP 3: VERIFICATION & COMPLETE ================= */}
              {signupStep === 3 && (
                <div className="space-y-3 text-xs sm:text-[13px] animate-fade-in">
                  
                  <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-0.5">
                    <div className="flex items-center gap-1 font-black text-emerald-800 text-xs">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>Ready for Instant BIS Activation</span>
                    </div>
                    <p className="text-emerald-700 text-[10px]">
                      Your organization profile is ready to be linked with BIS regulatory tracking.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px]">
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Applicant:</span>
                      <span className="font-bold text-slate-900">{fullName || 'Authorized Representative'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Email:</span>
                      <span className="font-bold text-slate-900">{email || 'contact@enterprise.com'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">Organization:</span>
                      <span className="font-bold text-slate-900">{companyName || 'Enterprise Ltd.'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sector:</span>
                      <span className="font-bold text-slate-900 truncate max-w-[190px]">{sector}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setSignupStep(2)}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors shadow-2xs"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={handleFinalSignup}
                      disabled={auth.loading}
                      className="flex-1 py-2.5 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={13} className="text-amber-400" />
                      <span>{auth.loading ? "Activating..." : "Complete Registration & Launch"}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* 3. BIS SAHAYAK PLATFORM FOOTER                                            */}
      {/* ========================================================================= */}
      <footer className="w-full bg-[#071c36] text-white px-4 sm:px-8 lg:px-12 py-3 sm:py-4 z-20 shrink-0 border-t border-blue-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
          
          {/* Column 1: Brand & Mission */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-orange-500 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
                BS
              </div>
              <span className="text-xs font-black text-white tracking-wide">
                BIS <span className="text-orange-400">SAHAYAK</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-300 leading-tight font-normal">
              AI-powered compliance platform built to streamline Indian Standards search and decision-making for MSMEs.
            </p>
            <div className="flex items-center gap-2 pt-0.5 text-slate-400">
              <a
                href="https://www.linkedin.com/in/bishalstha045"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                title="LinkedIn (bishalstha045)"
              >
                <Linkedin size={12} />
              </a>
              <a
                href="https://x.com/bishalstha045"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                title="Twitter / X (bishalstha045)"
              >
                <Twitter size={12} />
              </a>
              <a
                href="https://instagram.com/bishalstha045"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                title="Instagram (bishalstha045)"
              >
                <Instagram size={12} />
              </a>
              <a
                href="https://github.com/bishalstha045"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                title="GitHub (bishalstha045)"
              >
                <Github size={12} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-0.5">
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Quick Links</h4>
            <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 text-[10px] text-slate-300">
              <span className="hover:text-orange-400 cursor-pointer">Standards</span>
              <span className="hover:text-orange-400 cursor-pointer">Compliance</span>
              <span className="hover:text-orange-400 cursor-pointer">Verify ISI</span>
              <span className="hover:text-orange-400 cursor-pointer">Documents</span>
            </div>
          </div>

          {/* Column 3: Support */}
          <div className="space-y-0.5">
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Support</h4>
            <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 text-[10px] text-slate-300">
              <span className="hover:text-orange-400 cursor-pointer">Help Center</span>
              <span className="hover:text-orange-400 cursor-pointer">Contact</span>
              <span className="hover:text-orange-400 cursor-pointer">Feedback</span>
              <span className="hover:text-orange-400 cursor-pointer">Sitemap</span>
            </div>
          </div>

          {/* Column 4: Contact Us */}
          <div className="space-y-0.5">
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Contact Us</h4>
            <div className="text-[10px] text-slate-300 leading-tight">
              <p className="font-semibold text-white">BIS Sahayak Innovation Hub</p>
              <p>Koramangala 4th Block, Bengaluru - 560034</p>
              <p className="flex items-center gap-1 pt-0.5 text-slate-200">
                <span>📞 +91 80 2553 1234</span>
                <span>•</span>
                <a href="mailto:bissahayak.help@gmail.com" className="text-orange-300 hover:underline">
                  bissahayak.help@gmail.com
                </a>
              </p>
            </div>
          </div>

        </div>

        {/* Sub-footer Copyright */}
        <div className="max-w-7xl mx-auto border-t border-blue-900/50 mt-2.5 pt-2 flex items-center justify-between text-[9px] text-slate-400">
          <p>© 2025 BIS Sahayak. All rights reserved.</p>
          <p>Made with ❤️ in India</p>
        </div>
      </footer>

    </div>
  );
}
