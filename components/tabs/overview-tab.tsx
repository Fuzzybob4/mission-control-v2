"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Lightbulb, Code2, Gamepad2, TrendingUp, Activity, Zap, AlertCircle } from "lucide-react"

export function OverviewTab() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-white">$20,021</p>
          <p className="text-xs text-gray-500">YTD 2024</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Activity className="w-4 h-4" />
            <span className="text-xs">Active Businesses</span>
          </div>
          <p className="text-2xl font-bold text-white">1</p>
          <p className="text-xs text-gray-500">2 in development</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-xs">Pipeline</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">$18,000</p>
          <p className="text-xs text-gray-500">Lone Star leads</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Goal Progress</span>
          </div>
          <p className="text-2xl font-bold text-white">33%</p>
          <p className="text-xs text-gray-500">To $60K/mo</p>
        </GlassCard>
      </div>

      {/* Business Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="hover:bg-white/10 transition-colors cursor-pointer">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Lightbulb className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">Lone Star Lighting</h3>
              <p className="text-xs text-gray-400 mt-1">Holiday lighting - main revenue</p>
              <div className="mt-3">
                <StatusBadge status="active" label="Active" />
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="hover:bg-white/10 transition-colors cursor-pointer">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Code2 className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">RedFox CRM</h3>
              <p className="text-xs text-gray-400 mt-1">SaaS for light installers</p>
              <div className="mt-3">
                <StatusBadge status="in-progress" label="In Dev" />
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="hover:bg-white/10 transition-colors cursor-pointer">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Gamepad2 className="w-5 h-5 text-violet-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">Heroes of the Meta</h3>
              <p className="text-xs text-gray-400 mt-1">Trading cards marketplace</p>
              <div className="mt-3">
                <StatusBadge status="paused" label="On Hold" />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Urgent Actions */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          Urgent Actions
        </h3>
        <div className="space-y-2">
          <GlassCard className="p-3 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Alora Hess Follow-up</p>
                <p className="text-xs text-gray-400">Due: Feb 20, 2026</p>
              </div>
              <span className="text-sm font-semibold text-emerald-400">$17K-$19K</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
