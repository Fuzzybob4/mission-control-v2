import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"
import { randomUUID, webcrypto } from "crypto"
import {
  deriveKey,
  encryptCredential,
  decryptCredential,
  generateSalt,
  hashPin,
  type EncryptedCredential,
} from "@/skills/credential-vault/lib/encryption"

type SessionRecord = {
  key: CryptoKey
  expiresAt: number
}

type CredentialRow = {
  id: string
  provider: string
  account: string
  field_name: string
  encrypted_value: string
  iv: string
  tag: string
  created_at: string
  updated_at: string
}

type VaultMetadataRow = {
  id: string
  pin_hash: string
  salt: string
  encryption_key_salt: string
  created_at: string
  updated_at: string
}

const cryptoApi = (globalThis.crypto ?? webcrypto) as Crypto

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const vaultPin = process.env.VAULT_PIN || "2846"
const sessionTtlHours = Number(process.env.VAULT_SESSION_TTL_HOURS || "24")

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

const sessions = new Map<string, SessionRecord>()
const SESSION_TTL_MS = sessionTtlHours * 60 * 60 * 1000

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const action = body?.action as string | undefined
  const ip = extractIp(req)

  if (!action) {
    return NextResponse.json({ error: "Missing action" }, { status: 400 })
  }

  try {
    switch (action) {
      case "unlock": {
        const pin = body?.pin as string | undefined
        if (!pin) throw new Error("PIN is required")
        const result = await handleUnlock(pin, ip)
        return NextResponse.json(result)
      }
      case "lock": {
        const token = getToken(req, body)
        await handleLock(token, ip)
        return NextResponse.json({ success: true })
      }
      case "listProviders": {
        const token = getToken(req, body)
        const session = requireSession(token)
        const providers = await listProviders()
        await logAudit({ action: "list_providers", success: true, ip })
        return NextResponse.json({ providers, expiresAt: session.expiresAt })
      }
      case "listAccounts": {
        const token = getToken(req, body)
        const { provider } = body
        if (!provider) throw new Error("Provider is required")
        const session = requireSession(token)
        const accounts = await listAccounts(provider)
        await logAudit({ action: "list_accounts", provider, success: true, ip })
        return NextResponse.json({ accounts, expiresAt: session.expiresAt })
      }
      case "getFields": {
        const token = getToken(req, body)
        const session = requireSession(token)
        const { provider, account } = body
        if (!provider || !account) throw new Error("Provider and account are required")
        const fields = await getFields(session, provider, account)
        await logAudit({ action: "get", provider, account, success: true, ip })
        return NextResponse.json({ fields, expiresAt: session.expiresAt })
      }
      case "saveCredentials": {
        const token = getToken(req, body)
        const session = requireSession(token)
        const { provider, account, fields } = body as { provider: string; account: string; fields: Record<string, string> }
        if (!provider || !account || !fields || Object.keys(fields).length === 0) {
          throw new Error("Provider, account, and at least one field are required")
        }
        await saveCredentials(session, provider, account, fields)
        await logAudit({ action: "add", provider, account, success: true, ip })
        return NextResponse.json({ success: true, expiresAt: session.expiresAt })
      }
      case "delete": {
        const token = getToken(req, body)
        const session = requireSession(token)
        const { provider, account, field } = body as { provider: string; account?: string; field?: string }
        if (!provider) throw new Error("Provider is required")
        await deleteCredential(provider, account, field)
        await logAudit({ action: "delete", provider, account, field, success: true, ip })
        return NextResponse.json({ success: true, expiresAt: session.expiresAt })
      }
      case "auditLog": {
        const token = getToken(req, body)
        const session = requireSession(token)
        const entries = await getAuditLog()
        return NextResponse.json({ entries, expiresAt: session.expiresAt })
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (error) {
    console.error("[vault-api]", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal error" }, { status: 400 })
  }
}

async function handleUnlock(pin: string, ip?: string) {
  await ensureMetadata()

  if (pin !== vaultPin) {
    await logAudit({ action: "unlock_attempt", success: false, ip })
    throw new Error("Invalid PIN")
  }

  const encryptionKey = await deriveEncryptionKey(pin)
  const token = randomUUID()
  const expiresAt = Date.now() + SESSION_TTL_MS

  sessions.set(token, { key: encryptionKey, expiresAt })
  await logAudit({ action: "unlock", success: true, ip })

  return {
    token,
    expiresAt,
  }
}

async function handleLock(token: string, ip?: string) {
  sessions.delete(token)
  await logAudit({ action: "lock", success: true, ip })
}

function getToken(req: NextRequest, body: any): string {
  const authHeader = req.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7)
  }
  if (body?.token) return body.token
  throw new Error("Missing session token")
}

function requireSession(token: string): SessionRecord {
  const session = sessions.get(token)
  if (!session) {
    throw new Error("Vault session expired. Please unlock again.")
  }
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token)
    throw new Error("Vault session expired. Please unlock again.")
  }
  return session
}

