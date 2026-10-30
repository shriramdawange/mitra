/**
 * Supabase client configuration.
 * 
 * To use Supabase, set the following environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous key
 * 
 * If these are not set, the app falls back to the existing Drizzle/Postgres backend.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Creates a Supabase client instance.
 * Returns null if credentials are not configured.
 */
export function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  // You would import and instantiate the Supabase client here:
  // import { createSupabaseClient } from '@supabase/auth-helpers-nextjs';
  // return createSupabaseClient();
  return null;
}