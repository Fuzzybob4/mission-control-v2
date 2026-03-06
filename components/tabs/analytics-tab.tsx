"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { supabase } from "@/lib/supabase"
import { BarChart3, DollarSign, Activity, Zap } from "lucide-react"

interface Summary {
  totalTokens: number
  totalCost: number
  totalCalls: number
}

const FALLBACK: Summary = { totalTokens: 0, totalCost: 0, totalCalls: 0 }

export function AnalyticsTab() {
  const [summary, setSummary] = useState<Summary>(FALLBACK)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // Last 24 hours
        if (!supabase) return
        const since = new Date(Date.now() - 86_400_000).toISOString()
        const { data, error } = await supabase
          .from("analytics_events")
          .select("tokens_used, cost_usd")
          .gte("created_at", since)

        if (!error && data && data.length > 0) {
          const totalTokens = data.reduce((s, r) => s + (r.tokens_used ?? 0), 0)
          const totalCost = data.reduce((s, r) => s + Number(r.cost_usd ?? 0), 0)
          setSummary({ totalTokens, totalCost, totalCalls: data.length })
        }
      } catch {
        // Table not yet created — keep fallback values
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const fmt = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}K`
      : String(n)

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/20">
          <BarChart3 className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Analytics</h2>
          <p className="text-xs text-gray-400">Usage metrics — last 24 hours</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs">Cost (24h)</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {loading ? "—" : `$${summary.totalCost.toFixed(4)}`}
          </p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-xs">Tokens</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {loading ? "—" : fmt(summary.totalTokens)}
          </p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-xs">API Calls</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {loading ? "—" : summary.totalCalls}
          </p>
        </GlassCard>
      </div>

      {/* Chart placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="h-48 flex items-center justify-center">
          <p className="text-sm text-gray-500">
            {summary.totalTokens === 0
              ? "No token data yet — run 003_create_analytics_tables.sql to enable"
              : "Token usage chart (coming soon)"}
          </p>
        </GlassCard>
        <GlassCard className="h-48 flex items-center justify-center">
          <p className="text-sm text-gray-500">
            {summary.totalCost === 0
              ? "No cost data yet"
              : "Cost trends (coming soon)"}
          </p>
        </GlassCard>
      </div>
    </div>
  )
}