async function listProviders(): Promise<string[]> {
  const { data, error } = await supabase
    .from("vault_credentials")
    .select("provider")
    .order("provider")

  if (error) throw error
  return Array.from(new Set((data as { provider: string }[] | null)?.map(row => row.provider) || []))
}

async function listAccounts(provider: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("vault_credentials")
    .select("account")
    .eq("provider", provider)
    .order("account")

  if (error) throw error
  return Array.from(new Set((data as { account: string }[] | null)?.map(row => row.account) || []))
}

async function getFields(session: SessionRecord, provider: string, account: string) {
  const { data, error } = await supabase
    .from("vault_credentials")
    .select("id, field_name, encrypted_value, iv, tag, updated_at")
    .eq("provider", provider)
    .eq("account", account)
    .order("field_name")

  if (error) throw error

  const rows = (data || []) as CredentialRow[]

  const fields = await Promise.all(
    rows.map(async row => {
      const decrypted = await decryptCredential(
        {
          encrypted_value: row.encrypted_value,
          iv: row.iv,
          tag: row.tag,
        } as EncryptedCredential,
        session.key
      )
      return {
        name: row.field_name,
        value: decrypted,
        updatedAt: row.updated_at,
      }
    })
  )

  return fields
}

async function saveCredentials(session: SessionRecord, provider: string, account: string, fields: Record<string, string>) {
  const entries = Object.entries(fields)
  for (const [fieldName, value] of entries) {
    const encrypted = await encryptCredential(value, session.key)
    const { error } = await supabase.from("vault_credentials").upsert(
      {
        provider,
        account,
        field_name: fieldName,
        encrypted_value: encrypted.encrypted_value,
        iv: encrypted.iv,
        tag: encrypted.tag,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "provider,account,field_name" }
    )
    if (error) throw error
  }
}

async function deleteCredential(provider: string, account?: string, field?: string) {
  let query = supabase.from("vault_credentials").delete().eq("provider", provider)
  if (account) query = query.eq("account", account)
  if (field) query = query.eq("field_name", field)
  const { error } = await query
  if (error) throw error
}

async function getAuditLog(limit: number = 50) {
  const { data, error } = await supabase
    .from("vault_audit_log")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

async function ensureMetadata() {
  const metadata = await fetchMetadata()
  if (metadata) return metadata

  const salt = generateSalt()
  const encryptionSalt = generateSalt()
  const pinHash = await hashPin(vaultPin)

  const { data, error } = await supabase
    .from("vault_metadata")
    .insert({
      pin_hash: pinHash,
      salt: bufferToBase64(salt),
      encryption_key_salt: bufferToBase64(encryptionSalt),
    })
    .select()
    .single()

  if (error) throw error
  return data as VaultMetadataRow
}

async function fetchMetadata(): Promise<VaultMetadataRow | null> {
  const { data, error } = await supabase
    .from("vault_metadata")
    .select("id, pin_hash, salt, encryption_key_salt, created_at, updated_at")
    .limit(1)
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    throw error
  }

  return (data as VaultMetadataRow | null) || null
}

async function deriveEncryptionKey(pin: string): Promise<CryptoKey> {
  const metadata = await ensureMetadata()
  const saltArray = base64ToUint8Array(metadata.encryption_key_salt)
  return deriveKey(pin, saltArray)
}

async function logAudit(entry: { action: string; provider?: string; account?: string; field?: string; success: boolean; ip?: string }) {
  try {
    await supabase.from("vault_audit_log").insert({
      action: entry.action,
      provider: entry.provider,
      account: entry.account,
      field: entry.field,
      success: entry.success,
      ip_address: entry.ip,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[vault-audit]", error)
  }
}

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const uint8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  return Buffer.from(uint8).toString("base64")
}

function base64ToUint8Array(base64: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64, "base64"))
}

function extractIp(req: NextRequest): string | undefined {
  const header = req.headers.get("x-forwarded-for")
  if (header) {
    return header.split(",")[0]?.trim()
  }
  return (req as any).ip || undefined
}
