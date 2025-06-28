import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.PUBLIC_SUPABASE_URL
const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY
const serviceKey = import.meta.env.SUPABASE_SERVICE_KEY

// During build time, environment variables might not be available
// Create a safe fallback to prevent build failures
const isBuildTime = typeof window === 'undefined' && (!url || !anon)

let supabase, supabaseService;

if (isBuildTime) {
  console.warn('⚠️ Build time detected - using fallback Supabase configuration')
  // Provide safe fallbacks during build
  const fallbackUrl = url || 'https://placeholder.supabase.co'
  const fallbackAnon = anon || 'placeholder-anon-key'
  
  // Create minimal clients for build
  supabase = createClient(fallbackUrl, fallbackAnon)
  supabaseService = createClient(fallbackUrl, fallbackAnon)
} else {
  // Runtime configuration with proper validation
  if (!url || !anon) {
    console.error('❌ Supabase environment variables missing:', { url: !!url, anon: !!anon })
    throw new Error('❌ Supabase env vars missing. Check PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in your environment.')
  }

  // Client for public operations (browser-safe)
  supabase = createClient(url, anon)

  // Client for server-side operations (admin/service operations)
  supabaseService = serviceKey ? createClient(url, serviceKey) : null

  if (!serviceKey && typeof window === 'undefined') {
    console.warn('⚠️ Supabase service role key missing. Server-side operations will be limited.')
  }
}

// Export the clients
export { supabase, supabaseService }

// Default export for convenience
export default supabase
