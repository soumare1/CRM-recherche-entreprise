import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Retourne true si Supabase est configuré ET activé.
 */
export function isSupabaseEnabled() {
  return (
    import.meta.env.VITE_DATA_MODE === 'supabase' &&
    typeof supabaseUrl === 'string' &&
    typeof supabaseKey === 'string' &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('VOTRE_PROJECT_ID') &&
    supabaseKey.length > 10
  );
}

/**
 * Client Supabase singleton — null si mode local.
 */
export const supabase = isSupabaseEnabled()
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;
