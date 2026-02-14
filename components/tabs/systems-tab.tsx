"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Cpu, Wifi, Clock, HardDrive } from "lucide-react"

export function SystemsTab() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-500/20">
          <Cpu className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Systems</h2>
          <p className="text-xs text-gray-400">Infrastructure status</p>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Wifi className="w-4 h-4" />
            <span className="text-xs">Uptime</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">99.9%</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Cpu className="w-4 h-4" />
            <span className="text-xs">CPU</span>
          </div>
          <p className="text-2xl font-bold text-white">23%</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <HardDrive className="w-4 h-4" />
            <span className="text-xs">Memory</span>
          </div>
          <p className="text-2xl font-bold text-white">67%</p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Heartbeat</span>
          </div>
          <p className="text-sm font-bold text-white">2:00 PM</p>
        </GlassCard>
      </div>

      {/* API Status */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-white mb-4">API Connections</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
            <span className="text-sm text-white">Supabase</span>
            <StatusBadge status="online" label="Connected" />
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
            <span className="text-sm text-white">HubSpot</span>
            <StatusBadge status="online" label="Connected" />
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
            <span className="text-sm text-white">Square</span>
            <StatusBadge status="online" label="Connected" />
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
            <span className="text-sm text-white">Outlook</span>
            <StatusBadge status="offline" label="Disconnected" />
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
