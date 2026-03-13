"use client"

import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { ChevronLeft, ChevronRight, CalendarDays, Loader2, AlertTriangle } from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────

type AgentDisplay = "Kal" | "Nova" | "Vera" | "Iris" | "Scarlett"

type Priority = "high" | "medium" | "low"
type Status = "todo" | "in_progress" | "done"

type WeekTask = {
  id: string
  agent: AgentDisplay
  title: string
  day: number // 0 = Mon … 4 = Fri
  priority: Priority
  status: Status
  biz?: string | null
}

interface McTaskRecord {
  id: string
  title: string
  status: string
  priority: string | null
  assigned_agent_id: string
  business_unit: string | null
  due_date: string
}

// ── Agent color map ───────────────────────────────────────────────────────────

const AGENT_META: Record<AgentDisplay, { color: string; dot: string; bg: string }> = {
  Kal:      { color: "text-blue-300",    dot: "bg-blue-400",    bg: "bg-blue-500/15 border-blue-500/25"    },
  Nova:     { color: "text-cyan-300",    dot: "bg-cyan-400",    bg: "bg-cyan-500/15 border-cyan-500/25"    },
  Vera:     { color: "text-amber-300",   dot: "bg-amber-400",   bg: "bg-amber-500/15 border-amber-500/25"  },
  Iris:     { color: "text-blue-300",    dot: "bg-blue-400",    bg: "bg-blue-500/10 border-blue-500/20"    },
  Scarlett: { color: "text-violet-300",  dot: "bg-violet-400",  bg: "bg-violet-500/15 border-violet-500/25"},
}

const PRIORITY_DOT: Record<Priority, string> = {
  high: "bg-red-400",
  medium: "bg-amber-400",
  low: "bg-emerald-400",
}

const STATUS_STYLE: Record<Status, string> = {
  todo: "opacity-70",
  in_progress: "opacity-100",
  done: "opacity-40 line-through decoration-white/30",
}

const AGENT_IDS: Record<string, AgentDisplay> = {
  atlas: "Kal",
  nova: "Nova",
  vera: "Vera",
  iris: "Iris",
  scarlett: "Scarlett",
}

const AGENT_FILTERS: AgentDisplay[] = ["Kal", "Nova", "Vera", "Iris", "Scarlett"]
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"]

// ── Static fallback data ─────────────────────────────────────────────────────

const FALLBACK_TASKS: WeekTask[] = [
  { id: "k1", agent: "Kal", title: "Weekly team standup", day: 0, priority: "high", status: "done", biz: "All" },
  { id: "k2", agent: "Kal", title: "Review Q2 revenue projections", day: 1, priority: "high", status: "in_progress", biz: "All" },
  { id: "k3", agent: "Kal", title: "Lone Star proposal review", day: 2, priority: "medium", status: "todo", biz: "Lone Star" },
  { id: "n1", agent: "Nova", title: "Lead queue audit", day: 0, priority: "high", status: "done", biz: "From Inception" },
  { id: "n2", agent: "Nova", title: "Client onboarding deck", day: 1, priority: "high", status: "in_progress", biz: "From Inception" },
  { id: "n3", agent: "Nova", title: "Builder sprint", day: 2, priority: "medium", status: "todo", biz: "From Inception" },
  { id: "v1", agent: "Vera", title: "Installer schedule review", day: 0, priority: "high", status: "done", biz: "Lone Star" },
  { id: "v2", agent: "Vera", title: "Vendor follow-ups", day: 1, priority: "high", status: "in_progress", biz: "Lone Star" },
  { id: "v3", agent: "Vera", title: "Site QA", day: 2, priority: "medium", status: "todo", biz: "Lone Star" },
  { id: "i1", agent: "Iris", title: "Sprint planning", day: 0, priority: "high", status: "done", biz: "RedFox" },
  { id: "i2", agent: "Iris", title: "Support backlog", day: 2, priority: "medium", status: "todo", biz: "RedFox" },
  { id: "s1", agent: "Scarlett", title: "Inventory audit", day: 0, priority: "medium", status: "done", biz: "Heroes" },
  { id: "s2", agent: "Scarlett", title: "Community drop prep", day: 3, priority: "low", status: "todo", biz: "Heroes" },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function startOfWeek(offset: number) {
  const today = new Date()
  const monday = new Date(today)
  const day = today.getDay() || 7 // 1-7 (Mon=1)
  monday.setDate(today.getDate() - day + 1 + offset * 7)
  monday.setHours(0, 0, 0, 0)
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)
  return { monday, friday }
}

function formatRange(offset: number) {
  const { monday, friday } = startOfWeek(offset)
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  return `${fmt(monday)} — ${fmt(friday)}`
}

function iso(date: Date) {
  return date.toISOString().split("T")[0]
}

function mapPriority(value: string | null): Priority {
  if (!value) return "medium"
  const normalized = value.toLowerCase()
  if (normalized === "high") return "high"
  if (normalized === "low") return "low"
  return "medium"
}

function mapStatus(value: string | null): Status {
  if (!value) return "todo"
  const normalized = value.toLowerCase()
  if (normalized === "completed" || normalized === "done") return "done"
  if (normalized === "in_progress" || normalized === "in-progress") return "in_progress"
  return "todo"
}

