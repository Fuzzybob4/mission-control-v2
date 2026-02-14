"use client"

import { useEffect, useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Activity, Mail, CheckCircle, AlertCircle, Clock, Zap } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

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
    // Simulated heartbeat data - in production this would come from Supabase realtime
    const mockEvents: HeartbeatEvent[] = [
      {
        id: "1",
        type: "agent",
        message: "Atlas completed task: Updated Alora Hess quote to $18K",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
        status: "success"
      },
      {
        id: "2",
        type: "email",
        message: "New email from Alora Hess (CBRE) - RFQ response",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
        status: "info"
      },
      {
        id: "3",
        type: "system",
        message: "Mission Control v2 deployed successfully",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        status: "success"
      },
      {
        id: "4",
        type: "task",
        message: "Maverick started: Fix v0 Root Directory setting",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
        status: "info"
      },
      {
        id: "5",
        type: "lead",
        message: "New lead detected: Commercial property inquiry",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
        status: "success"
      }
    ]
    setEvents(mockEvents)

    // Update last check every minute
    const interval = setInterval(() => {
      setLastCheck(new Date())
    }, 60000)

    return () => clearInterval(interval)
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
