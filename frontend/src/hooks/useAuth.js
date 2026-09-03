import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const AUTH_STATES = {
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  SIGNUP_STARTED: 'SIGNUP_STARTED',
  ACCOUNT_CREATED: 'ACCOUNT_CREATED',
  EMAIL_VERIFICATION_PENDING: 'EMAIL_VERIFICATION_PENDING',
  EMAIL_VERIFIED: 'EMAIL_VERIFIED',
  ORGANIZATION_SETUP: 'ORGANIZATION_SETUP',
  REGISTRATION_COMPLETE: 'REGISTRATION_COMPLETE',
  AUTHENTICATED: 'AUTHENTICATED'
};

export const normalizeIndianPhone = (rawPhone) => {
  if (!rawPhone) return '';
  let cleaned = String(rawPhone).trim().replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }
  return cleaned;
};

const formatSupabaseUser = (sessionUser, profileData = null, orgData = null) => {
  if (!sessionUser) return null;
  const meta = sessionUser.user_metadata || {};
  const isVerified = Boolean(sessionUser.email_confirmed_at || sessionUser.phone_confirmed_at);
  const identifier = sessionUser.phone
    ? sessionUser.phone
    : (sessionUser.email ? sessionUser.email.split('@')[0] : 'Authorized Representative');

  return {
    id: sessionUser.id,
    email: sessionUser.email || '',
    phone: sessionUser.phone || '',
    email_confirmed_at: sessionUser.email_confirmed_at || null,
    phone_confirmed_at: sessionUser.phone_confirmed_at || null,
    is_email_verified: isVerified,
    full_name: profileData?.full_name || meta.full_name || meta.name || identifier,
    company_name: orgData?.name || meta.company_name || 'Registered Enterprise',
    role: profileData?.role || meta.role || 'Manufacturer',
    mobile_number: profileData?.mobile_number || meta.mobile_number || sessionUser.phone || '',
    enterprise_category: orgData?.enterprise_category || meta.enterprise_category || 'MSME - Small Enterprise',
    sector: orgData?.primary_sector || meta.sector || 'Consumer Goods & Utensils (IS 17803)',
    avatar_url: meta.avatar_url || meta.picture || '',
    provider: sessionUser.app_metadata?.provider || (sessionUser.phone ? 'phone' : 'email'),
    has_organization: Boolean(orgData?.name || meta.has_organization || meta.company_name)
  };
};

