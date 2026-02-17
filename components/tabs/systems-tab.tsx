"use client"

import { useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { APIKeyVault } from "@/components/api-key-vault"
import { Cpu, Wifi, Clock, HardDrive, Key, Activity } from "lucide-react"

type SystemsView = "status" | "vault"

export function SystemsTab() {
  const [activeView, setActiveView] = useState<SystemsView>("status")

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Cpu className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Systems</h2>
            <p className="text-xs text-gray-400">Infrastructure & Security</p>
          </div>
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setActiveView("status")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeView === "status"
                ? "bg-blue-500/20 text-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Status
          </button>
          <button
            onClick={() => setActiveView("vault")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeView === "vault"
                ? "bg-blue-500/20 text-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            API Vault
          </button>
        </div>
      </div>

      {activeView === "vault" ? (
        <APIKeyVault />
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}
