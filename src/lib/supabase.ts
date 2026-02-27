import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// DEV bypass: when env vars are missing, Supabase calls will fail gracefully
// but the app will still render via the mock auth provider
export const isDev = !supabaseUrl || !supabaseAnonKey

export const supabase = createClient<Database>(
  supabaseUrl || 'http://localhost',
  supabaseAnonKey || 'dev-placeholder',
)
