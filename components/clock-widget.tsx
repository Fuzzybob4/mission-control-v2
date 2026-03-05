"use client"

import { useState, useEffect } from "react"

export function ClockWidget() {
  const [timeStr, setTimeStr] = useState("")

  useEffect(() => {
    const update = () =>
      setTimeStr(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="text-xs text-gray-400 font-mono min-w-[3.5rem]">
      {timeStr}
    </div>
  )
}
