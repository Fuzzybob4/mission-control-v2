"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCcw, Rocket, Send, Activity } from "lucide-react"

import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"

type SummaryPayload = {
  revenue: {
    totalInvoices: number
    paidAmount: number
    unpaidAmount: number
    paidCount: number
    unpaidCount: number
    overdueCount: number
  }
  outreach: {
    total: number
    loneStar: number
    fromInception: number
    byStatus: {
      pending: number
      approved: number
      denied: number
      sent: number
    }
  }
  operations: {
    recentEvents24h: number
    latestOutreachAt: string | null
  }
  actions: string[]
  refreshedAt: string
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value)
}

export function LiveBusinessSnapshot() {
  const [data, setData] = useState<SummaryPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    try {
      setError(null)
      const res = await fetch("/api/mission-control-summary", { cache: "no-store" })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload.error || "Failed to load business snapshot")
      setData(payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load business snapshot")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function refresh() {
    setRefreshing(true)
    await load()
  }

  return (
    <GlassCard className="p-5 sm:p-6 space-y-5 border border-cyan-500/20 bg-cyan-500/5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
            <Rocket className="h-3.5 w-3.5" />
            Live Business Snapshot
          </div>
          <h3 className="mt-3 text-lg font-semibold text-white">Real pressure, not decorative numbers.</h3>
          <p className="mt-1 text-sm text-gray-400">Cash collection, outreach velocity, and operating pulse from live Mission Control sources.</p>
        </div>
        <div className="flex items-center gap-3">
          {data?.refreshedAt ? <span className="text-xs text-gray-500">Updated {new Date(data.refreshedAt).toLocaleString()}</span> : null}
          <Button onClick={refresh} disabled={refreshing} className="gap-2">
            <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 rounded-full border-2 border-cyan-300 border-t-transparent animate-spin" />
        </div>
      ) : error || !data ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error || "Snapshot unavailable."}
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Cash collected" value={money(data.revenue.paidAmount)} sub={`${data.revenue.paidCount} paid invoices`} icon={<Activity className="h-4 w-4 text-emerald-300" />} />
            <Metric label="Cash at risk" value={money(data.revenue.unpaidAmount)} sub={`${data.revenue.overdueCount} overdue, ${data.revenue.unpaidCount} unpaid`} icon={<AlertTriangle className="h-4 w-4 text-amber-300" />} />
            <Metric label="Outreach queue" value={`${data.outreach.byStatus.pending}`} sub={`${data.outreach.byStatus.approved} approved, ${data.outreach.byStatus.sent} sent`} icon={<Send className="h-4 w-4 text-sky-300" />} />
            <Metric label="Ops pulse" value={`${data.operations.recentEvents24h}`} sub="events logged in last 24h" icon={<Rocket className="h-4 w-4 text-violet-300" />} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-white">Priority actions</h4>
                  <p className="text-xs text-gray-500">The moves most likely to improve revenue and response speed.</p>
                </div>
                <Link href="/cold-outreach?brand=lone_star_lighting" className="text-xs text-cyan-200 hover:text-white">
                  Open queue
                </Link>
              </div>
              <div className="mt-4 space-y-2">
                {(data.actions.length ? data.actions : ["No immediate blockers. Keep pressure on sending and collections."]).map((action) => (
                  <div key={action} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-200">
                    {action}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <h4 className="text-sm font-semibold text-white">Queue split</h4>
              <div className="mt-4 space-y-3 text-sm text-gray-300">
                <Row label="Lone Star drafts" value={data.outreach.loneStar} />
                <Row label="From Inception drafts" value={data.outreach.fromInception} />
                <Row label="Total queue items" value={data.outreach.total} />
                <Row label="Latest outreach import" value={data.operations.latestOutreachAt ? new Date(data.operations.latestOutreachAt).toLocaleString() : "No import yet"} />
              </div>
            </div>
          </div>
        </>
      )}
    </GlassCard>
  )
}

function Metric({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-gray-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs text-gray-500">{sub}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <span className="text-gray-400">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  )
}
