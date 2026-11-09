import {createClient} from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');

export const supabaseProjectRef = (() => {
  try {
    const hostname = new URL(url).hostname;
    return hostname.match(/^([a-z0-9-]+)\.supabase\.co$/i)?.[1] ?? null;
  } catch {
    return null;
  }
})();

export const supabaseAdmin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false }
});
