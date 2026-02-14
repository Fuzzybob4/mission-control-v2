"use client"

import { GlassCard } from "@/components/ui/glass-card"

interface SparklineProps {
  data: number[]
  color?: string
  height?: number
  width?: number
}

export function Sparkline({ data, color = "#3b82f6", height = 40, width = 120 }: SparklineProps) {
  if (!data || data.length === 0) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  // Normalize data to fit in height
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(" ")

  // Determine trend color
  const isPositive = data[data.length - 1] >= data[0]
  const lineColor = isPositive ? "#22c55e" : "#ef4444"

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Gradient area */}
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Area fill */}
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#gradient-${color})`}
      />
      
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={lineColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* End dot */}
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="3"
        fill={lineColor}
      />
    </svg>
  )
}

interface KPICardProps {
  title: string
  value: string
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  sparklineData?: number[]
  icon?: React.ReactNode
}

export function KPICard({ title, value, change, changeType = "neutral", sparklineData, icon }: KPICardProps) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${
              changeType === "positive" ? "text-emerald-400" :
              changeType === "negative" ? "text-red-400" :
              "text-gray-400"
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {icon && <div className="text-gray-400">{icon}</div>}
          {sparklineData && <Sparkline data={sparklineData} />}
        </div>
      </div>
    </GlassCard>
  )
}
