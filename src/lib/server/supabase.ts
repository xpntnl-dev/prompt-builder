import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '$env/static/private';

// Server-side Supabase client with service role key
// SECURITY: This client bypasses RLS and should ONLY be used server-side
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
	auth: {
		persistSession: false,
		autoRefreshToken: false
	}
});
