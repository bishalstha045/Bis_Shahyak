import React, { useState, useEffect, useRef } from 'react';
import {
  User, Lock, Mail, Globe, Eye, EyeOff, ArrowRight, ArrowLeft,
  ShieldCheck, CheckCircle2, Building, Sparkles, X, Check,
  ExternalLink, RefreshCw, AlertCircle, Clock
} from 'lucide-react';
import Footer from './Footer';

export default function AuthView({ initialMode = 'login', auth, onClose, onAuthSuccess, onNavigate }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'org_onboarding'

  // Signup Multi-Step Flow (1 = Account, 2 = Organization, 3 = Verify)
  const [signupStep, setSignupStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [showPasswordSuggestion, setShowPasswordSuggestion] = useState(false);

  // Form Fields
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [enterpriseCategory, setEnterpriseCategory] = useState('MSME - Small Enterprise');
  const [sector, setSector] = useState('Consumer Goods & Utensils (IS 17803)');

  // Inline feedback & loading
  const [formError, setFormError] = useState(null);
  const [resetSentNotice, setResetSentNotice] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendStatusMessage, setResendStatusMessage] = useState(null);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // Restore pending verification on mount or if provided by auth hook
  useEffect(() => {
    if (auth?.pendingVerification) {
      setMode('signup');
      setSignupStep(3);
      if (auth.pendingVerification.email) setEmail(auth.pendingVerification.email);
      if (auth.pendingVerification.fullName) setFullName(auth.pendingVerification.fullName);
      if (auth.pendingVerification.companyName) setCompanyName(auth.pendingVerification.companyName);
    } else if (auth?.needsOrgOnboarding) {
      setMode('org_onboarding');
      setSignupStep(2);
    }
  }, [auth?.pendingVerification, auth?.needsOrgOnboarding]);

  // Resend Verification Countdown Timer
  useEffect(() => {
    let timer = null;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

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

  // -------------------------------------------------------------
  // LOGIN SUBMIT
  // -------------------------------------------------------------
  const handlePasswordLoginSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setResetSentNotice(false);

    if (!emailOrPhone.trim()) {
      setFormError("Please enter your email address.");
      return;
    }
    if (!loginPassword) {
      setFormError("Please enter your password.");
      return;
    }

    try {
      if (auth && auth.login) {
        await auth.login(emailOrPhone.trim(), loginPassword);
      }
      if (onAuthSuccess) onAuthSuccess();
      if (onClose) onClose();
    } catch (err) {
      const msg = err.message || "Invalid email or password.";
      // If error indicates unverified email, offer immediate verification step
      if (msg.toLowerCase().includes("verify your email") || msg.toLowerCase().includes("not verified")) {
        setEmail(emailOrPhone.trim());
        setSignupStep(3);
        setMode('signup');
      }
      setFormError(msg);
    }
  };

  // -------------------------------------------------------------
  // GOOGLE LOGIN / SIGN UP
  // -------------------------------------------------------------
  const handleGoogleAuth = async (intent = 'login') => {
    setFormError(null);
    try {
      if (auth && auth.loginWithGoogle) {
        await auth.loginWithGoogle(intent);
      }
    } catch (err) {
      setFormError(err.message || "Google authentication failed. Please try again.");
    }
  };

  // -------------------------------------------------------------
  // FORGOT PASSWORD
  // -------------------------------------------------------------
  const handleForgotPassword = async () => {
    setFormError(null);
    if (!emailOrPhone || !emailOrPhone.includes('@')) {
      setFormError("Please enter your registered email address in the field above to reset password.");
      return;
    }
    try {
      if (auth && auth.resetPassword) {
        await auth.resetPassword(emailOrPhone.trim());
      }
      setResetSentNotice(true);
    } catch (err) {
      setFormError(err.message || "Failed to dispatch password reset email. Please try again.");
    }
  };

  // -------------------------------------------------------------
  // SIGNUP STEP 1 -> STEP 2
  // -------------------------------------------------------------
  const handleStep1Next = (e) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim() || !email.trim() || !signupPassword.trim()) {
      setFormError("Please fill in all required fields (Full Name, Email, Password).");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (signupPassword.length < 6) {
      setFormError("Password must be at least 6 characters long.");
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

  // -------------------------------------------------------------
  // SIGNUP STEP 2 -> STEP 3 (DISPATCH REGISTRATION & VERIFICATION)
  // -------------------------------------------------------------
  const handleStep2ContinueToVerification = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!companyName.trim()) {
      setFormError("Please enter your Organization / Enterprise name.");
      return;
    }

    // If in Google Onboarding mode
    if (mode === 'org_onboarding') {
      try {
        if (auth && auth.completeOrganizationOnboarding) {
          await auth.completeOrganizationOnboarding({
            company_name: companyName.trim(),
            enterprise_category: enterpriseCategory,
            sector: sector
          });
        }
        if (onAuthSuccess) onAuthSuccess();
        if (onClose) onClose();
      } catch (err) {
        setFormError(err.message || "Failed to save organization. Please try again.");
      }
      return;
    }

    // Standard Email & Password Registration
    try {
      if (auth && auth.register) {
        const result = await auth.register({
          email: email.trim(),
          password: signupPassword,
          full_name: fullName.trim(),
          mobile_number: mobileNumber.trim(),
          company_name: companyName.trim(),
          role: `${enterpriseCategory} (${sector})`,
          enterprise_category: enterpriseCategory,
          sector: sector
        });

        if (result?.isVerified) {
          // Immediately verified (e.g. email confirmation disabled in Supabase)
          setIsEmailVerified(true);
          if (onAuthSuccess) onAuthSuccess();
          if (onClose) onClose();
          return;
        }
      }

      // Transition to dedicated verification step
      setSignupStep(3);
      setResendCooldown(60);
    } catch (err) {
      setFormError(err.message || "Registration failed. Please check your details.");
    }
  };

  // -------------------------------------------------------------
  // STEP 3: VERIFICATION ACTIONS
  // -------------------------------------------------------------
  const handleCheckVerificationStatus = async () => {
    setCheckingVerification(true);
    setFormError(null);
    setResendStatusMessage(null);

    try {
      if (auth && auth.checkEmailVerification) {
        const res = await auth.checkEmailVerification();
        if (res.verified) {
          setIsEmailVerified(true);
          setResendStatusMessage("✓ Email confirmed! Your account is verified.");
        } else {
          setFormError(res.message || "Verification link has not been clicked yet. Please check your inbox.");
        }
      }
    } catch (err) {
      setFormError(err.message || "Could not check verification status.");
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    setFormError(null);
    setResendStatusMessage(null);

    try {
      if (auth && auth.resendVerificationEmail) {
        await auth.resendVerificationEmail(email.trim());
      }
      setResendCooldown(60);
      setResendStatusMessage("✓ A fresh verification link has been sent to your email.");
    } catch (err) {
      setFormError(err.message || "Failed to resend verification email. Please try again.");
    }
  };

  const getEmailClientUrl = (userEmail) => {
    if (!userEmail) return null;
    const lower = userEmail.toLowerCase();
    if (lower.includes('@gmail.com') || lower.includes('@googlemail.com')) {
      return { name: 'Open Gmail', url: 'https://mail.google.com' };
    }
    if (lower.includes('@outlook.com') || lower.includes('@hotmail.com') || lower.includes('@live.com')) {
      return { name: 'Open Outlook', url: 'https://outlook.live.com' };
    }
    if (lower.includes('@yahoo.com')) {
      return { name: 'Open Yahoo Mail', url: 'https://mail.yahoo.com' };
    }
    return { name: 'Open Email', url: `mailto:${userEmail}` };
  };

  const emailClient = getEmailClientUrl(email);

  const handleCompleteAndEnterDashboard = () => {
    if (auth?.clearPendingVerification) {
      auth.clearPendingVerification();
    }
    if (onAuthSuccess) onAuthSuccess();
    if (onClose) onClose();
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-100/90 relative font-sans overflow-x-hidden">

      {/* ========================================================================= */}
      {/* BACKGROUND DECORATIONS (SUBTLE, RESTRICTED ACCENTS)                       */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">

        {/* Ashoka Chakra Watermark Top Left */}
        <div className="absolute -left-12 -top-12 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 opacity-10">
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
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR (SHRINK-0)                                                  */}
      {/* ========================================================================= */}
      <header className="w-full bg-white px-4 sm:px-8 lg:px-12 py-3 sm:py-3.5 flex items-center justify-between z-20 border-b border-slate-200/90 shrink-0 shadow-2xs">

        {/* Left: BIS Sahayak Brand Logo */}
        <div
          className="flex items-center cursor-pointer transition-transform hover:scale-[1.01]"
          onClick={() => { if (onClose) onClose(); }}
          title="Return to Portal"
        >
          <img
            src="/bis-sahayak-logo.png"
            alt="BIS Sahayak"
            className="h-8 sm:h-9 w-auto object-contain"
            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
          />
        </div>

        {/* Right: State Emblem of India + Bureau of Indian Standards */}
        <div className="flex items-center gap-3 text-right">
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
              className="p-1.5 ml-1 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. AUTHENTICATION CONTENT (CENTERED VERTICALLY WITH EQUAL TOP/BOTTOM SPACE)*/}
      {/* ========================================================================= */}
      <main className="flex-1 w-full flex flex-col items-center justify-center py-6 sm:py-8 px-4 z-10 my-auto">

        {/* Consistent Max-Width Card Container */}
        <div className="w-full max-w-[440px] flex flex-col items-center gap-5 animate-fade-in my-auto">

          {/* White Floating Card with High Contrast, Sharp Borders & Deep Shadow */}
          <div className="w-full bg-white rounded-3xl border border-slate-300/80 shadow-2xl p-6 sm:p-8 space-y-4 ring-1 ring-slate-900/5">

            {/* =================================================================== */}
            {/* GOOGLE ALREADY REGISTERED WELCOME BACK BANNER                       */}
            {/* =================================================================== */}
            {auth?.googleNotice && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 font-black text-sm text-[#0b2545]">
                  <CheckCircle2 size={16} className="text-blue-600" />
                  <span>Welcome back</span>
                </div>
                <p className="text-xs text-blue-900 leading-relaxed font-medium">
                  {auth.googleNotice.message || "This Google account is already registered with BIS Sahayak."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    auth.clearGoogleNotice();
                    if (onAuthSuccess) onAuthSuccess();
                    if (onClose) onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>Continue to BIS Sahayak</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}

            {/* =================================================================== */}
            {/* CARD HEADER & BADGE                                                */}
            {/* =================================================================== */}
            <div className="text-center space-y-1.5">
              <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto shadow-2xs">
                <div className="w-7 h-7 rounded-xl bg-[#0b2545] text-white flex items-center justify-center text-xs font-black shadow-xs">
                  BS
                </div>
              </div>

              <div className="pt-0.5">
                <h1 className="text-2xl font-black text-[#0b2545] tracking-tight">
                  {mode === 'login' && "Sign in to BIS Sahayak"}
                  {mode === 'signup' && (signupStep === 3 ? "Verify Your Account" : "Create Your Account")}
                  {mode === 'org_onboarding' && "Set Up Your Organization"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {mode === 'login' && "National Compliance Decision Portal for MSMEs"}
                  {mode === 'signup' && signupStep === 1 && "Join BIS Sahayak and streamline your certification"}
                  {mode === 'signup' && signupStep === 2 && "Personalize your manufacturing compliance tracking"}
                  {mode === 'signup' && signupStep === 3 && "One final step before you enter BIS Sahayak"}
                  {mode === 'org_onboarding' && "Tell us about your manufacturing business to complete setup"}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-slate-300 py-0.5">
                <span className="w-7 h-px bg-slate-200"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                <span className="w-7 h-px bg-slate-200"></span>
              </div>
            </div>

            {/* =================================================================== */}
            {/* INLINE ERROR & NOTICE MESSAGES                                      */}
            {/* =================================================================== */}
            {formError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2 animate-fade-in">
                <AlertCircle size={15} className="shrink-0 text-rose-500 mt-0.5" />
                <span className="leading-snug">{formError}</span>
              </div>
            )}

            {resetSentNotice && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2 animate-fade-in">
                <CheckCircle2 size={15} className="shrink-0 text-emerald-600 mt-0.5" />
                <span className="leading-snug">
                  Password reset link dispatched to your registered email. Please check your inbox.
                </span>
              </div>
            )}

            {resendStatusMessage && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2 animate-fade-in">
                <CheckCircle2 size={15} className="shrink-0 text-emerald-600 mt-0.5" />
                <span className="leading-snug">{resendStatusMessage}</span>
              </div>
            )}

            {/* =================================================================== */}
            {/* VIEW A: LOGIN MODE                                                  */}
            {/* =================================================================== */}
            {mode === 'login' && (
              <div className="space-y-4">

                {/* Email & Password Login Form */}
                <form onSubmit={handlePasswordLoginSubmit} className="space-y-3.5 text-xs sm:text-[13px]">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 text-xs">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        placeholder="name@enterprise.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-[13px] font-medium outline-none focus:border-[#0b2545] focus:ring-1 focus:ring-[#0b2545] transition-all placeholder:text-slate-400 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700 text-xs">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-[11px] font-bold text-[#0b2545] hover:text-orange-600 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-[13px] font-medium outline-none focus:border-[#0b2545] focus:ring-1 focus:ring-[#0b2545] transition-all placeholder:text-slate-400 shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={auth?.loading}
                    className="w-full py-2.5 sm:py-3 rounded-xl bg-[#0b2545] hover:bg-[#133b68] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {auth?.loading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin text-blue-200" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>

                {/* OR Divider */}
                <div className="relative flex py-0.5 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase">OR</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {/* Google OAuth Login Button with Loading State */}
                <button
                  type="button"
                  onClick={() => handleGoogleAuth('login')}
                  disabled={auth?.googleLoading || auth?.loading}
                  className="w-full py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-700 font-bold text-xs sm:text-[13px] transition-all shadow-2xs flex items-center justify-center gap-2"
                >
                  {auth?.googleLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-blue-600" />
                      <span>Connecting to Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>

                {/* Switch to Create Account */}
                <div className="pt-2 text-center text-xs text-slate-700 border-t border-slate-100 flex items-center justify-center gap-1.5">
                  <span className="text-slate-500">Don't have an account?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setSignupStep(1);
                      setFormError(null);
                    }}
                    className="font-bold text-[#0b2545] hover:text-orange-600 hover:underline transition-colors flex items-center gap-0.5"
                  >
                    <span>Create Account</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

              </div>
            )}

            {/* =================================================================== */}
            {/* VIEW B: SIGNUP MULTI-STEP FLOW (STEP 1, 2, 3)                        */}
            {/* =================================================================== */}
            {(mode === 'signup' || mode === 'org_onboarding') && (
              <div className="space-y-4">

                {/* 3-Step Progress Indicator: ACCOUNT ✓ -> ORGANIZATION ✓ -> VERIFY ● */}
                {mode !== 'org_onboarding' && (
                  <div className="flex items-center justify-between max-w-[320px] mx-auto text-xs px-2 pb-1">

                    {/* Step 1: Account */}
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shadow-xs transition-colors ${signupStep > 1
                        ? 'bg-emerald-600 text-white'
                        : signupStep === 1
                          ? 'bg-[#0b2545] text-white ring-4 ring-blue-100'
                          : 'bg-slate-100 text-slate-400'
                        }`}>
                        {signupStep > 1 ? '✓' : '1'}
                      </div>
                      <span className={`text-[10px] font-bold ${signupStep === 1 ? 'text-[#0b2545]' : 'text-slate-500'}`}>
                        Account
                      </span>
                    </div>

                    <div className={`flex-1 h-0.5 mx-2 ${signupStep >= 2 ? 'bg-[#0b2545]' : 'bg-slate-200'}`} />

                    {/* Step 2: Organization */}
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shadow-xs transition-colors ${signupStep > 2
                        ? 'bg-emerald-600 text-white'
                        : signupStep === 2
                          ? 'bg-[#0b2545] text-white ring-4 ring-blue-100'
                          : 'bg-slate-100 text-slate-400'
                        }`}>
                        {signupStep > 2 ? '✓' : '2'}
                      </div>
                      <span className={`text-[10px] font-bold ${signupStep === 2 ? 'text-[#0b2545]' : 'text-slate-500'}`}>
                        Organization
                      </span>
                    </div>

                    <div className={`flex-1 h-0.5 mx-2 ${signupStep >= 3 ? 'bg-[#0b2545]' : 'bg-slate-200'}`} />

                    {/* Step 3: Verify */}
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shadow-xs transition-colors ${isEmailVerified
                        ? 'bg-emerald-600 text-white'
                        : signupStep === 3
                          ? 'bg-[#0b2545] text-white ring-4 ring-blue-100'
                          : 'bg-slate-100 text-slate-400'
                        }`}>
                        {isEmailVerified ? '✓' : '3'}
                      </div>
                      <span className={`text-[10px] font-bold ${signupStep === 3 ? 'text-[#0b2545]' : 'text-slate-500'}`}>
                        Verify
                      </span>
                    </div>

                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* STEP 1: ACCOUNT DETAILS                                        */}
                {/* ------------------------------------------------------------- */}
                {signupStep === 1 && mode === 'signup' && (
                  <form onSubmit={handleStep1Next} className="space-y-3 text-xs sm:text-[13px] animate-fade-in">

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700 text-xs">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User size={15} className="absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Anil Sharma"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-[13px] font-medium outline-none focus:border-[#0b2545] shadow-2xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700 text-xs">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@enterprise.com"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-[13px] font-medium outline-none focus:border-[#0b2545] shadow-2xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700 text-xs">
                        Mobile Number
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 text-slate-700 font-bold text-xs">
                          🇮🇳 +91
                        </span>
                        <input
                          type="tel"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter 10-digit mobile number"
                          className="flex-1 px-3 py-2.5 rounded-r-xl border border-slate-300 bg-white text-xs sm:text-[13px] font-medium outline-none focus:border-[#0b2545] shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Password with Strong Suggestion */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-700 text-xs">
                          Password <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={generateStrongPassword}
                          className="flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-2 py-0.5 rounded-lg transition-colors"
                        >
                          <Sparkles size={11} className="text-amber-500" />
                          <span>Suggest Strong Password</span>
                        </button>
                      </div>

                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          onFocus={() => { if (!signupPassword) setShowPasswordSuggestion(true); }}
                          placeholder="Create strong password (min 6 characters)"
                          autoComplete="new-password"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-[13px] font-medium outline-none focus:border-[#0b2545] shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>

                      {showPasswordSuggestion && !signupPassword && (
                        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-[11px] text-blue-950 shadow-xs animate-fade-in">
                          <span className="truncate mr-1">Suggested: <b>Bis#Secure2026!</b></span>
                          <button
                            type="button"
                            onClick={generateStrongPassword}
                            className="px-2.5 py-1 bg-[#0b2545] text-white font-bold text-[10px] rounded-lg shadow-2xs shrink-0"
                          >
                            Apply
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700 text-xs">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your password"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-[13px] font-medium outline-none focus:border-[#0b2545] shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* Terms & Privacy */}
                    <div className="pt-1 flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="terms-check"
                        checked={termsAgreed}
                        onChange={(e) => setTermsAgreed(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-[#0b2545] focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                      />
                      <label htmlFor="terms-check" className="text-[11px] text-slate-600 cursor-pointer">
                        I agree to the <a href="#" className="text-[#0b2545] font-bold hover:underline">Terms of Service</a> & <a href="#" className="text-[#0b2545] font-bold hover:underline">Privacy Policy</a>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 sm:py-3 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <span>Continue to Organization Details</span>
                      <ArrowRight size={14} />
                    </button>

                    {/* OR Divider */}
                    <div className="relative flex py-0.5 items-center">
                      <div className="flex-grow border-t border-slate-200"></div>
                      <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase">OR</span>
                      <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    {/* Google OAuth Signup */}
                    <button
                      type="button"
                      onClick={() => handleGoogleAuth('signup')}
                      disabled={auth?.googleLoading || auth?.loading}
                      className="w-full py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-700 font-bold text-xs sm:text-[13px] transition-all shadow-2xs flex items-center justify-center gap-2"
                    >
                      {auth?.googleLoading ? (
                        <>
                          <RefreshCw size={14} className="animate-spin text-blue-600" />
                          <span>Connecting to Google...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                          <span>Sign up with Google</span>
                        </>
                      )}
                    </button>

                    {/* Switch to Login */}
                    <div className="text-center pt-2 text-xs border-t border-slate-100">
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

                {/* ------------------------------------------------------------- */}
                {/* STEP 2: ORGANIZATION DETAILS (REQUIRED STEP 2)                 */}
                {/* ------------------------------------------------------------- */}
                {(signupStep === 2 || mode === 'org_onboarding') && (
                  <form onSubmit={handleStep2ContinueToVerification} className="space-y-3.5 text-xs sm:text-[13px] animate-fade-in">

                    {/* Organization Banner */}
                    <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-950 space-y-1">
                      <p className="font-bold text-xs flex items-center gap-1.5 text-[#0b2545]">
                        <Building size={14} className="text-blue-600" />
                        <span>Set Up Your Organization</span>
                      </p>
                      <p className="text-blue-900 text-[11px] leading-relaxed">
                        Tell us about your manufacturing business so BIS Sahayak can personalize your compliance tracking.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700 text-xs">
                        Organization Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Building size={15} className="absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. Apex Stainless Steel Works Ltd."
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-[13px] font-medium outline-none focus:border-[#0b2545] shadow-2xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700 text-xs">
                        Enterprise Category
                      </label>
                      <select
                        value={enterpriseCategory}
                        onChange={(e) => setEnterpriseCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-[13px] font-medium outline-none focus:border-[#0b2545] shadow-2xs"
                      >
                        <option value="MSME - Micro Enterprise">MSME - Micro Enterprise (&lt; ₹1 Cr)</option>
                        <option value="MSME - Small Enterprise">MSME - Small Enterprise (&lt; ₹10 Cr)</option>
                        <option value="MSME - Medium Enterprise">MSME - Medium Enterprise (&lt; ₹50 Cr)</option>
                        <option value="Large Enterprise">Large Scale Enterprise</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700 text-xs">
                        Primary Sector
                      </label>
                      <select
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-[13px] font-medium outline-none focus:border-[#0b2545] shadow-2xs"
                      >
                        <option value="Consumer Goods & Utensils (IS 17803)">Consumer Goods & Utensils (IS 17803 Stainless Steel)</option>
                        <option value="Electrical & Liquid Heaters (IS 302-2-15)">Electrical & Liquid Heaters (IS 302-1, IS 302-2-15)</option>
                        <option value="Pressure Vessels & Gas Cylinders (IS 3196)">Pressure Vessels & Gas Cylinders (IS 3196 LPG)</option>
                        <option value="Food & Packaged Drinking Water (IS 14543)">Food & Packaged Drinking Water (IS 14543)</option>
                        <option value="Toys & Children Products (IS 9873)">Toys & Children Products (IS 9873)</option>
                        <option value="Solar PV Modules (IS 14286)">Solar PV & Renewable Energy (IS 14286)</option>
                        <option value="Civil & Cement (IS 269)">Civil & Cement (IS 269, IS 1786 Steel)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      {mode !== 'org_onboarding' && (
                        <button
                          type="button"
                          onClick={() => setSignupStep(1)}
                          className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors shadow-2xs flex items-center gap-1"
                        >
                          <ArrowLeft size={13} />
                          <span>Back</span>
                        </button>
                      )}

                      <button
                        type="submit"
                        disabled={auth?.loading}
                        className="flex-1 py-2.5 sm:py-3 rounded-xl bg-[#0b2545] hover:bg-[#133b68] disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5"
                      >
                        {auth?.loading ? (
                          <>
                            <RefreshCw size={14} className="animate-spin text-blue-200" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <span>{mode === 'org_onboarding' ? 'Complete Registration & Continue' : 'Continue to Verification'}</span>
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                )}

                {/* ------------------------------------------------------------- */}
                {/* STEP 3: DEDICATED VERIFICATION SCREEN                          */}
                {/* ------------------------------------------------------------- */}
                {signupStep === 3 && mode === 'signup' && (
                  <div className="space-y-4 text-xs sm:text-[13px] animate-fade-in">

                    {/* Verification Card Banner */}
                    {!isEmailVerified ? (
                      <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-center space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100/80 border border-blue-200 flex items-center justify-center mx-auto text-[#0b2545] shadow-xs">
                          <Mail size={24} className="text-blue-600 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-black text-[#0b2545]">
                            Verify Your Email
                          </h3>
                          <p className="text-xs text-slate-600">
                            We've sent a verification link to
                          </p>
                          <p className="text-xs font-bold text-blue-950 bg-white/70 py-1 px-3 rounded-lg border border-blue-100 inline-block">
                            {email || 'your email address'}
                          </p>
                          <p className="text-[11px] text-slate-500 pt-1">
                            Please verify your email address before continuing to BIS Sahayak.
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                          <span>Verification email sent</span>
                        </div>
                      </div>
                    ) : (
                      /* Celebratory Verified State */
                      <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2.5 animate-fade-in">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
                          <CheckCircle2 size={26} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-base font-black text-emerald-900">
                            ✓ Account Verified
                          </h3>
                          <p className="text-xs text-emerald-800 font-medium">
                            Your BIS Sahayak account is ready.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Actions when not yet verified */}
                    {!isEmailVerified ? (
                      <div className="space-y-2.5">

                        {/* Open Email Client Button if recognized */}
                        {emailClient && (
                          <a
                            href={emailClient.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
                          >
                            <span>{emailClient.name}</span>
                            <ExternalLink size={14} />
                          </a>
                        )}

                        {/* Check Verification Status Button */}
                        <button
                          type="button"
                          onClick={handleCheckVerificationStatus}
                          disabled={checkingVerification}
                          className="w-full py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors shadow-2xs flex items-center justify-center gap-2"
                        >
                          {checkingVerification ? (
                            <>
                              <RefreshCw size={13} className="animate-spin text-blue-600" />
                              <span>Checking Status...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={14} className="text-emerald-600" />
                              <span>Check Verification Status</span>
                            </>
                          )}
                        </button>

                        {/* Resend Verification Section with Cooldown */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                          <span className="text-slate-600 text-[11px]">
                            Didn't receive the email?
                          </span>
                          <button
                            type="button"
                            onClick={handleResendVerification}
                            disabled={resendCooldown > 0}
                            className={`font-bold text-xs flex items-center gap-1 ${resendCooldown > 0
                              ? 'text-slate-400 cursor-not-allowed'
                              : 'text-[#0b2545] hover:underline cursor-pointer'
                              }`}
                          >
                            {resendCooldown > 0 ? (
                              <>
                                <Clock size={12} />
                                <span>Resend in {resendCooldown}s</span>
                              </>
                            ) : (
                              <span>Resend verification</span>
                            )}
                          </button>
                        </div>

                        {/* Back Button */}
                        <div className="pt-1 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setSignupStep(2)}
                            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                          >
                            <ArrowLeft size={13} />
                            <span>Back to Organization</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (auth?.clearPendingVerification) auth.clearPendingVerification();
                              setMode('login');
                            }}
                            className="text-xs font-bold text-[#0b2545] hover:underline"
                          >
                            Sign In Instead
                          </button>
                        </div>

                      </div>
                    ) : (
                      /* Continue Button after Email Verified */
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleCompleteAndEnterDashboard}
                          className="w-full py-3 rounded-xl bg-[#0b2545] hover:bg-[#133b68] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          <span>Continue to BIS Sahayak</span>
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    )}

                  </div>
                )}

              </div>
            )}

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
              <span className="text-[10px] text-slate-500 leading-tight">National Portal</span>
            </div>
          </div>

        </div>

      </main>

      {/* ========================================================================= */}
      {/* 3. REUSABLE BIS SAHAYAK PLATFORM FOOTER (FULL WIDTH AT BOTTOM)             */}
      {/* ========================================================================= */}
      <Footer onNavigate={onNavigate} />

    </div>
  );
}
