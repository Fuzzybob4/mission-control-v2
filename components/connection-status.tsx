"use client"

import { useState, useEffect, useCallback } from "react"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConnectionStatusProps {
  className?: string
  onRefresh?: () => void
}

export function ConnectionStatus({ className, onRefresh }: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return
    
    setIsRefreshing(true)
    
    // Call the optional onRefresh callback
    if (onRefresh) {
      await Promise.resolve(onRefresh())
    }
    
    // Simulate a brief refresh delay for UX feedback
    await new Promise(resolve => setTimeout(resolve, 600))
    
    setLastRefreshed(new Date())
    setIsRefreshing(false)
  }, [isRefreshing, onRefresh])

  const formatLastRefreshed = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-gray-500", className)}>
        <div className="w-2 h-2 rounded-full bg-gray-600 animate-pulse" />
        <span>Loading...</span>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg",
        "bg-white/5 border border-white/10",
        "transition-all duration-200",
        className
      )}
    >
      {/* Connection Status Indicator */}
      <div className="relative flex items-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="sr-only">Online</span>
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5 text-red-400" />
            <span className="sr-only">Offline</span>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-3 bg-white/10" />

      {/* Last Refreshed */}
      <span className="text-xs text-gray-400 tabular-nums">
        {formatLastRefreshed(lastRefreshed)}
      </span>

      {/* Refresh Button */}
      <button
        onClick={handleRefresh}
        disabled={isRefreshing || !isOnline}
        className={cn(
          "p-1 rounded-md transition-all duration-200",
          "hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500/50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isRefreshing && "cursor-wait"
        )}
        aria-label="Refresh data"
        title="Refresh data"
      >
        <RefreshCw 
          className={cn(
            "w-3 h-3 text-gray-400 hover:text-white transition-colors",
            isRefreshing && "animate-spin text-blue-400"
          )} 
        />
      </button>

      {/* Offline Warning Tooltip */}
      {!isOnline && (
        <div className="absolute -bottom-8 left-0 px-2 py-1 text-[10px] text-white bg-red-500/90 rounded-md whitespace-nowrap animate-in fade-in slide-in-from-top-1">
          You&apos;re offline
        </div>
      )}
    </div>
  )
}

// Compact version for tight spaces
export function ConnectionStatusCompact({ className }: { className?: string }) {
  const [isOnline, setIsOnline] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!mounted) {
    return <div className={cn("w-2 h-2 rounded-full bg-gray-600", className)} />
  }

  return (
    <div 
      className={cn(
        "w-2 h-2 rounded-full transition-colors duration-300",
        isOnline ? "bg-emerald-400" : "bg-red-400",
        isOnline && "animate-pulse",
        className
      )}
      title={isOnline ? "Online" : "Offline"}
    />
  )
}
