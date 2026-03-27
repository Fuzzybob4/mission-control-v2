"use client"

import { useEffect, useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { supabase } from "@/lib/supabase"

type EventRow = {
  id: string
  message: string
  source: string
  timestamp: string
}

interface RecentActivityProps {
  maxItems?: number
}

export function RecentActivity({ maxItems = 5 }: RecentActivityProps) {
  const [activities, setActivities] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        if (!supabase) return
        const { data, error } = await supabase
          .from("mc_events")
          .select("id,message,source,timestamp")
          .order("timestamp", { ascending: false })
          .limit(maxItems)

        if (error) throw error
        if (active) setActivities(data || [])
      } catch (err) {
        console.error("[mission-control] recent activity load failed", err)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, 15000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [maxItems])

  return (
    <GlassCard>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3 text-xs text-gray-400">
          {loading && <p>Loading live activity…</p>}
          {!loading && activities.length === 0 && <p>No live activity yet.</p>}
          {activities.map((activity) => (
            <p key={activity.id}>• {activity.message}</p>
          ))}
        </div>
      </div>
    </GlassCard>
  )
}
