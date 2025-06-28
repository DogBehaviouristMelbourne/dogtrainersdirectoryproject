import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.PUBLIC_SUPABASE_URL
const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY
const serviceKey = import.meta.env.SUPABASE_SERVICE_KEY

if (!url || !anon) {
  console.error('❌ Supabase environment variables missing:', { url: !!url, anon: !!anon })
  throw new Error('❌ Supabase env vars missing. Check PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in your environment.')
}

// Client for public operations (browser-safe)
export const supabase = createClient(url, anon)

// Client for server-side operations (admin/service operations)
export const supabaseService = serviceKey ? createClient(url, serviceKey) : null

if (!serviceKey) {
  console.warn('⚠️ Supabase service role key missing. Server-side operations will be limited.')
}

// Default export for convenience
export default supabase
