"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { BarChart3, DollarSign, Activity } from "lucide-react"

export function AnalyticsTab() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/20">
          <BarChart3 className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Analytics</h2>
          <p className="text-xs text-gray-400">Usage metrics and performance</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs">Cost (24h)</span>
          </div>
          <p className="text-2xl font-bold text-white">$0.25</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-xs">Tokens</span>
          </div>
          <p className="text-2xl font-bold text-white">15,420</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs">API Calls</span>
          </div>
          <p className="text-2xl font-bold text-white">85</p>
        </GlassCard>
      </div>

      {/* Placeholder Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="h-48 flex items-center justify-center">
          <p className="text-sm text-gray-400">Token usage chart (coming soon)</p>
        </GlassCard>
        <GlassCard className="h-48 flex items-center justify-center">
          <p className="text-sm text-gray-400">Cost trends (coming soon)</p>
        </GlassCard>
      </div>
    </div>
  )
}
