"use client"

import { useEffect, useMemo, useState } from "react"
import { Mail, RefreshCcw, CheckCircle2, Ban, Filter, Save, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { StatusBadge } from "@/components/ui/status-badge"
import type { ColdOutreachBrand, ColdOutreachRecord, ColdOutreachStatus } from "@/lib/cold-outreach-config"
import { BRAND_CONFIG } from "@/lib/cold-outreach-config"

type FilterStatus = ColdOutreachStatus | "all"

type EditableState = Record<string, Partial<ColdOutreachRecord>>

const brandOptions: Array<{ value: ColdOutreachBrand | "all"; label: string }> = [
  { value: "all", label: "All brands" },
  { value: "from_inception", label: "From Inception" },
  { value: "lone_star_lighting", label: "Lone Star Lighting" },
]

const statusOptions: Array<{ value: FilterStatus; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "denied", label: "Denied" },
  { value: "sent", label: "Sent" },
  { value: "all", label: "All statuses" },
]

export function ColdOutreachBoard() {
  const [items, setItems] = useState<ColdOutreachRecord[]>([])
  const [brand, setBrand] = useState<ColdOutreachBrand | "all">("all")
  const [status, setStatus] = useState<FilterStatus>("pending")
  const [editable, setEditable] = useState<EditableState>({})
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function loadItems(nextBrand = brand, nextStatus = status) {
    setLoading(true)
    setMessage(null)

    try {
      const params = new URLSearchParams()
      if (nextBrand !== "all") params.set("brand", nextBrand)
      if (nextStatus) params.set("status", nextStatus)

      const res = await fetch(`/api/cold-outreach?${params.toString()}`, { cache: "no-store" })
      const payload = await res.json()

      if (!res.ok) throw new Error(payload.error || "Failed to load queue")
      setItems(payload.data ?? [])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load queue")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pendingCount = useMemo(() => items.filter((item) => item.status === "pending").length, [items])

  function getDraftValue(item: ColdOutreachRecord, key: keyof ColdOutreachRecord) {
    const draft = editable[item.id]?.[key]
    return draft === undefined ? item[key] ?? "" : draft ?? ""
  }

  function updateDraft(itemId: string, key: keyof ColdOutreachRecord, value: string) {
    setEditable((current) => ({
      ...current,
      [itemId]: {
        ...current[itemId],
        [key]: value,
      },
    }))
  }

  async function saveItem(item: ColdOutreachRecord) {
    const patch = editable[item.id]
    if (!patch || Object.keys(patch).length === 0) return

    setBusyId(item.id)
    setMessage(null)

    try {
      const res = await fetch(`/api/cold-outreach/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload.error || "Failed to save item")

      setItems((current) => current.map((entry) => (entry.id === item.id ? payload.data : entry)))
      setEditable((current) => {
        const next = { ...current }
        delete next[item.id]
        return next
      })
      setMessage(`Saved ${payload.data.business_name}.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save item")
    } finally {
      setBusyId(null)
    }
  }

  async function importLatest() {
    setBusyId("import")
    setMessage(null)

    try {
      const res = await fetch("/api/cold-outreach", { method: "POST" })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload.error || "Failed to import latest outreach")

      setMessage(`Imported ${payload.imported} queue items from ${payload.latestFolder ?? "latest lead-gen folder"}.`)
      await loadItems()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to import latest outreach")
    } finally {
      setBusyId(null)
    }
  }

  async function handleAction(id: string, action: "approve" | "deny") {
    setBusyId(id)
    setMessage(null)

    try {
      const res = await fetch("/api/cold-outreach/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload.error || `Failed to ${action} item`)

      if (status === "pending") {
        setItems((current) => current.filter((item) => item.id !== id))
      } else {
        setItems((current) => current.map((item) => (item.id === id ? payload.data : item)))
      }

      setMessage(action === "approve"
        ? "Approved. Sending is stubbed in V1, so the item is now marked for manual delivery."
        : "Denied and removed from the pending queue.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `Failed to ${action} item`)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-8 flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Pending Cold Outreach</h2>
                <p className="text-sm text-gray-400 mt-1">Import lead-gen markdown, fill missing emails, then approve or deny each queued draft.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Visible Items</p>
              <p className="text-xl font-semibold text-white">{items.length}</p>
              <p className="text-xs text-gray-500">Pending in view: {pendingCount}</p>
            </div>
            <Button onClick={importLatest} disabled={busyId === "import"} className="gap-2">
              <RefreshCcw className={`w-4 h-4 ${busyId === "import" ? "animate-spin" : ""}`} />
              Import Latest Lead-Gen
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <span>From Inception → {BRAND_CONFIG.from_inception.senderEmail}</span>
            <span className="hidden sm:inline text-gray-600">•</span>
            <span>Lone Star Lighting → {BRAND_CONFIG.lone_star_lighting.senderEmail}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Filter className="w-3.5 h-3.5" /> Filters
            </div>
            <select
              value={brand}
              onChange={(event) => {
                const next = event.target.value as ColdOutreachBrand | "all"
                setBrand(next)
                loadItems(next, status)
              }}
              className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
            >
              {brandOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-950 text-white">
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(event) => {
                const next = event.target.value as FilterStatus
                setStatus(next)
                loadItems(brand, next)
              }}
              className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-950 text-white">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Approve is wired as a clean V1 status flow. Actual outbound email delivery is intentionally stubbed until a send provider path is confirmed in Mission Control.
        </div>

        {message && (
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-200">
            {message}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <GlassCard className="p-10 text-center">
          <p className="text-lg text-white">No outreach items in this view.</p>
          <p className="text-sm text-gray-400 mt-2">Use “Import Latest Lead-Gen” to pull today’s markdown into the queue.</p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const config = BRAND_CONFIG[item.brand]
            const hasDraftChanges = !!editable[item.id] && Object.keys(editable[item.id]).length > 0

            return (
              <GlassCard key={item.id} className="p-5 space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{item.business_name}</h3>
                      <StatusBadge status={item.status} label={item.status} />
                      <StatusBadge status="idle" label={config.label} className="text-blue-200" />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                      <span>Sender: {item.sender_email}</span>
                      {item.website && (
                        <a href={item.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white">
                          Website <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" onClick={() => saveItem(item)} disabled={!hasDraftChanges || busyId === item.id} className="gap-2">
                      <Save className="w-4 h-4" /> Save
                    </Button>
                    <Button onClick={() => handleAction(item.id, "approve")} disabled={busyId === item.id || item.status !== "pending"} className="gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </Button>
                    <Button variant="destructive" onClick={() => handleAction(item.id, "deny")} disabled={busyId === item.id || item.status !== "pending"} className="gap-2">
                      <Ban className="w-4 h-4" /> Deny
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <label className="space-y-2 text-sm">
                    <span className="text-gray-400">Contact Email</span>
                    <input
                      value={String(getDraftValue(item, "contact_email"))}
                      onChange={(event) => updateDraft(item.id, "contact_email", event.target.value)}
                      placeholder="Add recipient email"
                      className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white placeholder:text-gray-500"
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="text-gray-400">Website</span>
                    <input
                      value={String(getDraftValue(item, "website"))}
                      onChange={(event) => updateDraft(item.id, "website", event.target.value)}
                      placeholder="https://example.com"
                      className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white placeholder:text-gray-500"
                    />
                  </label>
                </div>

                <label className="space-y-2 text-sm block">
                  <span className="text-gray-400">Draft Subject</span>
                  <input
                    value={String(getDraftValue(item, "draft_subject"))}
                    onChange={(event) => updateDraft(item.id, "draft_subject", event.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white"
                  />
                </label>

                <label className="space-y-2 text-sm block">
                  <span className="text-gray-400">Draft Body</span>
                  <textarea
                    value={String(getDraftValue(item, "draft_body"))}
                    onChange={(event) => updateDraft(item.id, "draft_body", event.target.value)}
                    rows={12}
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-white"
                  />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-500">
                  <div>Source: {item.source_file ?? "—"}</div>
                  <div>Generated: {item.source_generated_at ? new Date(item.source_generated_at).toLocaleString() : "—"}</div>
                  <div>Send State: {item.send_status}{item.send_error ? ` — ${item.send_error}` : ""}</div>
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
