import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('[v0] Supabase URL:', supabaseUrl ? 'SET' : 'NOT SET')
console.log('[v0] Supabase Key:', supabaseKey ? 'SET' : 'NOT SET')

if (!supabaseUrl || !supabaseKey) {
  console.error('[v0] Missing Supabase credentials. Please check your environment variables.')
}

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null
