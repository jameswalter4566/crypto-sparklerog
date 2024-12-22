import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing environment variables');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Add error logging
supabase.auth.onAuthStateChange((event, session) => {
  console.log('[Supabase] Auth state changed:', event, session?.user?.id);
});