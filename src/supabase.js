const SUPABASE_URL      = 'https://puphzwdlzqgbhmogiern.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_aMzGc8o0pu88iBMzaveKmg_KDwgH9a7';

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
};

export const supabase = {
  from: (table) => ({
    select: (cols = '*') => ({
      order: (col, opts = {}) => fetch(
        `${SUPABASE_URL}/rest/v1/${table}?select=${cols}&order=${col}.${opts.ascending===false?'desc':'asc'}`,
        { headers }
      ).then(r => r.json()).then(data => ({ data: Array.isArray(data) ? data : [], error: data.error||null })),
    }),
    insert: (row) => fetch(
      `${SUPABASE_URL}/rest/v1/${table}`,
      { method:'POST', headers: {...headers, 'Prefer':'return=minimal'}, body: JSON.stringify(row) }
    ).then(r => ({ error: r.ok ? null : r.statusText })),
    update: (changes) => ({
      eq: (col, val) => fetch(
        `${SUPABASE_URL}/rest/v1/${table}?${col}=eq.${val}`,
        { method:'PATCH', headers: {...headers, 'Prefer':'return=minimal'}, body: JSON.stringify(changes) }
      ).then(r => ({ error: r.ok ? null : r.statusText })),
    }),
    delete: () => ({
      eq: (col, val) => fetch(
        `${SUPABASE_URL}/rest/v1/${table}?${col}=eq.${val}`,
        { method:'DELETE', headers }
      ).then(r => ({ error: r.ok ? null : r.statusText })),
    }),
  }),
};
