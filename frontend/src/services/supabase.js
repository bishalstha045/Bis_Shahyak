import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://cramrpbgdkqbwxxmwoxz.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_vTDFhoG3OeAfwki4ziw8fA_VbMThOJQ';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage
    }
  }
);

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};
