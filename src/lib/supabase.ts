import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// The app works locally without Supabase. When both public values are supplied,
// this client is ready for private account sync. Never place a service-role key here.
export const supabase = url && key ? createClient(url, key) : null
export const isSupabaseConfigured = Boolean(supabase)
