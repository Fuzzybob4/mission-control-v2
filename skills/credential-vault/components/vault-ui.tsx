"use client"

import React, { useState, useEffect, useCallback } from "react"
import { vaultClient } from "../lib/client"
import "./vault-ui.css"

// ─── Types ────────────────────────────────────────────────────────────────────

type CredentialData = Record<string, string>

interface Field {
  name: string
  value: string
  revealed: boolean
}

interface ServiceEntry {
  provider: string
  account: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BUSINESS_UNITS = [
  { id: "general",        label: "General / Shared",   color: "#94a3b8", abbr: "GS" },
  { id: "lone-star",      label: "Lone Star Lighting", color: "#fbbf24", abbr: "LS" },
  { id: "redfox",         label: "RedFox CRM",         color: "#f87171", abbr: "RF" },
  { id: "heroes",         label: "Heroes of the Meta", color: "#a78bfa", abbr: "HM" },
  { id: "from-inception", label: "From Inception",     color: "#34d399", abbr: "FI" },
  { id: "agents",         label: "Agent Network",      color: "#60a5fa", abbr: "AN" },
]

// Known service icons (text-based to avoid emoji rendering issues)
const SERVICE_ICONS: Record<string, string> = {
  stripe: "Stripe",
  openai: "OpenAI",
  supabase: "Supabase",
  github: "GitHub",
  vercel: "Vercel",
  google: "Google",
  telegram: "Telegram",
  twilio: "Twilio",
  sendgrid: "SendGrid",
  hubspot: "HubSpot",
  shopify: "Shopify",
  aws: "AWS",
  cloudflare: "CF",
  notion: "Notion",
  slack: "Slack",
  discord: "Discord",
}

// ─── PIN Entry ─────────────────────────────────────────────────────────────────

export const PinEntry: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [pin, setPin] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleDigit = (d: string) => {
    if (pin.length < 4 && !submitting) setPin(p => p + d)
  }

  const handleSubmit = useCallback(async () => {
    if (submitting || pin.length !== 4) return
    try {
      setSubmitting(true)
      await vaultClient.unlock(pin)
      setMessage("Vault unlocked!")
      setTimeout(onUnlock, 350)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Invalid PIN")
      setPin("")
    } finally {
      setSubmitting(false)
    }
  }, [pin, submitting, onUnlock])

  useEffect(() => {
    if (pin.length === 4 && !submitting) handleSubmit()
  }, [pin, submitting, handleSubmit])

