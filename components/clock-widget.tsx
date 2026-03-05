"use client"

import { useState, useEffect } from "react"

export function ClockWidget() {
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!time) return <div className="text-xs text-gray-400 font-mono w-12" />

  return (
    <div className="text-xs text-gray-400 font-mono">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </div>
  )
}
