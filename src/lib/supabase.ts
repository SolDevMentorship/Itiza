import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase.ts';

console.log (import.meta.env.VITE_PUBLIC_SUPABASE_URL)

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);