"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────

interface WeekTask {
  id: string
  agent: "Kal" | "Nova" | "Vera" | "Iris" | "Scarlett"
  title: string
  day: number          // 0 = Mon … 4 = Fri
  priority: "high" | "medium" | "low"
  status: "todo" | "in_progress" | "done"
  biz?: string
}

// ── Agent color map ───────────────────────────────────────────────────────────

const AGENT_META: Record<string, { color: string; dot: string; bg: string }> = {
  Kal:      { color: "text-blue-300",    dot: "bg-blue-400",    bg: "bg-blue-500/15 border-blue-500/25"    },
  Nova:     { color: "text-cyan-300",    dot: "bg-cyan-400",    bg: "bg-cyan-500/15 border-cyan-500/25"    },
  Vera:     { color: "text-amber-300",   dot: "bg-amber-400",   bg: "bg-amber-500/15 border-amber-500/25"  },
  Iris:     { color: "text-blue-300",    dot: "bg-blue-400",    bg: "bg-blue-500/10 border-blue-500/20"    },
  Scarlett: { color: "text-violet-300",  dot: "bg-violet-400",  bg: "bg-violet-500/15 border-violet-500/25"},
}

const PRIORITY_DOT: Record<string, string> = {
  high:   "bg-red-400",
  medium: "bg-amber-400",
  low:    "bg-emerald-400",
}

const STATUS_STYLE: Record<string, string> = {
  todo:        "opacity-70",
  in_progress: "opacity-100",
  done:        "opacity-40 line-through decoration-white/30",
}

// ── Static week tasks ─────────────────────────────────────────────────────────

const WEEK_TASKS: WeekTask[] = [
  // Kal
  { id: "k1", agent: "Kal", title: "Weekly team standup", day: 0, priority: "high",   status: "done",        biz: "All" },
  { id: "k2", agent: "Kal", title: "Review Q2 revenue projections", day: 1, priority: "high", status: "in_progress", biz: "All" },
  { id: "k3", agent: "Kal", title: "Lone Star proposal review", day: 2, priority: "medium", status: "todo", biz: "Lone Star" },
  { id: "k4", agent: "Kal", title: "RedFox investor update", day: 3, priority: "medium", status: "todo", biz: "RedFox" },
  { id: "k5", agent: "Kal", title: "End-of-week recap", day: 4, priority: "low", status: "todo", biz: "All" },

  // Nova
  { id: "n1", agent: "Nova", title: "Brand identity research", day: 0, priority: "high", status: "done", biz: "From Inception" },
  { id: "n2", agent: "Nova", title: "Client onboarding deck", day: 1, priority: "high", status: "in_progress", biz: "From Inception" },
  { id: "n3", agent: "Nova", title: "Service pricing model",  day: 2, priority: "medium", status: "todo", biz: "From Inception" },
  { id: "n4", agent: "Nova", title: "Outreach email drafts",  day: 3, priority: "medium", status: "todo", biz: "From Inception" },
  { id: "n5", agent: "Nova", title: "Weekly summary to Kal",  day: 4, priority: "low",    status: "todo", biz: "From Inception" },

  // Vera
  { id: "v1", agent: "Vera", title: "Installer schedule review",  day: 0, priority: "high",   status: "done",        biz: "Lone Star" },
  { id: "v2", agent: "Vera", title: "Invoice follow-ups",         day: 1, priority: "high",   status: "in_progress", biz: "Lone Star" },
  { id: "v3", agent: "Vera", title: "Equipment inventory audit",  day: 2, priority: "medium", status: "todo",        biz: "Lone Star" },
  { id: "v4", agent: "Vera", title: "New lead quote prep",        day: 3, priority: "medium", status: "todo",        biz: "Lone Star" },
  { id: "v5", agent: "Vera", title: "Job photo uploads",          day: 4, priority: "low",    status: "todo",        biz: "Lone Star" },

  // Iris
  { id: "i1", agent: "Iris", title: "CRM sprint planning",        day: 0, priority: "high",   status: "done",        biz: "RedFox" },
  { id: "i2", agent: "Iris", title: "User story write-up",        day: 1, priority: "high",   status: "in_progress", biz: "RedFox" },
  { id: "i3", agent: "Iris", title: "Competitor feature audit",   day: 2, priority: "medium", status: "todo",        biz: "RedFox" },
  { id: "i4", agent: "Iris", title: "Beta tester outreach",       day: 3, priority: "medium", status: "todo",        biz: "RedFox" },
  { id: "i5", agent: "Iris", title: "Dev handoff notes",          day: 4, priority: "low",    status: "todo",        biz: "RedFox" },

  // Scarlett
  { id: "s1", agent: "Scarlett", title: "Card catalog update",     day: 0, priority: "medium", status: "done",        biz: "Heroes" },
  { id: "s2", agent: "Scarlett", title: "Seller policy review",    day: 1, priority: "high",   status: "in_progress", biz: "Heroes" },
  { id: "s3", agent: "Scarlett", title: "SEO keyword research",    day: 2, priority: "medium", status: "todo",        biz: "Heroes" },
  { id: "s4", agent: "Scarlett", title: "Community post draft",    day: 3, priority: "low",    status: "todo",        biz: "Heroes" },
  { id: "s5", agent: "Scarlett", title: "Marketplace audit",       day: 4, priority: "medium", status: "todo",        biz: "Heroes" },
]

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"]
const AGENTS: WeekTask["agent"][] = ["Kal", "Nova", "Vera", "Iris", "Scarlett"]

