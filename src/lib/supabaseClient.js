import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anon) {
  throw new Error('❌ Supabase env vars missing. Did you create .env and restart?')
}

export const supabase = createClient(url, anon)
