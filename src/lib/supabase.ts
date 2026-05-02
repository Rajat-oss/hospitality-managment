import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

// Temporary fix: If the Supabase project is the known deleted one, 
// clear the stale auth token from local storage to prevent infinite ERR_NAME_NOT_RESOLVED loops.
if (supabaseUrl && supabaseUrl.includes('drowhltnfjjyaocoemde')) {
  if (typeof window !== 'undefined') {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
        localStorage.removeItem(key)
      }
    })
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type { User, Session } from '@supabase/supabase-js'
