import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let supabaseAdminClient: SupabaseClient | null = null

export function getSupabaseAdminClient(): SupabaseClient {
  if (supabaseAdminClient) {
    return supabaseAdminClient
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("[mission-control] Missing Supabase admin credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
  }

  supabaseAdminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  })

  return supabaseAdminClient
}
