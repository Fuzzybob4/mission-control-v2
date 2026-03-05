"use client"

import { useState, useEffect } from "react"

export function ClockWidget() {
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    setMounted(true)
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="text-xs text-gray-400 font-mono" suppressHydrationWarning>
      {mounted ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null}
    </div>
  )
}
