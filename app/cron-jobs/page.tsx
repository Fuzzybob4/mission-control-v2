"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { GlassCard } from "@/components/ui/glass-card"
import {
  ArrowLeft, Clock, Play, Pause, RefreshCw,
  CheckCircle2, XCircle, AlertCircle, Plus, Trash2, Activity
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CronJob {
  id: string
  name: string
  schedule: string        // cron expression e.g. "0 9 * * *"
  description: string
  business_unit: string | null
  status: "active" | "paused" | "error"
  last_run: string | null
  next_run: string | null
  last_result: "success" | "failure" | "pending" | null
  run_count: number
}

const STATIC_JOBS: CronJob[] = [
  {
    id: "1",
    name: "Daily Revenue Sync",
    schedule: "0 6 * * *",
    description: "Pull latest revenue data from Stripe and update dashboard KPIs",
    business_unit: "lone-star",
    status: "active",
    last_run: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    next_run: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(),
    last_result: "success",
    run_count: 42,
  },
  {
    id: "2",
    name: "CRM Lead Digest",
    schedule: "0 8 * * 1-5",
    description: "Compile overnight leads and send summary to RedFox agent Iris",
    business_unit: "redfox",
    status: "active",
    last_run: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    next_run: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    last_result: "success",
    run_count: 18,
  },
  {
    id: "3",
    name: "Agent Heartbeat Check",
    schedule: "*/15 * * * *",
    description: "Ping all active agents and update their status in mc_agents",
    business_unit: null,
    status: "active",
    last_run: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    next_run: new Date(Date.now() + 1000 * 60 * 3).toISOString(),
    last_result: "success",
    run_count: 1284,
  },
  {
    id: "4",
    name: "Analytics Rollup",
    schedule: "0 0 * * *",
    description: "Aggregate daily token usage and API costs into analytics_events",
    business_unit: null,
    status: "active",
    last_run: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    next_run: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    last_result: "success",
    run_count: 31,
  },
  {
    id: "5",
    name: "Vault Session Cleanup",
    schedule: "0 * * * *",
    description: "Remove expired credential vault sessions from the server store",
    business_unit: null,
    status: "active",
    last_run: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    next_run: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
    last_result: "success",
    run_count: 208,
  },
  {
    id: "6",
    name: "Seasonal Pricing Update",
    schedule: "0 7 1 10,11,12 *",
    description: "Activate peak-season pricing for Lone Star holiday installs",
    business_unit: "lone-star",
    status: "paused",
    last_run: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    next_run: null,
    last_result: "success",
    run_count: 3,
  },
  {
    id: "7",
    name: "Heroes Market Scan",
    schedule: "0 10 * * 0",
    description: "Scrape card market prices and update Heroes inventory valuations",
    business_unit: "heroes",
    status: "error",
    last_run: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    next_run: new Date(Date.now() + 1000 * 60 * 60 * 120).toISOString(),
    last_result: "failure",
    run_count: 12,
  },
]

const BIZ_COLORS: Record<string, string> = {
  "lone-star":      "text-amber-400  bg-amber-400/10  border-amber-400/20",
  "redfox":         "text-blue-400   bg-blue-400/10   border-blue-400/20",
  "heroes":         "text-violet-400 bg-violet-400/10 border-violet-400/20",
  "from-inception": "text-cyan-400   bg-cyan-400/10   border-cyan-400/20",
}

const BIZ_LABELS: Record<string, string> = {
  "lone-star":      "Lone Star",
  "redfox":         "RedFox CRM",
  "heroes":         "Heroes",
  "from-inception": "From Inception",
}

function StatusIcon({ status, result }: { status: CronJob["status"]; result: CronJob["last_result"] }) {
  if (status === "error" || result === "failure")
    return <XCircle className="w-4 h-4 text-red-400" />
  if (status === "paused")
    return <Pause className="w-4 h-4 text-gray-500" />
  return <CheckCircle2 className="w-4 h-4 text-emerald-400" />
}

function relativeTime(iso: string | null): string {
  if (!iso) return "never"
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)    return "just now"
  if (mins < 60)   return `${mins}m ago`
  if (hours < 24)  return `${hours}h ago`
  return `${days}d ago`
}

