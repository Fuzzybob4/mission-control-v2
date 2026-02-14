"use client"

import { useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { FileUploadWidget } from "@/components/file-upload-widget"
import { TimeFilter } from "@/components/time-filter"
import { Gamepad2, PauseCircle, DollarSign, TrendingUp, Target, AlertCircle } from "lucide-react"

export function HeroesTab() {
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month" | "quarter" | "year">("month")

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header with Time Filter */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/20">
            <Gamepad2 className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Heroes of the Meta</h2>
            <p className="text-xs text-gray-400">Trading card marketplace</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status="paused" label="On Hold" />
          <TimeFilter value={timeRange} onChange={setTimeRange} />
        </div>
      </div>

      {/* File Upload */}
      <FileUploadWidget 
        businessUnit="heroes" 
        onFilesUploaded={(files) => console.log("Heroes files:", files)}
      />

      {/* Status Banner */}
      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
        <PauseCircle className="w-5 h-5 text-amber-400 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-white">Business On Hold</h3>
          <p className="text-xs text-gray-400 mt-1">
            Heroes of the Meta is temporarily paused while focusing on Lone Star Lighting revenue 
            and RedFox CRM development.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <GlassCard className="opacity-60">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Gamepad2 className="w-4 h-4" />
            <span className="text-xs">Inventory</span>
          </div>
          <p className="text-2xl font-bold text-white">—</p>
          <p className="text-xs text-gray-500">Not cataloged</p>
        </GlassCard>

        <GlassCard className="opacity-60">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-white">$0</p>
          <p className="text-xs text-gray-500">Not launched</p>
        </GlassCard>

        <GlassCard className="opacity-60">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Target</span>
          </div>
          <p className="text-2xl font-bold text-white">$5K/mo</p>
          <p className="text-xs text-gray-500">First year</p>
        </GlassCard>

        <GlassCard className="opacity-60">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Target className="w-4 h-4" />
            <span className="text-xs">Status</span>
          </div>
          <p className="text-2xl font-bold text-white">Paused</p>
          <p className="text-xs text-gray-500">Until stable</p>
        </GlassCard>
      </div>

      {/* Activation Criteria */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-white mb-3">Reactivation Criteria</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Lone Star Stable</p>
              <p className="text-xs text-gray-400">$20K/mo consistent revenue</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">RedFox Launched</p>
              <p className="text-xs text-gray-400">First paying customers</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Time Available</p>
              <p className="text-xs text-gray-400">10+ hours/week</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