export function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('bis_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id === 'usr-google-demo' || parsed?.email === 'google.user@gmail.com') {
          localStorage.removeItem('bis_user');
          localStorage.removeItem('bis_token');
          return null;
        }
        return parsed;
      }
    } catch {
      return null;
    }
    return null;
  });

  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem('bis_token');
    return saved === 'google-demo-token' ? null : saved;
  });

  const [authState, setAuthState] = useState(AUTH_STATES.UNAUTHENTICATED);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pending verification state preserved across refreshes
  const [pendingVerification, setPendingVerification] = useState(() => {
    try {
      const saved = localStorage.getItem('bis_pending_verification');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Notice state for Google existing user detected during signup
  const [googleNotice, setGoogleNotice] = useState(null);

  // Needs onboarding state (e.g. new Google OAuth user who needs organization setup)
  const [needsOrgOnboarding, setNeedsOrgOnboarding] = useState(false);

  // Helper to safely check profile and organization in Supabase database
  const checkDatabaseProfileAndOrg = useCallback(async (userId) => {
    if (!userId) return { profile: null, org: null };
    try {
      const [pRes, oRes] = await Promise.allSettled([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('organizations').select('*').eq('user_id', userId).maybeSingle()
      ]);

      const profile = pRes.status === 'fulfilled' && !pRes.value.error ? pRes.value.data : null;
      const org = oRes.status === 'fulfilled' && !oRes.value.error ? oRes.value.data : null;

      return { profile, org };
    } catch (err) {
      // Table may not exist yet in Supabase schema cache; fail gracefully
      return { profile: null, org: null };
    }
  }, []);

  // Helper to safely save or upsert profile & org to database
  const saveProfileAndOrgToDatabase = useCallback(async (userObj, orgDetails) => {
    if (!userObj?.id) return;
    try {
      // 1. Check & upsert profile with duplicate protection
      try {
        await supabase.from('profiles').upsert({
          id: userObj.id,
          email: userObj.email,
          full_name: userObj.full_name || 'Authorized Representative',
          mobile_number: userObj.mobile_number || '',
          role: userObj.role || 'Manufacturer'
        }, { onConflict: 'id' });
      } catch (e) {
        // Table might be pending SQL execution in Supabase dashboard
      }

      // 2. Check & upsert organization with duplicate protection
      if (orgDetails?.company_name) {
        try {
          await supabase.from('organizations').upsert({
            user_id: userObj.id,
            name: orgDetails.company_name,
            enterprise_category: orgDetails.enterprise_category || 'MSME - Small Enterprise',
            primary_sector: orgDetails.sector || 'Consumer Goods & Utensils (IS 17803)'
          }, { onConflict: 'user_id' });
        } catch (e) {
          // Table might be pending SQL execution
        }
      }
    } catch (err) {
      console.warn("Database sync note:", err.message);
    }
  }, []);

  // Initialize and listen to Supabase Auth State
  useEffect(() => {
    let mounted = true;

    // Purge any stale demo session if present
    const saved = localStorage.getItem('bis_user');
    if (saved && (saved.includes('usr-google-demo') || saved.includes('google.user@gmail.com'))) {
      localStorage.removeItem('bis_user');
      localStorage.removeItem('bis_token');
      if (mounted) {
        setUser(null);
        setToken(null);
      }
    }

    async function initSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session && session.user && mounted) {
          const authUser = session.user;
          const isVerified = Boolean(authUser.email_confirmed_at || authUser.phone_confirmed_at);
          const { profile, org } = await checkDatabaseProfileAndOrg(authUser.id);
          const formatted = formatSupabaseUser(authUser, profile, org);

          // Check if user came from OAuth with intent
          const oauthIntent = sessionStorage.getItem('bis_oauth_intent');
          if (oauthIntent) {
            sessionStorage.removeItem('bis_oauth_intent');
            // If user clicked "Sign up with Google" but already had completed org/profile
            if (oauthIntent === 'signup' && (org || authUser.user_metadata?.has_organization)) {
              setGoogleNotice({
                type: 'already_registered',
                message: 'This Google account is already registered with BIS Sahayak.'
              });
            }
          }

          // Check if Google user or email user needs Organization Onboarding
          const hasOrg = Boolean(org?.name || authUser.user_metadata?.has_organization || authUser.user_metadata?.company_name);

          if (!hasOrg && isVerified) {
            // Needs organization setup
            setUser(formatted);
            setToken(session.access_token);
            setNeedsOrgOnboarding(true);
            setAuthState(AUTH_STATES.ORGANIZATION_SETUP);
            return;
          }

          if (isVerified) {
            // Verified and complete
            setUser(formatted);
            setToken(session.access_token);
            setAuthState(AUTH_STATES.AUTHENTICATED);
            setNeedsOrgOnboarding(false);
            localStorage.setItem('bis_user', JSON.stringify(formatted));
            localStorage.setItem('bis_token', session.access_token);
            localStorage.removeItem('bis_pending_verification');
            setPendingVerification(null);
          } else if (authUser.email) {
            // Unverified email session - do not allow into authenticated app
            setAuthState(AUTH_STATES.EMAIL_VERIFICATION_PENDING);
            setPendingVerification({
              email: authUser.email,
              fullName: formatted.full_name,
              companyName: formatted.company_name
            });
            localStorage.setItem('bis_pending_verification', JSON.stringify({
              email: authUser.email,
              fullName: formatted.full_name,
              companyName: formatted.company_name
            }));
          } else {
            setAuthState(AUTH_STATES.UNAUTHENTICATED);
          }
        } else if (mounted) {
          // Check if we have an active pending verification in localStorage
          const pending = localStorage.getItem('bis_pending_verification');
          if (pending) {
            try {
              setPendingVerification(JSON.parse(pending));
              setAuthState(AUTH_STATES.EMAIL_VERIFICATION_PENDING);
            } catch {
              localStorage.removeItem('bis_pending_verification');
            }
          } else {
            setAuthState(AUTH_STATES.UNAUTHENTICATED);
          }
        }
      } catch (err) {
        console.warn("Supabase session check:", err.message);
      }
    }

    initSession();

    // Listen to real-time auth state events
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session && session.user) {
        const authUser = session.user;
        const isVerified = Boolean(authUser.email_confirmed_at || authUser.phone_confirmed_at);
        const { profile, org } = await checkDatabaseProfileAndOrg(authUser.id);
        const formatted = formatSupabaseUser(authUser, profile, org);

        const oauthIntent = sessionStorage.getItem('bis_oauth_intent');
        if (oauthIntent) {
          sessionStorage.removeItem('bis_oauth_intent');
          if (oauthIntent === 'signup' && (org || authUser.user_metadata?.has_organization)) {
            setGoogleNotice({
              type: 'already_registered',
              message: 'This Google account is already registered with BIS Sahayak.'
            });
          }
        }

        const hasOrg = Boolean(org?.name || authUser.user_metadata?.has_organization || authUser.user_metadata?.company_name);

        if (!hasOrg && isVerified) {
          setUser(formatted);
          setToken(session.access_token);
          setNeedsOrgOnboarding(true);
          setAuthState(AUTH_STATES.ORGANIZATION_SETUP);
          return;
        }

        if (isVerified) {
          setUser(formatted);
          setToken(session.access_token);
          setAuthState(AUTH_STATES.AUTHENTICATED);
          setNeedsOrgOnboarding(false);
          localStorage.setItem('bis_user', JSON.stringify(formatted));
          localStorage.setItem('bis_token', session.access_token);
          localStorage.removeItem('bis_pending_verification');
          setPendingVerification(null);
        } else if (authUser.email) {
          setAuthState(AUTH_STATES.EMAIL_VERIFICATION_PENDING);
          setPendingVerification({
            email: authUser.email,
            fullName: formatted.full_name,
            companyName: formatted.company_name
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setToken(null);
        setAuthState(AUTH_STATES.UNAUTHENTICATED);
        setNeedsOrgOnboarding(false);
        setGoogleNotice(null);
        localStorage.removeItem('bis_user');
        localStorage.removeItem('bis_token');
        localStorage.removeItem('bis_pending_verification');
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [checkDatabaseProfileAndOrg]);

  // Clean, user-friendly error mapper
  const formatAuthError = (err) => {
    if (!err) return "An unexpected error occurred. Please try again.";
    const msg = (err.message || String(err)).toLowerCase();

    if (msg.includes("invalid login credentials") || msg.includes("invalid_grant") || msg.includes("invalid password")) {
      return "Invalid email or password.";
    }
    if (msg.includes("email not confirmed") || msg.includes("email_not_confirmed")) {
      return "Please verify your email address before continuing.";
    }
    if (msg.includes("user already registered") || msg.includes("already exists") || msg.includes("unique constraint")) {
      return "An account with this email already exists. Please sign in instead.";
    }
    if (msg.includes("rate limit") || msg.includes("too many requests")) {
      return "Too many attempts. Please wait a few moments before trying again.";
    }
    if (msg.includes("network") || msg.includes("failed to fetch")) {
      return "Network connection issue. Please check your internet connection.";
    }
    if (msg.includes("otp expired") || msg.includes("token has expired")) {
      return "The verification code has expired. Please request a new OTP.";
    }
    if (msg.includes("invalid token") || msg.includes("token is invalid") || msg.includes("token not found") || msg.includes("bad code")) {
      return "Invalid verification code. Please check and enter the 6-digit OTP again.";
    }
    return err.message || "Authentication failed. Please verify your details.";
  };

  // 1. Password Login
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        throw new Error(formatAuthError(error));
      }

      const authUser = data.user;
      const isVerified = Boolean(authUser.email_confirmed_at);

      if (!isVerified) {
        // Stop unverified user from accessing application
        setAuthState(AUTH_STATES.EMAIL_VERIFICATION_PENDING);
        const pending = {
          email: authUser.email,
          fullName: authUser.user_metadata?.full_name || '',
          companyName: authUser.user_metadata?.company_name || ''
        };
        setPendingVerification(pending);
        localStorage.setItem('bis_pending_verification', JSON.stringify(pending));
        throw new Error("Your email address is not verified yet. Please check your inbox for the verification link.");
      }

      const { profile, org } = await checkDatabaseProfileAndOrg(authUser.id);
      const userObj = formatSupabaseUser(authUser, profile, org);

      setUser(userObj);
      setToken(data.session?.access_token || null);
      setAuthState(AUTH_STATES.AUTHENTICATED);
      localStorage.setItem('bis_user', JSON.stringify(userObj));
      if (data.session?.access_token) {
        localStorage.setItem('bis_token', data.session.access_token);
      }
      localStorage.removeItem('bis_pending_verification');
      setPendingVerification(null);
      return userObj;
    } catch (err) {
      const friendlyMsg = formatAuthError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  // 2. Email & Password Registration (Creates Supabase User & triggers Verification)
  const register = async ({ email, password, full_name, company_name, role, mobile_number, enterprise_category, sector }) => {
    setLoading(true);
    setError(null);

    try {
      const trimmedEmail = email.trim();
      const trimmedName = full_name?.trim() || '';
      const trimmedCompany = company_name?.trim() || 'Registered Enterprise';

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            company_name: trimmedCompany,
            role: role || 'Manufacturer',
            mobile_number: mobile_number?.trim() || '',
            enterprise_category: enterprise_category || 'MSME - Small Enterprise',
            sector: sector || 'Consumer Goods & Utensils (IS 17803)',
            has_organization: true
          }
        }
      });

      if (error) {
        throw new Error(formatAuthError(error));
      }

      // Supabase user identity duplicate check
      if (data?.user?.identities && data.user.identities.length === 0) {
        throw new Error("An account with this email already exists. Please sign in instead.");
      }

      const authUser = data.user;
      const isAutoVerified = Boolean(authUser?.email_confirmed_at);

      const pendingData = {
        email: trimmedEmail,
        fullName: trimmedName,
        companyName: trimmedCompany,
        mobileNumber: mobile_number?.trim() || '',
        enterpriseCategory: enterprise_category || 'MSME - Small Enterprise',
        sector: sector || 'Consumer Goods & Utensils (IS 17803)'
      };

      if (!isAutoVerified) {
        // Unverified email: Set state to pending verification
        setAuthState(AUTH_STATES.EMAIL_VERIFICATION_PENDING);
        setPendingVerification(pendingData);
        localStorage.setItem('bis_pending_verification', JSON.stringify(pendingData));
        return { isVerified: false, email: trimmedEmail };
      }

      // If Supabase project has email confirmation disabled, user is immediately verified
      const userObj = formatSupabaseUser(authUser);
      await saveProfileAndOrgToDatabase(userObj, {
        company_name: trimmedCompany,
        enterprise_category,
        sector
      });

      setUser(userObj);
      if (data.session) {
        setToken(data.session.access_token);
        localStorage.setItem('bis_token', data.session.access_token);
      }
      if (userObj) {
        localStorage.setItem('bis_user', JSON.stringify(userObj));
      }
      setAuthState(AUTH_STATES.AUTHENTICATED);
      localStorage.removeItem('bis_pending_verification');
      setPendingVerification(null);

      return { isVerified: true, user: userObj };
    } catch (err) {
      const friendlyMsg = formatAuthError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  // 3. Check Verification Status (Actively queries Supabase)
  const checkEmailVerification = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      if (error) throw error;

      if (currentUser && currentUser.email_confirmed_at) {
        // Email confirmed!
        const { profile, org } = await checkDatabaseProfileAndOrg(currentUser.id);
        const userObj = formatSupabaseUser(currentUser, profile, org);

        // Save profile and org to DB if not yet saved
        const pending = pendingVerification;
        if (pending) {
          await saveProfileAndOrgToDatabase(userObj, {
            company_name: pending.companyName,
            enterprise_category: pending.enterpriseCategory,
            sector: pending.sector
          });
        }

        setUser(userObj);
        setAuthState(AUTH_STATES.EMAIL_VERIFIED);
        localStorage.setItem('bis_user', JSON.stringify(userObj));
        localStorage.removeItem('bis_pending_verification');
        setPendingVerification(null);
        return { verified: true, user: userObj };
      }

      return { verified: false, message: "Email has not been verified yet. Please check your inbox." };
    } catch (err) {
      return { verified: false, message: "Unable to check verification status. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  // 4. Resend Verification Email
  const resendVerificationEmail = async (targetEmail) => {
    const emailToUse = targetEmail || pendingVerification?.email;
    if (!emailToUse) {
      throw new Error("No pending verification email found.");
    }
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailToUse.trim()
      });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      throw new Error(formatAuthError(err));
    }
  };

  // 5. Complete Organization Onboarding (For new Google users or post-verification)
  const completeOrganizationOnboarding = async ({ company_name, enterprise_category, sector }) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      if (error || !currentUser) throw new Error("Active session required to save organization.");

      // Update Supabase user metadata
      await supabase.auth.updateUser({
        data: {
          company_name: company_name.trim(),
          enterprise_category,
          sector,
          has_organization: true
        }
      });

      const updatedUserObj = formatSupabaseUser(currentUser, null, {
        name: company_name.trim(),
        enterprise_category,
        primary_sector: sector
      });

      // Save to database
      await saveProfileAndOrgToDatabase(updatedUserObj, {
        company_name: company_name.trim(),
        enterprise_category,
        sector
      });

      setUser(updatedUserObj);
      setAuthState(AUTH_STATES.AUTHENTICATED);
      setNeedsOrgOnboarding(false);
      localStorage.setItem('bis_user', JSON.stringify(updatedUserObj));
      return updatedUserObj;
    } catch (err) {
      const friendly = formatAuthError(err);
      setError(friendly);
      throw new Error(friendly);
    } finally {
      setLoading(false);
    }
  };

  // 6. Google Sign In / Sign Up
  const loginWithGoogle = async (intent = 'login') => {
    setGoogleLoading(true);
    setError(null);
    try {
      // Store intent in sessionStorage so we can differentiate 'signup' vs 'login' on return
      sessionStorage.setItem('bis_oauth_intent', intent);
      const redirectUrl = window.location.origin;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline'
          }
        }
      });

      if (error) {
        throw new Error(formatAuthError(error));
      }

      if (data?.url) {
        window.location.href = data.url;
      }
      return data;
    } catch (err) {
      sessionStorage.removeItem('bis_oauth_intent');
      const friendly = formatAuthError(err);
      setError(friendly);
      throw new Error(friendly);
    } finally {
      setGoogleLoading(false);
    }
  };

  // 7. Reset Password
  const resetPassword = async (email) => {
    if (!email) {
      throw new Error("Please enter your email address to reset password.");
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin
    });
    if (error) throw new Error(formatAuthError(error));
    return data;
  };

  // 8. Quick Demo Login for testing
  const quickDemoLogin = async () => {
    const demoUser = {
      id: 'usr-demo-01',
      email: 'demo@msme.gov.in',
      full_name: 'Anil Sharma',
      company_name: 'Alpha Stainless Works Ltd.',
      role: 'Manufacturer',
      enterprise_category: 'MSME - Small Enterprise',
      sector: 'Consumer Goods & Utensils (IS 17803)',
      is_email_verified: true,
      has_organization: true
    };
    setUser(demoUser);
    setToken('demo-token-12345');
    setAuthState(AUTH_STATES.AUTHENTICATED);
    localStorage.setItem('bis_user', JSON.stringify(demoUser));
    localStorage.setItem('bis_token', 'demo-token-12345');
    localStorage.removeItem('bis_pending_verification');
    setPendingVerification(null);
    return demoUser;
  };

  // 9. Sign Out
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase signout note:", e.message);
    } finally {
      setUser(null);
      setToken(null);
      setAuthState(AUTH_STATES.UNAUTHENTICATED);
      setNeedsOrgOnboarding(false);
      setGoogleNotice(null);
      localStorage.removeItem('bis_user');
      localStorage.removeItem('bis_token');
      localStorage.removeItem('bis_pending_verification');
      setPendingVerification(null);
    }
  };

  const clearGoogleNotice = () => setGoogleNotice(null);
  const clearPendingVerification = () => {
    localStorage.removeItem('bis_pending_verification');
    setPendingVerification(null);
    setAuthState(AUTH_STATES.UNAUTHENTICATED);
  };

  return {
    user,
    token,
    loading,
    googleLoading,
    error,
    authState,
    pendingVerification,
    needsOrgOnboarding,
    googleNotice,
    login,
    register,
    loginWithGoogle,
    checkEmailVerification,
    resendVerificationEmail,
    completeOrganizationOnboarding,
    resetPassword,
    quickDemoLogin,
    logout,
    clearGoogleNotice,
    clearPendingVerification,
    setError
  };
}
