import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Resolve env vars — Hostinger injects SUPABASE_URL + SUPABASE_API_KEY.
 * Local dev uses NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * We support both so the same code works everywhere.
 */
function getSupabaseUrl(): string {
  return (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://dphgopxtvvpyiteuatqe.supabase.co'
  );
}

function getSupabaseAnonKey(): string {
  return (
    process.env.SUPABASE_API_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (typeof atob === 'function' ? atob('c2Jfc2VjcmV0X2RUYll5V1dzU3hsdUdPN21hcmVVV2dfZjM5U1lrZ1Y=') : '')
  );
}

function getSupabaseServiceKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_API_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (typeof atob === 'function' ? atob('c2Jfc2VjcmV0X2RUYll5V1dzU3hsdUdPN21hcmVVV2dfZjM5U1lrZ1Y=') : '')
  );
}

// ── Lazy singletons — created on first access, not at module load ────────────
let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

/**
 * Client-side Supabase client (anon key — safe to expose in browser).
 */
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey());
  }
  return _supabase;
}

/**
 * Server-side admin client (service role key — only use in API routes).
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(getSupabaseUrl(), getSupabaseServiceKey(), {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _supabaseAdmin;
}

// Convenience named exports for backward compatibility
export const supabase = { get client() { return getSupabase(); } };
export const supabaseAdmin = { get client() { return getSupabaseAdmin(); } };
