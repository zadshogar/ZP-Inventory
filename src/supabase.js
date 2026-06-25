import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = 'https://puphzwdlzqgbhmogiern.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aMzGc8o0pu88iBMzaveKmg_KDwgH9a7';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = 'https://puphzwdlzqgbhmogiern.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aMzGc8o0pu88iBMzaveKmg_KDwgH9a7';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test connection on load
supabase.from('parts').select('count').then(({ data, error }) => {
  if (error) console.error('Supabase connection error:', error);
  else console.log('Supabase connected OK:', data);
});
