import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

/**
 * Standard Supabase client using Anon Key for authenticated user context operations.
 */
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper to construct a authenticated Supabase client using user JWT Bearer token
 */
export function getAuthenticatedSupabaseClient(accessToken: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