// ── Helper: get week label ────────────────────────────────────────────────────

function getWeekLabel(offset: number) {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - today.getDay() + 1 + offset * 7)
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  return `${fmt(monday)} — ${fmt(friday)}`
}

// ── Component ─────────────────────────────────────────────────────────────────

export function WeeklyTasksCalendar() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [activeAgent, setActiveAgent] = useState<WeekTask["agent"] | "all">("all")
  const [expandedTask, setExpandedTask] = useState<string | null>(null)

  const filtered = WEEK_TASKS.filter(
    t => activeAgent === "all" || t.agent === activeAgent
  )

  const tasksByDayAgent = (day: number, agent: WeekTask["agent"]) =>
    filtered.filter(t => t.day === day && t.agent === agent)

  const totalDone  = WEEK_TASKS.filter(t => t.status === "done").length
  const totalTasks = WEEK_TASKS.length
  const pct = Math.round((totalDone / totalTasks) * 100)

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Weekly Task Schedule</h2>
            <p className="text-xs text-gray-500">{getWeekLabel(weekOffset)}</p>
          </div>
          {/* Progress pill */}
          <div className="ml-2 flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">{pct}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Week nav */}
          <div className="flex items-center gap-1 mr-2">
            <button
              onClick={() => setWeekOffset(w => w - 1)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className="px-2 py-1 rounded-lg text-xs text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setWeekOffset(w => w + 1)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Agent filter pills */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => setActiveAgent("all")}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                activeAgent === "all"
                  ? "bg-white/10 border-white/20 text-white"
                  : "border-white/10 text-gray-500 hover:text-white hover:border-white/20"
              )}
            >
              All
            </button>
            {AGENTS.map(a => {
              const meta = AGENT_META[a]
              return (
                <button
                  key={a}
                  onClick={() => setActiveAgent(activeAgent === a ? "all" : a)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5",
                    activeAgent === a
                      ? `${meta.bg} ${meta.color}`
                      : "border-white/10 text-gray-500 hover:text-white hover:border-white/20"
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", meta.dot)} />
                  {a}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Day headers */}
          <div className="grid grid-cols-5 border-b border-white/[0.06]">
            {DAYS.map((day, i) => {
              const today = new Date()
              const todayDay = today.getDay() // 0=Sun
              const isToday = weekOffset === 0 && todayDay === i + 1
              return (
                <div
                  key={day}
                  className={cn(
                    "px-4 py-2.5 text-center text-xs font-semibold border-r border-white/[0.06] last:border-r-0",
                    isToday ? "text-blue-400 bg-blue-500/5" : "text-gray-500"
                  )}
                >
                  <span>{day}</span>
                  {isToday && (
                    <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-blue-400 align-middle" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Agent rows */}
          {AGENTS.map(agent => {
            const meta = AGENT_META[agent]
            const agentVisible = activeAgent === "all" || activeAgent === agent
            if (!agentVisible) return null
            return (
              <div key={agent} className="grid grid-cols-5 border-b border-white/[0.04] last:border-b-0">
                {DAYS.map((_, dayIdx) => {
                  const dayTasks = tasksByDayAgent(dayIdx, agent)
                  return (
                    <div
                      key={dayIdx}
                      className="px-2 py-2 min-h-[80px] border-r border-white/[0.04] last:border-r-0 space-y-1.5"
                    >
                      {dayIdx === 0 && (
                        <p className={cn("text-[10px] font-semibold mb-1 flex items-center gap-1", meta.color)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", meta.dot)} />
                          {agent}
                        </p>
                      )}
                      {dayTasks.map(task => (
                        <button
                          key={task.id}
                          onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                          className={cn(
                            "w-full text-left rounded-lg border px-2 py-1.5 transition-all",
                            meta.bg,
                            STATUS_STYLE[task.status],
                            expandedTask === task.id && "ring-1 ring-white/20"
                          )}
                        >
                          <div className="flex items-start gap-1.5">
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5",
                              PRIORITY_DOT[task.priority]
                            )} />
                            <p className={cn(
                              "text-[11px] leading-tight",
                              task.status === "done" ? "text-gray-500 line-through" : "text-white"
                            )}>
                              {task.title}
                            </p>
                          </div>
                          {expandedTask === task.id && (
                            <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between">
                              <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-md",
                                task.status === "done"        ? "bg-emerald-400/10 text-emerald-400" :
                                task.status === "in_progress" ? "bg-amber-400/10 text-amber-400"     :
                                "bg-white/5 text-gray-500"
                              )}>
                                {task.status.replace("_", " ")}
                              </span>
                              {task.biz && (
                                <span className="text-[10px] text-gray-600">{task.biz}</span>
                              )}
                            </div>
                          )}
                        </button>
                      ))}
                      {dayTasks.length === 0 && dayIdx !== 0 && (
                        <div className="w-full h-6 rounded-md border border-dashed border-white/[0.06]" />
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-white/[0.06] flex items-center gap-4 flex-wrap">
        <span className="text-[10px] text-gray-600 uppercase tracking-wide font-semibold">Priority</span>
        {[
          { label: "High",   color: "bg-red-400"     },
          { label: "Medium", color: "bg-amber-400"   },
          { label: "Low",    color: "bg-emerald-400" },
        ].map(p => (
          <div key={p.label} className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", p.color)} />
            <span className="text-[11px] text-gray-500">{p.label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-4">
          <span className="text-[11px] text-gray-600">{totalDone} of {totalTasks} tasks done this week</span>
        </div>
      </div>
    </div>
  )
}
