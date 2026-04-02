"use client"

import { useState, useEffect } from "react"

export function ShipTimeClock() {
  const [time, setTime] = useState<string>("")

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const h = now.getHours().toString().padStart(2, "0")
      const m = now.getMinutes().toString().padStart(2, "0")
      const s = now.getSeconds().toString().padStart(2, "0")
      setTime(`${h}:${m}:${s}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col items-end" data-component="ship-time-clock">
      <span className="text-[10px] tracking-widest uppercase text-cyan-400/60 font-mono">Ship Time</span>
      <span className="text-sm font-mono text-cyan-300 tabular-nums" style={{ textShadow: "0 0 8px rgba(0, 229, 255, 0.6)" }}>
        {time || "00:00:00"}
      </span>
    </div>
  )
}
