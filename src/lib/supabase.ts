import { supabaseAuth } from "./supabase-auth";

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co"
);

export const supabase = isSupabaseConfigured ? supabaseAuth : null;
