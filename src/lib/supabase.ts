import { createClient } from "@supabase/supabase-js";
import { config } from "./config";

let _supabase: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!_supabase) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || config.supabase.url;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || config.supabase.anonKey;

    // Fallback validation
    if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
      console.error('Invalid Supabase URL:', supabaseUrl);
      throw new Error('Invalid Supabase URL configuration');
    }

    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}
