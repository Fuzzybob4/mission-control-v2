"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

type TimeRange = "today" | "week" | "month" | "quarter" | "year"

interface TimeFilterProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
}

const ranges: { id: TimeRange; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "quarter", label: "This Quarter" },
  { id: "year", label: "This Year" },
]

export function TimeFilter({ value, onChange }: TimeFilterProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
      {ranges.map((range) => (
        <button
          key={range.id}
          onClick={() => onChange(range.id)}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
            value === range.id
              ? "bg-blue-500 text-white"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          )}
        >
          {range.label}
        </button>
      ))}
    </div>
  )
}