  return (
    <div className="vault-pin-entry">
      <div className="vault-shield-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" />
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2>Credential Vault</h2>
      <p className="pin-subtitle">Enter your 4-digit PIN to unlock</p>

      <div className="pin-display">
        {[0, 1, 2, 3].map(i => (
          <span key={i} className={`pin-dot ${i < pin.length ? "filled" : ""}`} />
        ))}
      </div>

      <div className="keypad">
        {["1","2","3","4","5","6","7","8","9"].map(d => (
          <button key={d} className="keypad-btn" onClick={() => handleDigit(d)} disabled={submitting}>{d}</button>
        ))}
        <button className="keypad-btn clear" onClick={() => setPin("")} disabled={submitting}>C</button>
        <button className="keypad-btn" onClick={() => handleDigit("0")} disabled={submitting}>0</button>
        <button className="keypad-btn backspace" onClick={() => setPin(p => p.slice(0, -1))} disabled={submitting}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z" />
            <line x1="18" y1="9" x2="12" y2="15" />
            <line x1="12" y1="9" x2="18" y2="15" />
          </svg>
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes("unlocked") ? "success" : "error"}`}>
          {message}
        </div>
      )}
      <div className="session-info">Session lasts 24 hours</div>
    </div>
  )
}

// ─── Add Key Form (for adding a field to a service) ───────────────────────────

const AddKeyForm: React.FC<{
  businessId: string
  provider: string
  account: string
  onSaved: () => void
  onCancel: () => void
}> = ({ businessId, provider, account, onSaved, onCancel }) => {
  const [fieldName, setFieldName] = useState("")
  const [fieldValue, setFieldValue] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!fieldName.trim()) { setError("Enter a field name (e.g. api_key, secret_key, password)"); return }
    if (!fieldValue.trim()) { setError("Enter the key value"); return }
    setError("")
    try {
      setSaving(true)
      await vaultClient.add(provider, account, { [fieldName.trim()]: fieldValue.trim() }, businessId)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="add-key-form">
      <h4>Add Key to {account}</h4>
      <div className="form-group">
        <label>Access Name</label>
        <input
          type="text"
          value={fieldName}
          onChange={e => setFieldName(e.target.value)}
          placeholder="e.g. api_key, secret_key, webhook_secret"
          autoFocus
        />
      </div>
      <div className="form-group">
        <label>Key / Value</label>
        <input
          type="password"
          value={fieldValue}
          onChange={e => setFieldValue(e.target.value)}
          placeholder="Paste your key or secret here"
        />
      </div>
      {error && <div className="message error">{error}</div>}
      <div className="form-actions">
        <button className="btn-save" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Key"}
        </button>
        <button className="btn-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

// ─── Add Service Form ──────────────────────────────────────────────────────────

const AddServiceForm: React.FC<{
  businessId: string
  onSaved: (provider: string, account: string) => void
  onCancel: () => void
}> = ({ businessId, onSaved, onCancel }) => {
  const [serviceName, setServiceName] = useState("")
  const [fieldName, setFieldName] = useState("api_key")
  const [fieldValue, setFieldValue] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!serviceName.trim()) { setError("Enter a service name (e.g. Stripe, GitHub)"); return }
    if (!fieldValue.trim()) { setError("Enter the key value"); return }
    setError("")
    const provider = serviceName.trim().toLowerCase().replace(/\s+/g, "_")
    const account = serviceName.trim()
    try {
      setSaving(true)
      await vaultClient.add(provider, account, { [fieldName.trim() || "api_key"]: fieldValue.trim() }, businessId)
      onSaved(provider, account)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="add-key-form">
      <h4>Add New Service</h4>
      <div className="form-group">
        <label>Service Name</label>
        <input
          type="text"
          value={serviceName}
          onChange={e => setServiceName(e.target.value)}
          placeholder="e.g. Stripe, OpenAI, GitHub"
          autoFocus
        />
      </div>
      <div className="form-group">
        <label>Access Name</label>
        <input
          type="text"
          value={fieldName}
          onChange={e => setFieldName(e.target.value)}
          placeholder="e.g. api_key, secret_key, password"
        />
      </div>
      <div className="form-group">
        <label>Key / Value</label>
        <input
          type="password"
          value={fieldValue}
          onChange={e => setFieldValue(e.target.value)}
          placeholder="Paste your key or secret here"
        />
      </div>
      {error && <div className="message error">{error}</div>}
      <div className="form-actions">
        <button className="btn-save" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Add Credential"}
        </button>
        <button className="btn-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

// ─── Service Detail Panel ──────────────────────────────────────────────────────

const ServiceDetail: React.FC<{
  businessId: string
  provider: string
  account: string
  onBack: () => void
  onDeleted: () => void
}> = ({ businessId, provider, account, onBack, onDeleted }) => {
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddKey, setShowAddKey] = useState(false)
  const [editingField, setEditingField] = useState<{ name: string; value: string } | null>(null)
  const [editValue, setEditValue] = useState("")
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const loadFields = useCallback(async () => {
    try {
      setLoading(true)
      const data = await vaultClient.getFields(provider, account)
      setFields(data.map(f => ({ name: f.name, value: f.value, revealed: false })))
    } catch (err) {
      console.error("[vault] loadFields error:", err)
    } finally {
      setLoading(false)
    }
  }, [provider, account])

  useEffect(() => { loadFields() }, [loadFields])

  const handleReveal = (i: number) => {
    setFields(prev => prev.map((f, idx) => idx === i ? { ...f, revealed: !f.revealed } : f))
  }

  const handleCopy = async (name: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(name)
      setTimeout(() => setCopiedField(null), 1500)
    } catch (err) {
      console.error("[vault] copy error:", err)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingField) return
    try {
      await vaultClient.edit(provider, account, editingField.name, editValue)
      setEditingField(null)
      loadFields()
    } catch (err) {
      console.error("[vault] edit error:", err)
    }
  }

  const handleDeleteField = async (fieldName: string) => {
    if (!confirm(`Delete "${fieldName}" from ${account}?`)) return
    try {
      await vaultClient.delete(provider, account, fieldName)
      loadFields()
    } catch (err) {
      console.error("[vault] delete field error:", err)
    }
  }

  const handleDeleteService = async () => {
    if (!confirm(`Delete all credentials for ${account}?`)) return
    try {
      await vaultClient.delete(provider, account)
      onDeleted()
    } catch (err) {
      console.error("[vault] delete service error:", err)
    }
  }

  const serviceKey = provider.toLowerCase().replace(/\s+/g, "")
  const initials = SERVICE_ICONS[serviceKey] || account.slice(0, 2).toUpperCase()

  return (
    <div className="service-detail">
      <div className="detail-header">
        <button className="btn-back" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        <div className="detail-title">
          <div className="service-avatar sm">{initials}</div>
          <div>
            <h3>{account}</h3>
            <span className="detail-subtitle">
              {fields.length} {fields.length === 1 ? "key" : "keys"}
            </span>
          </div>
        </div>
        <button className="btn-danger-sm" onClick={handleDeleteService} title="Delete service">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="loading-row">Loading keys...</div>
      ) : (
        <div className="fields-list">
          {fields.map((field, i) => (
            <div key={field.name} className="field-card">
              {editingField?.name === field.name ? (
                <div className="field-edit-row">
                  <span className="field-name-badge">{field.name}</span>
                  <input
                    className="field-edit-input"
                    type="text"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    autoFocus
                  />
                  <div className="field-edit-actions">
                    <button className="btn-save-sm" onClick={handleSaveEdit}>Save</button>
                    <button className="btn-cancel-sm" onClick={() => setEditingField(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="field-top-row">
                    <span className="field-name-badge">{field.name}</span>
                    <div className="field-action-btns">
                      <button
                        className={`icon-btn ${copiedField === field.name ? "copied" : ""}`}
                        onClick={() => handleCopy(field.name, field.value)}
                        title="Copy"
                      >
                        {copiedField === field.name ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                          </svg>
                        )}
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => { setEditingField({ name: field.name, value: field.value }); setEditValue(field.value) }}
                        title="Edit"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="icon-btn danger"
                        onClick={() => handleDeleteField(field.name)}
                        title="Delete"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        </svg>
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => handleReveal(i)}
                        title={field.revealed ? "Hide" : "Reveal"}
                      >
                        {field.revealed ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" />
                            <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="field-value-row">
                    <code className="field-value-mono">
                      {field.revealed ? field.value : "•".repeat(Math.min(field.value.length, 24))}
                    </code>
                  </div>
                </>
              )}
            </div>
          ))}

          {showAddKey ? (
            <AddKeyForm
              businessId={businessId}
              provider={provider}
              account={account}
              onSaved={() => { setShowAddKey(false); loadFields() }}
              onCancel={() => setShowAddKey(false)}
            />
          ) : (
            <button className="btn-add-key" onClick={() => setShowAddKey(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
                <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
              </svg>
              Add Another Key
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Business Vault View ───────────────────────────────────────────────────────

const BusinessVault: React.FC<{
  business: typeof BUSINESS_UNITS[0]
  onBack: () => void
}> = ({ business, onBack }) => {
  const [services, setServices] = useState<ServiceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<ServiceEntry | null>(null)
  const [showAddService, setShowAddService] = useState(false)

  const loadServices = useCallback(async () => {
    try {
      setLoading(true)
      const services = await vaultClient.listByBusiness(business.id)
      setServices(services)
    } catch (err) {
      console.error("[vault] loadServices error:", err)
    } finally {
      setLoading(false)
    }
  }, [business.id])

  useEffect(() => { loadServices() }, [loadServices])

  if (selectedService) {
    return (
      <ServiceDetail
        businessId={business.id}
        provider={selectedService.provider}
        account={selectedService.account}
        onBack={() => setSelectedService(null)}
        onDeleted={() => { setSelectedService(null); loadServices() }}
      />
    )
  }

  return (
    <div className="business-vault">
      <div className="detail-header">
        <button className="btn-back" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All Businesses
        </button>
        <div className="detail-title">
          <div className="biz-avatar-sm" style={{ background: `${business.color}22`, color: business.color, borderColor: `${business.color}44` }}>
            {business.abbr}
          </div>
          <div>
            <h3>{business.label}</h3>
            <span className="detail-subtitle">
              {loading ? "Loading..." : `${services.length} ${services.length === 1 ? "service" : "services"}`}
            </span>
          </div>
        </div>
        <button className="btn-add-service-sm" onClick={() => setShowAddService(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
            <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
          </svg>
          Add Service
        </button>
      </div>

      {showAddService && (
        <AddServiceForm
          businessId={business.id}
          onSaved={(provider, account) => {
            setShowAddService(false)
            loadServices()
            setSelectedService({ provider, account })
          }}
          onCancel={() => setShowAddService(false)}
        />
      )}

      {loading ? (
        <div className="loading-row">Loading services...</div>
      ) : services.length === 0 && !showAddService ? (
        <div className="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="empty-icon">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          <p>No services yet</p>
          <button className="btn-add-service-empty" onClick={() => setShowAddService(true)}>
            Add your first service
          </button>
        </div>
      ) : (
        <div className="services-grid">
          {services.map(svc => {
            const key = svc.provider.toLowerCase().replace(/\s+/g, "")
            const initials = SERVICE_ICONS[key] || svc.account.slice(0, 2).toUpperCase()
            return (
              <button
                key={`${svc.provider}-${svc.account}`}
                className="service-card"
                onClick={() => setSelectedService(svc)}
              >
                <div className="service-avatar">{initials}</div>
                <span className="service-name">{svc.account}</span>
                <svg className="service-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchServicesByBusiness(businessId: string): Promise<ServiceEntry[]> {
  try {
    const res = await fetch("/api/vault", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({ action: "listByBusiness", business_unit: businessId }),
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.services || []) as ServiceEntry[]
  } catch {
    return []
  }
}

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {}
  const token = window.sessionStorage.getItem("mission-control.vault.token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ─── Main Browser ──────────────────────────────────────────────────────────────

const CredentialBrowser: React.FC = () => {
  const [selectedBusiness, setSelectedBusiness] = useState<typeof BUSINESS_UNITS[0] | null>(null)
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null)

  useEffect(() => {
    setSessionExpiry(vaultClient.getSessionExpiry())
    const unsub = vaultClient.subscribe(() => setSessionExpiry(vaultClient.getSessionExpiry()))
    return () => { unsub() }
  }, [])

  const handleLock = async () => {
    await vaultClient.lock()
  }

  if (selectedBusiness) {
    return (
      <div className="credential-browser">
        <div className="vault-topbar">
          <span className="vault-topbar-title">Credential Vault</span>
          <div className="vault-topbar-right">
            {sessionExpiry && (
              <span className="expiry">Expires {sessionExpiry.toLocaleTimeString()}</span>
            )}
            <button className="btn-lock" onClick={handleLock}>Lock</button>
          </div>
        </div>
        <BusinessVault business={selectedBusiness} onBack={() => setSelectedBusiness(null)} />
      </div>
    )
  }

  return (
    <div className="credential-browser">
      <div className="vault-topbar">
        <span className="vault-topbar-title">Credential Vault</span>
        <div className="vault-topbar-right">
          {sessionExpiry && (
            <span className="expiry">Expires {sessionExpiry.toLocaleTimeString()}</span>
          )}
          <button className="btn-lock" onClick={handleLock}>Lock</button>
        </div>
      </div>

      <div className="biz-grid-header">
        <h2>Select a Business</h2>
        <p>Click a business to manage its credentials</p>
      </div>

      <div className="biz-grid">
        {BUSINESS_UNITS.map(biz => (
          <button
            key={biz.id}
            className="biz-card"
            onClick={() => setSelectedBusiness(biz)}
            style={{ "--biz-color": biz.color } as React.CSSProperties}
          >
            <div className="biz-avatar" style={{ background: `${biz.color}1a`, color: biz.color, borderColor: `${biz.color}33` }}>
              {biz.abbr}
            </div>
            <span className="biz-label">{biz.label}</span>
            <svg className="biz-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Root Component ────────────────────────────────────────────────────────────

export const VaultUI: React.FC = () => {
  const [unlocked, setUnlocked] = useState(vaultClient.isUnlocked())

  useEffect(() => {
    const unsub = vaultClient.subscribe(() => setUnlocked(vaultClient.isUnlocked()))
    return () => { unsub() }
  }, [])

  return unlocked ? <CredentialBrowser /> : <PinEntry onUnlock={() => setUnlocked(true)} />
}

export default VaultUI