function futureTime(iso: string | null): string {
  if (!iso) return "—"
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0)    return "overdue"
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 60)   return `in ${mins}m`
  if (hours < 24)  return `in ${hours}h`
  return `in ${days}d`
}

export default function CronJobsPage() {
  const [jobs, setJobs]         = useState<CronJob[]>(STATIC_JOBS)
  const [filter, setFilter]     = useState<string>("all")
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    const load = async () => {
      try {
        const { data, error } = await supabase!
          .from("cron_jobs")
          .select("*")
          .order("name")
        if (!error && data && data.length > 0) setJobs(data as CronJob[])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const bizOptions = ["all", "lone-star", "redfox", "heroes", "from-inception", "shared"]

  const filtered = jobs.filter(j => {
    if (filter === "all")    return true
    if (filter === "shared") return !j.business_unit
    return j.business_unit === filter
  })

  const counts = {
    active: jobs.filter(j => j.status === "active").length,
    paused: jobs.filter(j => j.status === "paused").length,
    error:  jobs.filter(j => j.status === "error").length,
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Mission Control
          </Link>
          <span className="text-white/20">/</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-violet-400" />
            </div>
            <h1 className="text-base font-semibold text-white">Cron Jobs</h1>
            <span className="text-xs text-gray-500 font-mono">/cron-jobs</span>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-300 text-sm font-medium hover:bg-violet-500/30 transition-colors">
          <Plus className="w-4 h-4" />
          New Job
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-xs">Active</span>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{counts.active}</p>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Pause className="w-4 h-4" />
              <span className="text-xs">Paused</span>
            </div>
            <p className="text-3xl font-bold text-gray-400">{counts.paused}</p>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">Errors</span>
            </div>
            <p className="text-3xl font-bold text-red-400">{counts.error}</p>
          </GlassCard>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {bizOptions.map(opt => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize",
                filter === opt
                  ? "bg-violet-500/20 border-violet-500/30 text-violet-300"
                  : "bg-white/[0.03] border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              {opt === "all"    ? `All (${jobs.length})` :
               opt === "shared" ? "Shared" :
               BIZ_LABELS[opt] ?? opt}
            </button>
          ))}
        </div>

        {/* Job list */}
        <div className="space-y-3">
          {filtered.map(job => (
            <div
              key={job.id}
              className={cn(
                "rounded-2xl border p-5 transition-colors",
                job.status === "error"
                  ? "border-red-500/30 bg-red-500/5"
                  : job.status === "paused"
                  ? "border-white/[0.06] bg-white/[0.02]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5">
                    <StatusIcon status={job.status} result={job.last_result} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-white">{job.name}</h3>
                      {job.business_unit ? (
                        <span className={cn(
                          "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                          BIZ_COLORS[job.business_unit] ?? "text-gray-400 bg-white/5 border-white/10"
                        )}>
                          {BIZ_LABELS[job.business_unit] ?? job.business_unit}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-600 px-2 py-0.5 rounded-full border border-white/[0.06] bg-white/[0.02]">
                          Shared
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{job.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-600 flex-wrap">
                      <span className="font-mono bg-white/5 px-2 py-0.5 rounded">{job.schedule}</span>
                      <span>Last: <span className="text-gray-400">{relativeTime(job.last_run)}</span></span>
                      <span>Next: <span className={cn(job.status === "paused" ? "text-gray-600" : "text-gray-400")}>{futureTime(job.next_run)}</span></span>
                      <span className="text-gray-600">{job.run_count} runs</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    title="Run now"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    title={job.status === "paused" ? "Resume" : "Pause"}
                  >
                    {job.status === "paused"
                      ? <RefreshCw className="w-3.5 h-3.5" />
                      : <Pause className="w-3.5 h-3.5" />
                    }
                  </button>
                  <button
                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Error banner */}
              {job.status === "error" && (
                <div className="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  Last run failed — check logs or run manually to retry
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-600">
              <Clock className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No cron jobs for this filter</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
