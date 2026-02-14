import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: "online" | "offline" | "active" | "idle" | "busy" | "in-progress" | "paused" | "completed" | "queued" | string
  label: string
  className?: string
}

const statusColors: Record<string, string> = {
  online: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  offline: "bg-gray-700 text-gray-400 border-gray-600",
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  idle: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  busy: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "in-progress": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  paused: "bg-gray-700 text-gray-400 border-gray-600",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  queued: "bg-gray-700 text-gray-400 border-gray-600",
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  urgent: "bg-red-500/20 text-red-400 border-red-500/30",
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  contacted: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  quoted: "bg-violet-500/20 text-violet-400 border-violet-500/30",
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        statusColors[status] || statusColors.idle,
        className
      )}
    >
      {label}
    </span>
  )
}
