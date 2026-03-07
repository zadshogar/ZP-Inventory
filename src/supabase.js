import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = 'https://macjedqrgyposvqgwdof.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hY2plZHFyZ3lwb3N2cWd3ZG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NDU1MDksImV4cCI6MjA4ODQyMTUwOX0.p-yKt8gzK6NMAHTCE-SNCz9M--kFfi5gNicj4ekNIoY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
