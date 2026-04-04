"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, CalendarClock, CheckCircle2, DollarSign, RefreshCcw } from "lucide-react"

import { GlassCard } from "@/components/ui/glass-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"

type BoardPayload = {
  summary: {
    totalInvoices: number
    unpaidCount: number
    scheduledCount: number
    partiallyPaidCount: number
    paidCount: number
    unpaidAmount: number
    scheduledAmount: number
    partiallyPaidAmount: number
    paidAmount: number
  }
  actionQueue: Array<{
    invoiceNumber: string
    customer: string
    company: string | null
    email: string | null
    phone: string | null
    status: string
    amount: number
    dueDate: string | null
    action: string
  }>
  recentPaid: Array<{
    invoiceNumber: string
    customer: string
    company: string | null
    amount: number
    updatedAt: string | null
  }>
  refreshedAt: string
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
}

export function LoneStarOpsBoard() {
  const [data, setData] = useState<BoardPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    setError(null)
    try {
      const res = await fetch("/api/lone-star-board", { cache: "no-store" })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload.error || "Failed to load Lone Star board")
      setData(payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Lone Star board")
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

  if (loading) {
    return (
      <GlassCard className="p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </GlassCard>
    )
  }

  if (error || !data) {
    return (
      <GlassCard className="p-6 space-y-3">
        <div className="flex items-center gap-2 text-rose-300">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-semibold">Lone Star Ops Board unavailable</span>
        </div>
        <p className="text-sm text-gray-300">{error || "Unknown error"}</p>
        <Button onClick={refresh} className="gap-2 w-fit">
          <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Retry
        </Button>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-4">
      <GlassCard className="p-5 sm:p-6 space-y-5 border border-amber-500/20 bg-amber-500/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Lone Star Ops Board</h3>
            <p className="text-sm text-gray-400">Live Square-backed board for cash flow, invoice pressure, and recent wins.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Updated {new Date(data.refreshedAt).toLocaleString()}</span>
            <Button onClick={refresh} className="gap-2" disabled={refreshing}>
              <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Metric label="Unpaid" value={money(data.summary.unpaidAmount)} sub={`${data.summary.unpaidCount} invoices`} icon={<AlertTriangle className="w-4 h-4 text-rose-300" />} />
          <Metric label="Scheduled" value={money(data.summary.scheduledAmount)} sub={`${data.summary.scheduledCount} invoices`} icon={<CalendarClock className="w-4 h-4 text-amber-300" />} />
          <Metric label="Partial" value={money(data.summary.partiallyPaidAmount)} sub={`${data.summary.partiallyPaidCount} invoices`} icon={<DollarSign className="w-4 h-4 text-sky-300" />} />
          <Metric label="Paid" value={money(data.summary.paidAmount)} sub={`${data.summary.paidCount} invoices`} icon={<CheckCircle2 className="w-4 h-4 text-emerald-300" />} />
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <GlassCard className="p-5 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-white">Action Queue</h4>
            <p className="text-xs text-gray-500">These are the items that need pressure or attention next.</p>
          </div>
          <div className="space-y-3">
            {data.actionQueue.length === 0 ? (
              <p className="text-sm text-gray-400">No urgent invoice actions right now.</p>
            ) : data.actionQueue.map((item) => (
              <div key={`${item.invoiceNumber}-${item.status}`} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.customer}</p>
                    <p className="text-xs text-gray-500">{item.invoiceNumber} • {money(item.amount)}</p>
                  </div>
                  <StatusBadge status={item.status.toLowerCase()} label={item.status} />
                </div>
                <p className="text-xs text-amber-200">{item.action}</p>
                <div className="text-xs text-gray-500 flex flex-wrap gap-3">
                  {item.dueDate ? <span>Due: {item.dueDate}</span> : null}
                  {item.email ? <span>{item.email}</span> : null}
                  {item.phone ? <span>{item.phone}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-white">Recent Paid Wins</h4>
            <p className="text-xs text-gray-500">Proof of movement and who to mine for rebook / upsell later.</p>
          </div>
          <div className="space-y-3">
            {data.recentPaid.length === 0 ? (
              <p className="text-sm text-gray-400">No recent paid invoices found.</p>
            ) : data.recentPaid.map((item) => (
              <div key={`${item.invoiceNumber}-${item.updatedAt || "paid"}`} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{item.customer}</p>
                  <p className="text-xs text-gray-500">{item.invoiceNumber}{item.company ? ` • ${item.company}` : ""}</p>
                  <p className="text-xs text-gray-600 mt-1">{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "Paid"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-300">{money(item.amount)}</p>
                  <StatusBadge status="paid" label="PAID" />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

function Metric({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs text-gray-500">{sub}</div>
    </div>
  )
}
