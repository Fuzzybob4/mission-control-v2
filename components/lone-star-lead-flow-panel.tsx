"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowRight, CheckCircle2, Clock3, Mail, RefreshCcw, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { StatusBadge } from "@/components/ui/status-badge"
import type { ColdOutreachRecord } from "@/lib/cold-outreach-config"

export function LoneStarLeadFlowPanel() {
  const [items, setItems] = useState<ColdOutreachRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function loadItems() {
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch("/api/cold-outreach?brand=lone_star_lighting&status=all", { cache: "no-store" })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload.error || "Failed to load Lone Star lead flow")
      setItems(payload.data ?? [])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load Lone Star lead flow")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  async function importLatest() {
    setImporting(true)
    setMessage(null)

    try {
      const res = await fetch("/api/cold-outreach", { method: "POST" })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload.error || "Failed to import latest outreach")

      const imported = Array.isArray(payload.data)
        ? payload.data.filter((item: ColdOutreachRecord) => item.brand === "lone_star_lighting").length
        : payload.imported ?? 0

      setMessage(`Lead flow refreshed. Imported ${imported} Lone Star draft${imported === 1 ? "" : "s"}.`)
      await loadItems()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to import latest outreach")
    } finally {
      setImporting(false)
    }
  }

  const metrics = useMemo(() => {
    const pending = items.filter((item) => item.status === "pending").length
    const approved = items.filter((item) => item.status === "approved").length
    const denied = items.filter((item) => item.status === "denied").length
    const sent = items.filter((item) => item.status === "sent").length

    return { pending, approved, denied, sent }
  }, [items])

  const recent = items.slice(0, 5)

  return (
    <GlassCard className="p-5 sm:p-6 space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-amber-400/20 bg-amber-400/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Lead Flow</h3>
              <p className="text-sm text-gray-400">Lone Star prospecting queue, approvals, and delivery readiness.</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 max-w-2xl">
            This pulls the latest lead-gen drafts into Mission Control so you can review, approve, and track the outreach pipeline from one surface.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={importLatest} disabled={importing} className="gap-2">
            <RefreshCcw className={`w-4 h-4 ${importing ? "animate-spin" : ""}`} />
            Refresh Lead Flow
          </Button>
          <Link
            href="/cold-outreach?brand=lone_star_lighting"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 hover:text-white hover:border-white/20"
          >
            Open Queue
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard icon={<Clock3 className="w-4 h-4 text-amber-300" />} label="Pending" value={metrics.pending} />
        <MetricCard icon={<CheckCircle2 className="w-4 h-4 text-emerald-300" />} label="Approved" value={metrics.approved} />
        <MetricCard icon={<XCircle className="w-4 h-4 text-rose-300" />} label="Denied" value={metrics.denied} />
        <MetricCard icon={<Mail className="w-4 h-4 text-sky-300" />} label="Sent" value={metrics.sent} />
      </div>

      {message && (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-200">
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : recent.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-8 text-center">
          <p className="text-sm text-gray-300">No Lone Star lead flow items yet.</p>
          <p className="text-xs text-gray-500 mt-1">Hit refresh to import the latest prospect drafts.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recent.map((item) => (
            <div key={item.id} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-white">{item.business_name}</p>
                  <StatusBadge status={item.status} label={item.status} />
                </div>
                <p className="text-xs text-gray-400 truncate">{item.draft_subject}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span>{item.contact_email || "Missing recipient email"}</span>
                  {item.website ? <span>{item.website}</span> : null}
                </div>
              </div>

              <div className="text-left md:text-right text-xs text-gray-500 shrink-0">
                <div>Send state: {item.send_status}</div>
                <div>{item.created_at ? new Date(item.created_at).toLocaleString() : "Draft queued"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  )
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
    </div>
  )
}
