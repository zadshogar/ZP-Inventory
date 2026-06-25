const SUPABASE_URL      = 'https://puphzwdlzqgbhmogiern.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aMzGc8o0pu88iBMzaveKmg_KDwgH9a7';

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
};

async function req(url, options = {}) {
  const r = await fetch(url, { ...options, headers: {...headers, ...(options.headers||{})} });
  const text = await r.text();
  let data = null;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!r.ok) {
    alert('Supabase error: ' + JSON.stringify(data));
    return { data: null, error: data };
  }
  return { data: Array.isArray(data) ? data : [], error: null };
}

export const supabase = {
  from: (table) => ({
    select: (cols = '*') => ({
      order: (col, opts = {}) => req(
        `${SUPABASE_URL}/rest/v1/${table}?select=${cols}&order=${col}.${opts.ascending===false?'desc':'asc'}`
      ),
    }),
    insert: (row) => req(
      `${SUPABASE_URL}/rest/v1/${table}`,
      { method:'POST', headers:{'Prefer':'return=minimal'}, body: JSON.stringify(row) }
    ),
    update: (changes) => ({
      eq: (col, val) => req(
        `${SUPABASE_URL}/rest/v1/${table}?${col}=eq.${val}`,
        { method:'PATCH', headers:{'Prefer':'return=minimal'}, body: JSON.stringify(changes) }
      ),
    }),
    delete: () => ({
      eq: (col, val) => req(
        `${SUPABASE_URL}/rest/v1/${table}?${col}=eq.${val}`,
        { method:'DELETE' }
      ),
    }),
  }),
};
