"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { GlassCard } from "@/components/ui/glass-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { SkillRegistry } from "@/components/skill-registry"
import { AgentNetwork } from "@/components/agents"
import {
  Bot, Wrench, Network, ArrowLeft,
  Cpu, ChevronRight, Activity, Zap, CheckCircle2, X, Clock
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Agent {
  id: string
  slug: string
  name: string
  role: string
  tier: number
  status: string
  business_unit: string | null
  last_active?: string
  tasks_completed?: number
}

interface AgentTask {
  id: string
  title: string
  status: string
  created_at: string
  completed_at?: string | null
}

const STATIC_AGENTS: Agent[] = [
  { id: "1",  slug: "atlas",    name: "Atlas",    role: "Executive Coordinator",  tier: 1, status: "active", business_unit: null,              tasks_completed: 142 },
  { id: "2",  slug: "nova",     name: "Nova",     role: "From Inception Lead",    tier: 2, status: "active", business_unit: "from-inception",  tasks_completed: 53  },
  { id: "3",  slug: "vera",     name: "Vera",     role: "Lone Star Lead",         tier: 2, status: "active", business_unit: "lone-star",       tasks_completed: 87  },
  { id: "4",  slug: "iris",     name: "Iris",     role: "RedFox Lead",            tier: 2, status: "active", business_unit: "redfox",          tasks_completed: 64  },
  { id: "5",  slug: "scarlett", name: "Scarlett", role: "Heroes Lead",            tier: 2, status: "active", business_unit: "heroes",          tasks_completed: 31  },
  { id: "6",  slug: "ruby",     name: "Ruby",     role: "Sales Specialist",       tier: 3, status: "idle",   business_unit: null,              tasks_completed: 55  },
  { id: "7",  slug: "sierra",   name: "Sierra",   role: "Marketing Specialist",   tier: 3, status: "idle",   business_unit: null,              tasks_completed: 48  },
  { id: "8",  slug: "scout",    name: "Scout",    role: "Research Specialist",    tier: 3, status: "idle",   business_unit: null,              tasks_completed: 72  },
  { id: "9",  slug: "maverick", name: "Maverick", role: "DevOps Specialist",      tier: 3, status: "idle",   business_unit: null,              tasks_completed: 29  },
  { id: "10", slug: "barnes",   name: "Barnes",   role: "Documentation Agent",    tier: 4, status: "idle",   business_unit: null,              tasks_completed: 18  },
  { id: "11", slug: "pax",      name: "Pax",      role: "Communications Agent",   tier: 4, status: "idle",   business_unit: null,              tasks_completed: 22  },
  { id: "12", slug: "otis",     name: "Otis",     role: "Data Agent",             tier: 4, status: "idle",   business_unit: null,              tasks_completed: 41  },
  { id: "13", slug: "otto",     name: "Otto",     role: "Quality Agent",          tier: 4, status: "idle",   business_unit: null,              tasks_completed: 37  },
]

const TIER_CONFIG: Record<number, { label: string; color: string; accent: string }> = {
  1: { label: "Tier 1 — Executive",       color: "border-blue-500/30 bg-blue-500/5",       accent: "text-blue-400"   },
  2: { label: "Tier 2 — Business Leads",  color: "border-emerald-500/30 bg-emerald-500/5", accent: "text-emerald-400" },
  3: { label: "Tier 3 — Specialists",     color: "border-amber-500/30 bg-amber-500/5",     accent: "text-amber-400"  },
  4: { label: "Tier 4 — Workers",         color: "border-white/10 bg-white/[0.03]",        accent: "text-gray-400"   },
}

const BIZ_LABELS: Record<string, string> = {
  "lone-star":      "Lone Star",
  "redfox":         "RedFox",
  "heroes":         "Heroes",
  "from-inception": "From Inception",
}

type View = "roster" | "map" | "skills"

export default function AgentsPage() {
  const [view, setView]         = useState<View>("roster")
  const [agents, setAgents]     = useState<Agent[]>(STATIC_AGENTS)
  const [selected, setSelected] = useState<Agent | null>(null)
  const [tasks, setTasks]       = useState<AgentTask[] | null>(null)
  const [tasksLoading, setTasksLoading] = useState(false)
  const [tasksTable, setTasksTable]     = useState<"found" | "missing" | "loading">("loading")
  const panelRef = useRef<HTMLDivElement>(null)

  // Load agents from mc_agents
  useEffect(() => {
    if (!supabase) return
    supabase
      .from("mc_agents")
      .select("id, slug, name, role, tier, status, business_unit, last_active, tasks_completed")
      .then(({ data, error }) => {
        if (error) return
        if (data && data.length > 0) {
          const sorted = [...data].sort((a: any, b: any) => (a.tier ?? 99) - (b.tier ?? 99))
          setAgents(sorted as Agent[])
        }
      })
  }, [])

  // Load tasks when an agent is selected
  useEffect(() => {
    if (!selected || !supabase) { setTasks(null); return }
    setTasksLoading(true)
    setTasks(null)
    // Try mc_tasks first, then agent_tasks
    const tryTable = async (table: string) => {
      const { data, error } = await supabase!
        .from(table)
        .select("id, title, status, created_at, completed_at")
        .eq("agent_id", selected.id)
        .order("created_at", { ascending: false })
        .limit(20)
      return { data, error }
    }

    tryTable("mc_tasks").then(async ({ data, error }) => {
      if (!error && data) {
        setTasksTable("found")
        setTasks(data as AgentTask[])
      } else {
        // Try fallback table name
        const { data: data2, error: error2 } = await tryTable("agent_tasks")
        if (!error2 && data2) {
          setTasksTable("found")
          setTasks(data2 as AgentTask[])
        } else {
          setTasksTable("missing")
          setTasks([])
        }
      }
      setTasksLoading(false)
    })
  }, [selected])

  // Scroll panel into view on mobile when opened
  useEffect(() => {
    if (selected && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [selected])

  const tiers  = [1, 2, 3, 4]
  const active = agents.filter(a => a.status === "active").length
  const busy   = agents.filter(a => a.status === "busy").length
  const total  = agents.reduce((s, a) => s + (a.tasks_completed ?? 0), 0)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-40 glass border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Mission Control
          </Link>
          <span className="text-white/20">/</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-blue-400" />
            </div>
            <h1 className="text-base font-semibold text-white">Agent Network</h1>
            <span className="text-xs text-gray-500 font-mono">/agents</span>
          </div>
        </div>
        <div className="flex bg-white/5 rounded-lg p-1 gap-0.5">
          {([
            { id: "roster", icon: Bot,     label: "Roster"   },
            { id: "map",    icon: Network, label: "Live Map" },
            { id: "skills", icon: Wrench,  label: "Skills"   },
          ] as const).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5",
                view === id ? "bg-blue-500/20 text-blue-400" : "text-gray-400 hover:text-white"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {view === "skills" ? (
          <SkillRegistry />
        ) : view === "map" ? (
          <AgentNetwork />
        ) : (
          <div className={cn("flex gap-6", selected ? "items-start" : "")}>

            {/* Left: roster */}
            <div className="flex-1 min-w-0 space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Bot,          label: "Total Agents",    value: agents.length, color: "text-white"       },
                  { icon: Activity,     label: "Active",          value: active,        color: "text-emerald-400" },
                  { icon: Zap,          label: "Busy",            value: busy,          color: "text-amber-400"   },
                  { icon: CheckCircle2, label: "Tasks Completed", value: total,         color: "text-blue-400"    },
                ].map(({ icon: Icon, label, value, color }) => (
                  <GlassCard key={label} className="p-5">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-xs">{label}</span>
                    </div>
                    <p className={cn("text-3xl font-bold", color)}>{value}</p>
                  </GlassCard>
                ))}
              </div>

              {/* Tiered roster */}
              {tiers.map(tier => {
                const group  = agents.filter(a => a.tier === tier)
                const config = TIER_CONFIG[tier]
                if (!group.length) return null
                return (
                  <div key={tier}>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className={cn("text-sm font-semibold", config.accent)}>{config.label}</h3>
                      <span className="text-xs text-gray-600">{group.length} agents</span>
                    </div>
                    <div className={cn(
                      "grid gap-3",
                      tier === 1 ? "grid-cols-1" :
                      tier === 2 ? "grid-cols-1 md:grid-cols-3" :
                      "grid-cols-2 md:grid-cols-4"
                    )}>
                      {group.map(agent => (
                        <button
                          key={agent.id}
                          onClick={() => setSelected(selected?.id === agent.id ? null : agent)}
                          className={cn(
                            "text-left rounded-2xl border p-4 transition-all hover:border-blue-500/40 hover:bg-blue-500/5",
                            config.color,
                            selected?.id === agent.id && "border-blue-500/60 bg-blue-500/10 ring-1 ring-blue-500/30"
                          )}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                              <Bot className={cn("w-4 h-4", config.accent)} />
                            </div>
                            <StatusBadge status={agent.status as any} label={agent.status} />
                          </div>
                          <p className="text-sm font-semibold text-white">{agent.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{agent.role}</p>
                          {agent.business_unit && (
                            <p className="text-xs text-blue-400/70 mt-1">{BIZ_LABELS[agent.business_unit]}</p>
                          )}
                          <div className="flex items-center gap-1 mt-3 text-gray-600">
                            <CheckCircle2 className="w-3 h-3" />
                            <span className="text-xs">{agent.tasks_completed ?? 0} tasks</span>
                            <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right: detail panel */}
            {selected && (
              <div
                ref={panelRef}
                className="w-80 flex-shrink-0 sticky top-24 space-y-4"
              >
                {/* Agent header */}
                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                        <Bot className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white">{selected.name}</h2>
                        <p className="text-xs text-gray-400">{selected.role}</p>
                        {selected.business_unit && (
                          <span className="text-xs text-blue-400 mt-0.5 block">
                            {BIZ_LABELS[selected.business_unit] ?? selected.business_unit}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-white/5 p-3">
                      <p className="text-lg font-bold text-white">{selected.tasks_completed ?? 0}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Completed</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3">
                      <p className="text-sm font-semibold text-white capitalize">{selected.status}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Status</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3">
                      <p className="text-sm font-semibold text-white">Tier {selected.tier}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Level</p>
                    </div>
                  </div>
                </div>

                {/* Tasks list */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-white">Recent Tasks</span>
                  </div>
                  <div className="divide-y divide-white/[0.06]">
                    {tasksLoading ? (
                      <div className="px-4 py-6 text-center text-xs text-gray-500">Loading tasks...</div>
                    ) : tasksTable === "missing" ? (
                      <div className="px-4 py-6 text-center space-y-1">
                        <p className="text-xs text-gray-400">No tasks table found in Supabase.</p>
                        <p className="text-xs text-gray-600">Create an <code className="text-gray-500">mc_tasks</code> table with columns: <code className="text-gray-500">id, agent_id, title, status, created_at</code></p>
                      </div>
                    ) : tasks && tasks.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-gray-500">No tasks logged for {selected.name}.</div>
                    ) : tasks ? (
                      tasks.map(task => (
                        <div key={task.id} className="px-4 py-3 flex items-start gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                            task.status === "completed" ? "bg-emerald-400" :
                            task.status === "in_progress" ? "bg-amber-400" : "bg-white/20"
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white truncate">{task.title}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-gray-600" />
                              <span className="text-xs text-gray-600">
                                {new Date(task.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <span className={cn(
                            "text-xs px-1.5 py-0.5 rounded-md flex-shrink-0",
                            task.status === "completed"  ? "bg-emerald-400/10 text-emerald-400" :
                            task.status === "in_progress" ? "bg-amber-400/10 text-amber-400" :
                            "bg-white/5 text-gray-500"
                          )}>
                            {task.status.replace("_", " ")}
                          </span>
                        </div>
                      ))
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}


interface Agent {
  id: string
  slug: string
  name: string
  role: string
  tier: number
  status: string
  business_unit: string | null
  last_active?: string
  tasks_completed?: number
}

const STATIC_AGENTS: Agent[] = [
  { id: "1",  slug: "atlas",    name: "Atlas",    role: "Executive Coordinator",  tier: 1, status: "active", business_unit: null,              tasks_completed: 142 },
  { id: "2",  slug: "nova",     name: "Nova",     role: "From Inception Lead",    tier: 2, status: "active", business_unit: "from-inception",  tasks_completed: 53  },
  { id: "3",  slug: "vera",     name: "Vera",     role: "Lone Star Lead",         tier: 2, status: "active", business_unit: "lone-star",       tasks_completed: 87  },
  { id: "4",  slug: "iris",     name: "Iris",     role: "RedFox Lead",            tier: 2, status: "active", business_unit: "redfox",          tasks_completed: 64  },
  { id: "5",  slug: "scarlett", name: "Scarlett", role: "Heroes Lead",            tier: 2, status: "active", business_unit: "heroes",          tasks_completed: 31  },
  { id: "6",  slug: "ruby",     name: "Ruby",     role: "Sales Specialist",       tier: 3, status: "idle",   business_unit: null,              tasks_completed: 55  },
  { id: "7",  slug: "sierra",   name: "Sierra",   role: "Marketing Specialist",   tier: 3, status: "idle",   business_unit: null,              tasks_completed: 48  },
  { id: "8",  slug: "scout",    name: "Scout",    role: "Research Specialist",    tier: 3, status: "idle",   business_unit: null,              tasks_completed: 72  },
  { id: "9",  slug: "maverick", name: "Maverick", role: "DevOps Specialist",      tier: 3, status: "idle",   business_unit: null,              tasks_completed: 29  },
  { id: "10", slug: "barnes",   name: "Barnes",   role: "Documentation Agent",    tier: 4, status: "idle",   business_unit: null,              tasks_completed: 18  },
  { id: "11", slug: "pax",      name: "Pax",      role: "Communications Agent",   tier: 4, status: "idle",   business_unit: null,              tasks_completed: 22  },
  { id: "12", slug: "otis",     name: "Otis",     role: "Data Agent",             tier: 4, status: "idle",   business_unit: null,              tasks_completed: 41  },
  { id: "13", slug: "otto",     name: "Otto",     role: "Quality Agent",          tier: 4, status: "idle",   business_unit: null,              tasks_completed: 37  },
]

const TIER_CONFIG: Record<number, { label: string; color: string; accent: string }> = {
  1: { label: "Tier 1 — Executive",       color: "border-blue-500/30 bg-blue-500/5",    accent: "text-blue-400"   },
  2: { label: "Tier 2 — Business Leads",  color: "border-emerald-500/30 bg-emerald-500/5", accent: "text-emerald-400" },
  3: { label: "Tier 3 — Specialists",     color: "border-amber-500/30 bg-amber-500/5",  accent: "text-amber-400"  },
  4: { label: "Tier 4 — Workers",         color: "border-white/10 bg-white/[0.03]",     accent: "text-gray-400"   },
}

const BIZ_LABELS: Record<string, string> = {
  "lone-star":      "Lone Star",
  "redfox":         "RedFox",
  "heroes":         "Heroes",
  "from-inception": "From Inception",
}

type View = "roster" | "map" | "skills"

export default function AgentsPage() {
  const [view, setView]     = useState<View>("roster")
  const [agents, setAgents] = useState<Agent[]>(STATIC_AGENTS)
  const [selected, setSelected] = useState<Agent | null>(null)

  useEffect(() => {
    if (!supabase) { console.log("[v0] supabase client is null"); return }
    console.log("[v0] fetching mc_agents...")
    supabase
      .from("mc_agents")
      .select("id, slug, name, role, tier, status, business_unit, last_active, tasks_completed")
      .then(({ data, error, status: httpStatus }) => {
        console.log("[v0] mc_agents response — http:", httpStatus, "error:", error?.message ?? "none", "rows:", data?.length ?? 0)
        if (error) return
        if (data && data.length > 0) {
          const sorted = [...data].sort((a: any, b: any) => (a.tier ?? 99) - (b.tier ?? 99))
          setAgents(sorted as Agent[])
        }
      })
  }, [])

  const tiers = [1, 2, 3, 4]
  const active = agents.filter(a => a.status === "active").length
  const idle   = agents.filter(a => a.status === "idle").length
  const busy   = agents.filter(a => a.status === "busy").length
  const total  = agents.reduce((s, a) => s + (a.tasks_completed ?? 0), 0)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-40 glass border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Mission Control
          </Link>
          <span className="text-white/20">/</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-blue-400" />
            </div>
            <h1 className="text-base font-semibold text-white">Agent Network</h1>
            <span className="text-xs text-gray-500 font-mono">/agents</span>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex bg-white/5 rounded-lg p-1 gap-0.5">
          {([
            { id: "roster", icon: Bot,     label: "Roster"   },
            { id: "map",    icon: Network, label: "Live Map" },
            { id: "skills", icon: Wrench,  label: "Skills"   },
          ] as const).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5",
                view === id
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-gray-400 hover:text-white"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {view === "skills" ? (
          <SkillRegistry />
        ) : view === "map" ? (
          <AgentNetwork />
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Bot,          label: "Total Agents",      value: agents.length, color: "text-white"        },
                { icon: Activity,     label: "Active",            value: active,         color: "text-emerald-400"  },
                { icon: Zap,          label: "Busy",              value: busy,           color: "text-amber-400"    },
                { icon: CheckCircle2, label: "Tasks Completed",   value: total,          color: "text-blue-400"     },
              ].map(({ icon: Icon, label, value, color }) => (
                <GlassCard key={label} className="p-5">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{label}</span>
                  </div>
                  <p className={cn("text-3xl font-bold", color)}>{value}</p>
                </GlassCard>
              ))}
            </div>

            {/* Agent detail drawer */}
            {selected && (
              <GlassCard className="border border-blue-500/30 bg-blue-500/5 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                      <Bot className="w-7 h-7 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{selected.name}</h2>
                      <p className="text-sm text-gray-400">{selected.role}</p>
                      {selected.business_unit && (
                        <span className="text-xs text-blue-400 mt-0.5 block">
                          {BIZ_LABELS[selected.business_unit] ?? selected.business_unit}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-gray-500 hover:text-white text-xs px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-2xl font-bold text-white">{selected.tasks_completed ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Tasks Completed</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white capitalize">{selected.status}</p>
                    <p className="text-xs text-gray-500 mt-1">Current Status</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white">Tier {selected.tier}</p>
                    <p className="text-xs text-gray-500 mt-1">{TIER_CONFIG[selected.tier]?.label.split("—")[1]?.trim()}</p>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Tiered roster */}
            {tiers.map(tier => {
              const group  = agents.filter(a => a.tier === tier)
              const config = TIER_CONFIG[tier]
              if (!group.length) return null
              return (
                <div key={tier}>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className={cn("text-sm font-semibold", config.accent)}>{config.label}</h3>
                    <span className="text-xs text-gray-600">{group.length} agents</span>
                  </div>
                  <div className={cn(
                    "grid gap-3",
                    tier === 1 ? "grid-cols-1" :
                    tier === 2 ? "grid-cols-1 md:grid-cols-3" :
                    "grid-cols-2 md:grid-cols-4"
                  )}>
                    {group.map(agent => (
                      <button
                        key={agent.id}
                        onClick={() => setSelected(selected?.id === agent.id ? null : agent)}
                        className={cn(
                          "text-left rounded-2xl border p-4 transition-all hover:border-blue-500/40 hover:bg-blue-500/5",
                          config.color,
                          selected?.id === agent.id && "border-blue-500/60 bg-blue-500/10"
                        )}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                            <Bot className={cn("w-4 h-4", config.accent)} />
                          </div>
                          <StatusBadge status={agent.status as any} label={agent.status} />
                        </div>
                        <p className="text-sm font-semibold text-white">{agent.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{agent.role}</p>
                        {agent.business_unit && (
                          <p className="text-xs text-blue-400/70 mt-1">{BIZ_LABELS[agent.business_unit]}</p>
                        )}
                        <div className="flex items-center gap-1 mt-3 text-gray-600">
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="text-xs">{agent.tasks_completed ?? 0} tasks</span>
                          <ChevronRight className="w-3 h-3 ml-auto" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </main>
    </div>
  )
}