function diffInDays(date: Date, start: Date) {
  const ms = date.getTime() - start.getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

// ── Component ─────────────────────────────────────────────────────────────────

export function WeeklyTasksCalendar() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [activeAgent, setActiveAgent] = useState<AgentDisplay | "all">("all")
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [tasks, setTasks] = useState<WeekTask[]>(FALLBACK_TASKS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(() => supabase === null)

  useEffect(() => {
    if (!supabase) {
      setUsingFallback(true)
      setTasks(FALLBACK_TASKS)
      return
    }

    const { monday } = startOfWeek(weekOffset)
    const startISO = iso(monday)
    const endISO = iso(new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000))

    setLoading(true)
    setError(null)

    supabase
      .from("mc_tasks")
      .select("id,title,status,priority,assigned_agent_id,business_unit,due_date")
      .in("assigned_agent_id", Object.keys(AGENT_IDS))
      .gte("due_date", startISO)
      .lt("due_date", endISO)
      .then(({ data, error }) => {
        if (error) {
          setError(error.message)
          setUsingFallback(true)
          setTasks(FALLBACK_TASKS)
        } else if (data && data.length) {
          const mapped = (data as McTaskRecord[])
            .map(task => {
              const agent = AGENT_IDS[task.assigned_agent_id]
              if (!agent) return null
              const due = new Date(task.due_date)
              const dayIndex = diffInDays(due, monday)
              if (dayIndex < 0 || dayIndex > 4) return null
              return {
                id: task.id,
                agent,
                title: task.title,
                day: dayIndex,
                priority: mapPriority(task.priority),
                status: mapStatus(task.status),
                biz: task.business_unit,
              } as WeekTask
            })
            .filter(Boolean) as WeekTask[]
          setTasks(mapped)
          setUsingFallback(false)
        } else {
          setTasks([])
          setUsingFallback(false)
        }
      })
      .then(() => setLoading(false), () => setLoading(false))
  }, [weekOffset])

  const filtered = useMemo(() => (
    tasks.filter(task => activeAgent === "all" || task.agent === activeAgent)
  ), [tasks, activeAgent])

  const tasksByDayAgent = (day: number, agent: AgentDisplay) =>
    filtered.filter(t => t.day === day && t.agent === agent)

  const totalDone  = tasks.filter(t => t.status === "done").length
  const totalTasks = tasks.length
  const pct = totalTasks === 0 ? 0 : Math.round((totalDone / totalTasks) * 100)

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Weekly Task Schedule</h2>
            <p className="text-xs text-gray-500">{formatRange(weekOffset)}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-gray-400">{pct}%</span>
          </div>
          {loading && (
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Syncing…
            </span>
          )}
          {usingFallback && !loading && (
            <span className="text-[10px] text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Showing fallback data
            </span>
          )}
          {error && !usingFallback && (
            <span className="text-[10px] text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {error}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Week nav */}
          <div className="flex items-center gap-1 mr-2">
            <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setWeekOffset(0)} className="px-2 py-1 rounded-lg text-xs text-gray-500 hover:text-white hover:bg-white/10 transition-colors">
              Current week
            </button>
            <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
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
            {AGENT_FILTERS.map(agent => {
              const meta = AGENT_META[agent]
              return (
                <button
                  key={agent}
                  onClick={() => setActiveAgent(activeAgent === agent ? "all" : agent)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5",
                    activeAgent === agent
                      ? `${meta.bg} ${meta.color}`
                      : "border-white/10 text-gray-500 hover:text-white hover:border-white/20"
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", meta.dot)} />
                  {agent}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-5 border-b border-white/[0.06]">
            {DAYS.map((day, idx) => {
              const today = new Date()
              const todayDay = today.getDay() === 0 ? 6 : today.getDay() - 1
              const isToday = weekOffset === 0 && todayDay === idx
              return (
                <div
                  key={day}
                  className={cn(
                    "px-4 py-2.5 text-center text-xs font-semibold border-r border-white/[0.06] last:border-r-0",
                    isToday ? "text-blue-400 bg-blue-500/5" : "text-gray-500"
                  )}
                >
                  {day}
                  {isToday && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-blue-400 align-middle" />}
                </div>
              )
            })}
          </div>

          {AGENT_FILTERS.map(agent => {
            const meta = AGENT_META[agent]
            const agentVisible = activeAgent === "all" || activeAgent === agent
            if (!agentVisible) return null
            return (
              <div key={agent} className="grid grid-cols-5 border-b border-white/[0.04] last:border-b-0">
                {DAYS.map((_, dayIdx) => {
                  const dayTasks = tasksByDayAgent(dayIdx, agent)
                  return (
                    <div key={dayIdx} className="px-2 py-2 min-h-[80px] border-r border-white/[0.04] last:border-r-0 space-y-1.5">
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
                            <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5", PRIORITY_DOT[task.priority])} />
                            <p className={cn("text-[11px] leading-tight", task.status === "done" ? "text-gray-500 line-through" : "text-white")}>
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

      <div className="px-5 py-3 border-t border-white/[0.06] flex items-center gap-4 flex-wrap">
        <span className="text-[10px] text-gray-600 uppercase tracking-wide font-semibold">Priority</span>
        {[{ label: "High", color: PRIORITY_DOT.high }, { label: "Medium", color: PRIORITY_DOT.medium }, { label: "Low", color: PRIORITY_DOT.low }].map(p => (
          <div key={p.label} className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", p.color)} />
            <span className="text-[11px] text-gray-500">{p.label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-4 text-[11px] text-gray-600">
          {tasks.length === 0 ? "No scheduled tasks for this window" : `${totalDone} of ${totalTasks || 0} tasks done this week`}
        </div>
      </div>
    </div>
  )
}
