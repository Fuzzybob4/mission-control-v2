"use client"

import { GlassCard } from "@/components/ui/glass-card"

interface RecentActivityProps {
  maxItems?: number
}

export function RecentActivity({ maxItems = 5 }: RecentActivityProps) {
  const activities = [
    "Vault unlocked - System ready",
    "Mission Control deployed",
    "Database connected",
    "All systems operational",
    "Ready for commands",
  ].slice(0, maxItems)

  return (
    <GlassCard>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3 text-xs text-gray-400">
          {activities.map((activity, i) => (
            <p key={i}>• {activity}</p>
          ))}
        </div>
      </div>
    </GlassCard>
  )
}
