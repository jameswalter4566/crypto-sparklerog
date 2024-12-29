import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fybgcaeoxptmmcwgslpl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5YmdjYWVveHB0bW1jd2dzbHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDM4NjY5NDcsImV4cCI6MjAxOTQ0Mjk0N30.SbUXk3vu6xGzRqIEkYGLg3AE3BcuUXyDpvGVzS_iwe0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});