import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fybgcaeoxptmmcwgslpl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5YmdjYWVveHB0bW1jd2dzbHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQyNTIzMjcsImV4cCI6MjA0OTgyODMyN30.JTba3_19NBU3V7E_cpBLN0QazWepP87QkJoX78f7bPg";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web/2.38.4',
      },
    },
  }
);