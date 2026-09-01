import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const API_BASE = import.meta.env.VITE_API_URL || '';

const formatSupabaseUser = (sessionUser) => {
  if (!sessionUser) return null;
  const meta = sessionUser.user_metadata || {};
  return {
    id: sessionUser.id,
    email: sessionUser.email,
    full_name: meta.full_name || meta.name || sessionUser.email?.split('@')[0] || 'Authorized Representative',
    company_name: meta.company_name || 'Registered Enterprise',
    role: meta.role || 'Manufacturer',
    mobile_number: meta.mobile_number || '',
    enterprise_category: meta.enterprise_category || 'MSME - Small Enterprise',
    sector: meta.sector || 'Consumer Goods & Utensils',
    avatar_url: meta.avatar_url || meta.picture || '',
    provider: sessionUser.app_metadata?.provider || 'email'
  };
};

export function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('bis_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Purge old mock user from browser storage
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize and listen to Supabase Auth State
  useEffect(() => {
    let mounted = true;

    // Remove any stale demo session if present
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
          const formatted = formatSupabaseUser(session.user);
          setUser(formatted);
          setToken(session.access_token);
          localStorage.setItem('bis_user', JSON.stringify(formatted));
          localStorage.setItem('bis_token', session.access_token);
        }
      } catch (err) {
        console.warn("Supabase session check:", err.message);
      }
    }

    initSession();

    // Listen to real-time auth state events (OAuth callback, sign in, sign out)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (session && session.user) {
        const formatted = formatSupabaseUser(session.user);
        setUser(formatted);
        setToken(session.access_token);
        localStorage.setItem('bis_user', JSON.stringify(formatted));
        localStorage.setItem('bis_token', session.access_token);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setToken(null);
        localStorage.removeItem('bis_user');
        localStorage.removeItem('bis_token');
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        throw new Error(error.message || "Invalid credentials. Please verify your email and password.");
      }

      const userObj = formatSupabaseUser(data.user);
      setUser(userObj);
      setToken(data.session?.access_token || null);
      localStorage.setItem('bis_user', JSON.stringify(userObj));
      if (data.session?.access_token) {
        localStorage.setItem('bis_token', data.session.access_token);
      }
      return userObj;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ email, password, full_name, company_name, role, mobile_number, enterprise_category, sector }) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: full_name?.trim() || '',
            company_name: company_name?.trim() || 'Registered Enterprise',
            role: role || 'Manufacturer',
            mobile_number: mobile_number?.trim() || '',
            enterprise_category: enterprise_category || 'MSME - Small Enterprise',
            sector: sector || 'Consumer Goods & Utensils'
          }
        }
      });

      if (error) {
        throw new Error(error.message || "Registration failed. Please check your details.");
      }

      const userObj = formatSupabaseUser(data.user);
      setUser(userObj);
      if (data.session) {
        setToken(data.session.access_token);
        localStorage.setItem('bis_token', data.session.access_token);
      }
      if (userObj) {
        localStorage.setItem('bis_user', JSON.stringify(userObj));
      }
      return userObj;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const redirectUrl = window.location.origin;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) {
        throw new Error(error.message || "Failed to initiate Google authentication.");
      }

      // Explicitly redirect the window to Google OAuth consent page
      if (data?.url) {
        window.location.href = data.url;
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    if (!email) {
      throw new Error("Please enter your email address to reset password.");
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin
    });
    if (error) throw error;
    return data;
  };

  const quickDemoLogin = async () => {
    const demoUser = {
      id: 'usr-demo-01',
      email: 'demo@msme.gov.in',
      full_name: 'Anil Sharma',
      company_name: 'Alpha Stainless Works Ltd.',
      role: 'Manufacturer',
      enterprise_category: 'MSME - Small Enterprise',
      sector: 'Consumer Goods & Utensils'
    };
    setUser(demoUser);
    setToken('demo-token-12345');
    localStorage.setItem('bis_user', JSON.stringify(demoUser));
    localStorage.setItem('bis_token', 'demo-token-12345');
    return demoUser;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase signout note:", e.message);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('bis_user');
      localStorage.removeItem('bis_token');
    }
  };

  const saveAssessment = async (assessmentData) => {
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/api/auth/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(assessmentData)
      });
      return await res.json();
    } catch (err) {
      console.error("Save assessment error:", err);
      return null;
    }
  };

  const loadAssessments = async () => {
    if (!token) return [];
    try {
      const res = await fetch(`${API_BASE}/api/auth/assessments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      return [];
    }
  };

  return {
    user,
    token,
    loading,
    error,
    login,
    register,
    loginWithGoogle,
    resetPassword,
    quickDemoLogin,
    logout,
    saveAssessment,
    loadAssessments
  };
}
