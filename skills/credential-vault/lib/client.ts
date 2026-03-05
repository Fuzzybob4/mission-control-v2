"use client"

import { createClient } from "@supabase/supabase-js"

export type VaultField = {
  name: string
  value: string
  updatedAt?: string
}

type UnlockResponse = {
  token: string
  expiresAt: number
}

const SESSION_STORAGE_KEY = "mission-control.vault.token"
const SESSION_EXPIRY_KEY = "mission-control.vault.expiry"

let sessionToken: string | null = null
let sessionExpiry: number | null = null
const listeners = new Set<() => void>()

function clearSession(notifyListeners: boolean = true) {
  sessionToken = null
  sessionExpiry = null
  persistSession()
  if (notifyListeners) {
    notify()
  }
}

if (typeof window !== "undefined") {
  sessionToken = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
  const expiryRaw = window.sessionStorage.getItem(SESSION_EXPIRY_KEY)
  sessionExpiry = expiryRaw ? Number(expiryRaw) : null
}

const supabaseRealtimeUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const realtimeClient = supabaseRealtimeUrl && supabaseAnonKey
  ? createClient(supabaseRealtimeUrl, supabaseAnonKey, { auth: { persistSession: false } })
  : null

export type VaultChangeHandler = (payload: {
  eventType: "INSERT" | "UPDATE" | "DELETE"
  new?: Record<string, any>
  old?: Record<string, any>
}) => void

export function subscribeToVaultChanges(handler: VaultChangeHandler) {
  if (!realtimeClient) {
    return { unsubscribe: () => {} }
  }

  const channel = realtimeClient
    .channel("vault_changes_ui")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "vault_credentials" },
      payload => handler({ eventType: payload.eventType as any, new: payload.new, old: payload.old })
    )
    .subscribe()

  return {
    unsubscribe: () => {
      realtimeClient.removeChannel(channel)
    },
  }
}

function notify() {
  listeners.forEach(listener => listener())
}

function persistSession() {
  if (typeof window === "undefined") return
  if (sessionToken && sessionExpiry) {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, sessionToken)
    window.sessionStorage.setItem(SESSION_EXPIRY_KEY, sessionExpiry.toString())
  } else {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
    window.sessionStorage.removeItem(SESSION_EXPIRY_KEY)
  }
}

async function request<T = any>(action: string, body?: Record<string, any>): Promise<T> {
  if (!sessionToken && action !== "unlock") {
    throw new Error("Vault is locked")
  }

  const response = await fetch("/api/vault", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
    },
    body: JSON.stringify({ action, ...body }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    const message = (error && typeof error.error === 'string') ? error.error : 'Vault request failed'
    if (typeof message === 'string' && message.toLowerCase().includes('expired')) {
      clearSession()
    }
    throw new Error(message)
  }

  const data = await response.json()
  if (data?.expiresAt) {
    sessionExpiry = typeof data.expiresAt === "number" ? data.expiresAt : Number(data.expiresAt)
    persistSession()
  }
  return data as T
}

export const vaultClient = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  isUnlocked() {
    if (!sessionToken || !sessionExpiry) return false
    return sessionExpiry > Date.now()
  },

  isSessionExpired() {
    if (!sessionToken || !sessionExpiry) return true
    return sessionExpiry <= Date.now()
  },

  getSessionExpiry(): Date | null {
    if (!sessionExpiry) return null
    return new Date(sessionExpiry)
  },

  async unlock(pin: string) {
    const result = await request<UnlockResponse>("unlock", { pin })
    sessionToken = result.token
    sessionExpiry = result.expiresAt
    persistSession()
    notify()
    return { success: true, sessionExpiry: new Date(result.expiresAt) }
  },

  async lock() {
    if (!sessionToken) return
    await request("lock")
    clearSession()
  },

  async listByBusiness(businessUnit: string): Promise<{ provider: string; account: string }[]> {
    const { services } = await request<{ services: { provider: string; account: string }[] }>("listByBusiness", { business_unit: businessUnit })
    return services
  },

  async listProviders(): Promise<string[]> {
    const { providers } = await request<{ providers: string[] }>("listProviders")
    return providers
  },

  async listAccounts(provider: string): Promise<string[]> {
    const { accounts } = await request<{ accounts: string[] }>("listAccounts", { provider })
    return accounts
  },

  async getFields(provider: string, account: string): Promise<VaultField[]> {
    const { fields } = await request<{ fields: VaultField[] }>("getFields", { provider, account })
    return fields
  },

  async add(provider: string, account: string, data: Record<string, string>, businessUnit?: string) {
    await request("saveCredentials", { provider, account, fields: data, business_unit: businessUnit || "general" })
  },

  async edit(provider: string, account: string, field: string, value: string) {
    await request("saveCredentials", { provider, account, fields: { [field]: value } })
  },

  async delete(provider: string, account?: string, field?: string) {
    await request("delete", { provider, account, field })
  },

  async getAuditLog(limit: number = 50) {
    const { entries } = await request<{ entries: any[] }>("auditLog", { limit })
    return entries
  },
}
