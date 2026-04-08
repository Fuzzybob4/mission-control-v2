import { createClient } from "@supabase/supabase-js"
import { webcrypto } from "crypto"
import { deriveKey, decryptCredential, type EncryptedCredential } from "@/skills/credential-vault/lib/encryption"

const cryptoApi = (globalThis.crypto ?? webcrypto) as Crypto

type CredentialRow = {
  provider: string
  account: string
  field_name: string
  encrypted_value: string
  iv: string
  tag: string
  business_unit?: string | null
}

type VaultMetadataRow = {
  encryption_key_salt: string
}

const BUSINESS_CANDIDATES = ["knightforge", "general"]
const PROVIDER_CANDIDATES = ["elevenlabs", "11labs"]
const FIELD_CANDIDATES = ["api_key", "elevenlabs_api_key", "key", "secret_key"]

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })
}

function base64ToUint8Array(base64: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64, "base64"))
}

async function deriveVaultKey() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("vault_metadata")
    .select("encryption_key_salt")
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    throw new Error("Vault metadata unavailable.")
  }

  const pin = process.env.VAULT_PIN || "2846"
  return deriveKey(pin, base64ToUint8Array((data as VaultMetadataRow).encryption_key_salt))
}

async function readCredentialRows() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("vault_credentials")
    .select("provider, account, field_name, encrypted_value, iv, tag, business_unit")
    .order("updated_at", { ascending: false })

  if (error) throw error
  return (data || []) as CredentialRow[]
}

export async function getElevenLabsApiKey() {
  const direct = process.env.ELEVENLABS_API_KEY || process.env.XI_API_KEY
  if (direct) return direct

  const key = await deriveVaultKey()
  const rows = await readCredentialRows()

  const providerMatches = rows.filter(row => PROVIDER_CANDIDATES.includes(row.provider.toLowerCase()))
  for (const business of BUSINESS_CANDIDATES) {
    const businessRows = providerMatches.filter(row => (row.business_unit || "general") === business)
    for (const row of businessRows) {
      if (!FIELD_CANDIDATES.includes(row.field_name.toLowerCase())) continue
      return decryptCredential({
        encrypted_value: row.encrypted_value,
        iv: row.iv,
        tag: row.tag,
      } as EncryptedCredential, key)
    }
  }

  throw new Error("No ElevenLabs API key found in secure vault.")
}
