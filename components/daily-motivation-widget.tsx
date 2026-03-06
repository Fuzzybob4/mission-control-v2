"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { Zap } from "lucide-react"

const quotes = [
  "Success is the sum of small efforts repeated day in and day out.",
  "The only way to do great work is to love what you do.",
  "Don't watch the clock; do what it does. Keep going.",
]

export function DailyMotivationWidget() {
  const [quote, setQuote] = useState("")

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)])
  }, [])

  return (
    <GlassCard className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
      <div className="p-4 flex items-center gap-3">
        <Zap className="w-5 h-5 text-yellow-400" />
        <p className="text-sm text-gray-300 italic" suppressHydrationWarning>
          {quote ? `"${quote}"` : ""}
        </p>
      </div>
    </GlassCard>
  )
}
