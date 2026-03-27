"use client"

import { useEffect, useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Activity, Mail, CheckCircle, AlertCircle, Clock, Zap } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { supabase } from "@/lib/supabase"

interface HeartbeatEvent {
  id: string
  type: "agent" | "email" | "task" | "system" | "lead"
  message: string
  timestamp: string
  status: "success" | "info" | "warning" | "error"
}

export function HeartbeatSection() {
  const [events, setEvents] = useState<HeartbeatEvent[]>([])
  const [lastCheck, setLastCheck] = useState<Date>(new Date())

  useEffect(() => {
    let active = true

    async function load() {
      try {
        if (!supabase) return
        const { data, error } = await supabase
          .from("mc_events")
          .select("id,level,source,message,timestamp")
          .order("timestamp", { ascending: false })
          .limit(8)

        if (error) throw error

        const mapped: HeartbeatEvent[] = (data || []).map((row: any) => ({
          id: row.id,
          type:
            row.source === "agent" ? "agent" :
            row.source === "system" ? "system" :
            row.message?.toLowerCase().includes("lead") ? "lead" :
            row.message?.toLowerCase().includes("email") ? "email" :
            "task",
          message: row.message,
          timestamp: row.timestamp,
          status:
            row.level === "error" || row.level === "critical" ? "error" :
            row.level === "warn" ? "warning" :
            row.source === "system" ? "success" :
            "info",
        }))

        if (active) {
          setEvents(mapped)
          setLastCheck(new Date())
        }
      } catch (err) {
        console.error("[mission-control] heartbeat load failed", err)
      }
    }

    load()
    const interval = setInterval(load, 15000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case "agent": return <Zap className="w-4 h-4" />
      case "email": return <Mail className="w-4 h-4" />
      case "task": return <CheckCircle className="w-4 h-4" />
      case "system": return <Activity className="w-4 h-4" />
      case "lead": return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "text-emerald-400 bg-emerald-500/10"
      case "info": return "text-blue-400 bg-blue-500/10"
      case "warning": return "text-amber-400 bg-amber-500/10"
      case "error": return "text-red-400 bg-red-500/10"
      default: return "text-gray-400 bg-gray-500/10"
    }
  }

  return (
    <GlassCard className="mb-6">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Heartbeat</h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Last check: {formatDistanceToNow(lastCheck, { addSuffix: true })}
          </div>
        </div>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        {events.length === 0 && (
          <div className="p-4 text-sm text-gray-400">No live heartbeat events yet.</div>
        )}
        {events.map((event) => (
          <div 
            key={event.id} 
            className="flex items-start gap-3 p-3 border-b border-white/5 hover:bg-white/5 transition-colors"
          >
            <div className={`p-2 rounded-lg ${getStatusColor(event.status)}`}>
              {getIcon(event.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{event.message}</p>
              <p className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
