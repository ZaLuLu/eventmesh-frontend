import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://xzxuahmqljsvzcsvthjz.supabase.co'
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6eHVhaG1xbGpzdnpjc3Z0aGp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNjI5NTMsImV4cCI6MjA5ODYzODk1M30.Ak5mrBPJuh5f8ufE0r35Cak98nMMtAy4AXIAXN3hjyA'

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'eventmesh.auth',
  },
})

// Keep localStorage eventmesh_auth_token in sync with Supabase session
supabase.auth.onAuthStateChange((event: any, session: any) => {
  if (session?.access_token) {
    localStorage.setItem('eventmesh_auth_token', session.access_token)
  } else if (event === 'SIGNED_OUT') {
    localStorage.removeItem('eventmesh_auth_token')
    localStorage.removeItem('eventmesh_user_role')
    localStorage.removeItem('eventmesh_user_club_id')
  }
})

/**
 * Safely retrieves or auto-refreshes the active access token across browser sessions
 */
export async function getFreshAuthToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      localStorage.setItem('eventmesh_auth_token', session.access_token)
      return session.access_token
    }
  } catch {}
  return localStorage.getItem('eventmesh_auth_token')
}

/**
 * Sign in using Google Identity Services ID token (popup/one-tap without full page redirect)
 */
export async function signInWithGoogleIdToken(idToken: string) {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  })
  if (error) throw error
  if (data.session?.access_token) {
    localStorage.setItem('eventmesh_auth_token', data.session.access_token)
  }
  return data
}

/**
 * Sign in using standard Supabase Google OAuth redirect
 */
export async function signInWithGoogleOAuth() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/login`,
    },
  })
  if (error) throw error
  if (data?.url) {
    window.location.assign(data.url)
  }
  return data
}
