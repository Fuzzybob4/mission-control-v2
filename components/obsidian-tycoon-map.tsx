"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BookOpen,
  Bot,
  Briefcase,
  Coins,
  Cpu,
  FlaskConical,
  Gem,
  Lightbulb,
  Rocket,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react"

interface ObsidianTycoonMapProps {
  onEnterDistrict?: (tab: string) => void
}

type DistrictStatus = "thriving" | "building" | "watch" | "critical"

type District = {
  id: string
  tab?: string
  name: string
  subtitle: string
  owner: string
  status: DistrictStatus
  x: string
  y: string
  size: "hub" | "large" | "medium" | "small"
  color: string
  metric: string
  detail: string
  level: string
  icon: React.ElementType
  labelPosition: "top" | "top-left" | "top-right" | "left" | "right" | "bottom-left" | "bottom-right"
}

type Agent = {
  name: string
  role: string
  district: string
  color: string
}

const districts: District[] = [
  {
    id: "mission-control",
    name: "Mission Control",
    subtitle: "Plan, manage, optimize",
    owner: "Kal",
    status: "thriving",
    x: "50%",
    y: "40%",
    size: "hub",
    color: "#2ee7ff",
    metric: "Command center online",
    detail: "The central operations surface tying business dashboards, automations, and decisions together.",
    level: "HQ",
    icon: Sparkles,
    labelPosition: "top",
  },
  {
    id: "agent-quarters",
    name: "Agent Quarters",
    subtitle: "Team readiness",
    owner: "Kal",
    status: "thriving",
    x: "20%",
    y: "18%",
    size: "large",
    color: "#d27bff",
    metric: "Operators assigned",
    detail: "Where agent roles, staffing, and operating lanes stay organized.",
    level: "Ops",
    icon: Bot,
    labelPosition: "left",
  },
  {
    id: "foundry",
    name: "The Foundry",
    subtitle: "Build and ship",
    owner: "Otis",
    status: "building",
    x: "50%",
    y: "12%",
    size: "medium",
    color: "#ff9f43",
    metric: "Features in motion",
    detail: "Product and systems workbench for features, prototypes, and releases.",
    level: "Build",
    icon: Cpu,
    labelPosition: "top-right",
  },
  {
    id: "market-district",
    name: "Market District",
    subtitle: "Offers and demand",
    owner: "Scarlett",
    status: "watch",
    x: "79%",
    y: "18%",
    size: "large",
    color: "#ff66d9",
    metric: "Pipeline under review",
    detail: "Commercial motion, offer testing, demand signals, and deal movement.",
    level: "Growth",
    icon: Gem,
    labelPosition: "top-right",
  },
  {
    id: "research-lab",
    name: "Research Lab",
    subtitle: "Experiments and intel",
    owner: "Otis",
    status: "building",
    x: "11%",
    y: "44%",
    size: "medium",
    color: "#4dffb8",
    metric: "Experiments staged",
    detail: "Research, testing, competitive intelligence, and model experiments.",
    level: "R&D",
    icon: FlaskConical,
    labelPosition: "left",
  },
  {
    id: "finance-tower",
    name: "Finance Tower",
    subtitle: "Cash and forecasting",
    owner: "Pax",
    status: "watch",
    x: "88%",
    y: "42%",
    size: "medium",
    color: "#ffd84d",
    metric: "Cash pressure visible",
    detail: "Revenue, collections, payment status, and economic visibility.",
    level: "Finance",
    icon: Coins,
    labelPosition: "right",
  },
  {
    id: "archives",
    name: "The Archives",
    subtitle: "Memory and SOPs",
    owner: "Sierra",
    status: "thriving",
    x: "17%",
    y: "70%",
    size: "medium",
    color: "#53d9ff",
    metric: "Source of truth",
    detail: "Playbooks, notes, docs, long-term memory, and operating knowledge.",
    level: "Knowledge",
    icon: BookOpen,
    labelPosition: "left",
  },
  {
    id: "command-bridge",
    name: "Command Bridge",
    subtitle: "Execution rail",
    owner: "Otto",
    status: "watch",
    x: "37%",
    y: "87%",
    size: "small",
    color: "#5bbcff",
    metric: "Queue visible",
    detail: "Task dispatch, queue visibility, and operational follow-through.",
    level: "Queue",
    icon: Briefcase,
    labelPosition: "bottom-left",
  },
  {
    id: "the-core",
    name: "The Core",
    subtitle: "Automation engine",
    owner: "Kal",
    status: "thriving",
    x: "55%",
    y: "83%",
    size: "small",
    color: "#8f7dff",
    metric: "Automation layer",
    detail: "The underlying engine powering recurring work, triggers, and system behavior.",
    level: "Core",
    icon: Zap,
    labelPosition: "bottom-right",
  },
  {
    id: "operations-deck",
    name: "Operations Deck",
    subtitle: "Process control",
    owner: "Otto",
    status: "watch",
    x: "82%",
    y: "68%",
    size: "medium",
    color: "#45d6ff",
    metric: "Workflows steady",
    detail: "Automation, recurring tasks, glue systems, and operating process tuning.",
    level: "Ops",
    icon: Cpu,
    labelPosition: "right",
  },
  {
    id: "innovation-hub",
    name: "Innovation Hub",
    subtitle: "New bets",
    owner: "Maverick",
    status: "building",
    x: "80%",
    y: "88%",
    size: "small",
    color: "#4cc9ff",
    metric: "Future bets",
    detail: "Future products, experiments, and profitable weirdness under evaluation.",
    level: "Future",
    icon: Rocket,
    labelPosition: "bottom-right",
  },
  {
    id: "lone-star",
    tab: "lone-star",
    name: "Lone Star Lighting",
    subtitle: "Field operations",
    owner: "Marshal",
    status: "thriving",
    x: "65%",
    y: "27%",
    size: "small",
    color: "#f59e0b",
    metric: "Current revenue engine",
    detail: "Sales, quoting, installs, cash collection, and service execution.",
    level: "Business",
    icon: Lightbulb,
    labelPosition: "top-left",
  },
  {
    id: "redfox-crm",
    tab: "redfox",
    name: "RedFox CRM",
    subtitle: "Product build",
    owner: "Iris",
    status: "building",
    x: "59%",
    y: "55%",
    size: "small",
    color: "#ff5a5f",
    metric: "Core product moving",
    detail: "Roadmap, onboarding, launch prep, pricing, and product architecture.",
    level: "Business",
    icon: Briefcase,
    labelPosition: "right",
  },
  {
    id: "from-inception",
    tab: "from-inception",
    name: "From Inception",
    subtitle: "CRM systems studio",
    owner: "Maverick",
    status: "building",
    x: "44%",
    y: "58%",
    size: "small",
    color: "#9c6bff",
    metric: "Offers warming",
    detail: "CRM systems, automation builds, retainers, proposals, and delivery lanes.",
    level: "Business",
    icon: Rocket,
    labelPosition: "left",
  },
]

const agents: Agent[] = [
  { name: "Kal", role: "Orchestrator", district: "Mission Control", color: "#14F1FF" },
  { name: "Otis", role: "DevOps Director", district: "Research Lab", color: "#34D399" },
  { name: "Marshal", role: "Sales Director", district: "Lone Star Lighting", color: "#F59E0B" },
  { name: "Iris", role: "Product Director", district: "RedFox CRM", color: "#FF5A5F" },
  { name: "Scarlett", role: "Market Director", district: "Market District", color: "#10B981" },
  { name: "Sierra", role: "Research Director", district: "The Archives", color: "#22D3EE" },
  { name: "Maverick", role: "Design Director", district: "From Inception", color: "#8B5CF6" },
  { name: "Pax", role: "Finance Operator", district: "Finance Tower", color: "#EAB308" },
  { name: "Otto", role: "Automation Operator", district: "Operations Deck", color: "#3B82F6" },
]

const resources = [
  ["Primary focus", "Business ops"],
  ["Mode", "Live command"],
  ["Priority", "Revenue + throughput"],
  ["Surface", "Mobile + desktop"],
]

const objectives = [
  "See what matters in one screen",
  "Move faster on revenue work",
  "Keep the aesthetic without sacrificing clarity",
]

const events = [
  ["Production status", "Live"],
  ["Latest push", "Deployed"],
]

const statusMeta: Record<DistrictStatus, string> = {
  thriving: "Thriving",
  building: "Building",
  watch: "Watch",
  critical: "Critical",
}

const bridges = [
  ["mission-control", "agent-quarters"],
  ["mission-control", "foundry"],
  ["mission-control", "market-district"],
  ["mission-control", "research-lab"],
  ["mission-control", "finance-tower"],
  ["mission-control", "archives"],
  ["mission-control", "operations-deck"],
  ["mission-control", "the-core"],
  ["the-core", "command-bridge"],
  ["the-core", "innovation-hub"],
] as const

function getDistrict(id: string) {
  return districts.find((district) => district.id === id)
}

function islandSize(size: District["size"]) {
  if (size === "hub") return "h-52 w-52 md:h-64 md:w-64"
  if (size === "large") return "h-36 w-36 md:h-44 md:w-44"
  if (size === "medium") return "h-32 w-32 md:h-40 md:w-40"
  return "h-24 w-24 md:h-28 md:w-28"
}

function bridgePath(from: District, to: District) {
  const x1 = parseFloat(from.x)
  const y1 = parseFloat(from.y)
  const x2 = parseFloat(to.x)
  const y2 = parseFloat(to.y)
  const mx = (x1 + x2) / 2
  const my = Math.min(y1, y2) - 8
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`
}

function labelPlacement(position: District["labelPosition"]) {
  switch (position) {
    case "top-left":
      return "-top-14 left-0 -translate-x-1/2"
    case "top-right":
      return "-top-14 right-0 translate-x-1/2"
    case "left":
      return "left-0 top-1/2 -translate-x-[92%] -translate-y-1/2"
    case "right":
      return "right-0 top-1/2 translate-x-[92%] -translate-y-1/2"
    case "bottom-left":
      return "bottom-0 left-0 -translate-x-1/2 translate-y-[118%]"
    case "bottom-right":
      return "bottom-0 right-0 translate-x-1/2 translate-y-[118%]"
    default:
      return "left-1/2 top-0 -translate-x-1/2 -translate-y-[118%]"
  }
}

function statusTone(status: DistrictStatus) {
  switch (status) {
    case "thriving":
      return "text-emerald-300 border-emerald-400/20 bg-emerald-400/10"
    case "building":
      return "text-sky-300 border-sky-400/20 bg-sky-400/10"
    case "critical":
      return "text-rose-300 border-rose-400/20 bg-rose-400/10"
    default:
      return "text-amber-300 border-amber-400/20 bg-amber-400/10"
  }
}

export function ObsidianTycoonMap({ onEnterDistrict }: ObsidianTycoonMapProps) {
  const [selectedDistrictId, setSelectedDistrictId] = useState("mission-control")

  const selectedDistrict = useMemo(
    () => districts.find((district) => district.id === selectedDistrictId) ?? districts[0],
    [selectedDistrictId],
  )

  const selectedAgents = agents.filter((agent) => agent.district === selectedDistrict.name)

  return (
    <section className="space-y-4">
      <div className="rounded-[28px] border border-cyan-400/15 bg-[#08101d]/70 p-4 shadow-[0_0_40px_rgba(46,231,255,0.05)] backdrop-blur-xl md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-100/45">Mission surface</div>
            <h3 className="mt-2 text-xl font-semibold text-white md:text-2xl">Cleaner district map, built for command not chaos.</h3>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              The artwork stays, but the interface now behaves more like a command surface. On mobile, the selected district and action path come first.
            </p>
          </div>
          <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${statusTone(selectedDistrict.status)}`}>
            <span className="h-2 w-2 rounded-full bg-current opacity-80" />
            {statusMeta[selectedDistrict.status]}
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_340px]">
          <div className="rounded-[28px] border border-white/10 bg-black/20 p-3 md:p-4">
            <div className="hidden overflow-hidden rounded-[24px] xl:block">
              <div className="obsidian-stage relative overflow-hidden border border-cyan-400/10">
                <div className="relative h-[980px] w-full">
                  <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="bridgeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#2ee7ff" stopOpacity="0.75" />
                        <stop offset="100%" stopColor="#c26bff" stopOpacity="0.55" />
                      </linearGradient>
                      <filter id="bridgeBlur">
                        <feGaussianBlur stdDeviation="0.35" />
                      </filter>
                    </defs>
                    {bridges.map(([fromId, toId]) => {
                      const from = getDistrict(fromId)
                      const to = getDistrict(toId)
                      if (!from || !to) return null
                      const d = bridgePath(from, to)
                      return (
                        <g key={`${fromId}-${toId}`}>
                          <path d={d} stroke="url(#bridgeGlow)" strokeWidth="1.45" fill="none" opacity="0.24" filter="url(#bridgeBlur)" />
                          <path d={d} className="obsidian-bridge-path" stroke="url(#bridgeGlow)" strokeWidth="0.42" fill="none" />
                        </g>
                      )
                    })}
                  </svg>

                  {districts.map((district, index) => {
                    const Icon = district.icon
                    const isSelected = selectedDistrict.id === district.id
                    return (
                      <motion.button
                        key={district.id}
                        initial={{ opacity: 0, scale: 0.96, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: index * 0.02, duration: 0.22 }}
                        onClick={() => setSelectedDistrictId(district.id)}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 ${islandSize(district.size)}`}
                        style={{ left: district.x, top: district.y }}
                      >
                        <div className={`obsidian-island group relative h-full w-full ${isSelected ? "ring-2 ring-cyan-300/35" : ""}`}>
                          <div className="obsidian-island-base" style={{ boxShadow: `0 18px 50px ${district.color}26` }} />
                          <div className="obsidian-island-top" style={{ background: `radial-gradient(circle at 50% 35%, ${district.color}33, rgba(14,19,36,0.95) 55%, rgba(10,14,26,0.98) 100%)` }}>
                            <div className="obsidian-waterfall" style={{ background: `linear-gradient(180deg, ${district.color}aa, transparent)` }} />
                            <div className="obsidian-core-glow" style={{ background: `radial-gradient(circle, ${district.color}aa, transparent 68%)` }} />
                            <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2 p-3 text-center">
                              <div className="rounded-full border border-white/15 bg-black/20 p-2 backdrop-blur-sm">
                                <Icon className="h-5 w-5 md:h-6 md:w-6" style={{ color: district.color }} />
                              </div>
                              <div className="max-w-[90%] text-[11px] font-semibold uppercase tracking-[0.18em] text-white md:text-[13px] md:tracking-[0.22em]">
                                {district.name}
                              </div>
                              <div className="text-[9px] uppercase tracking-[0.16em] text-cyan-100/70 md:text-[10px]">
                                {district.level}
                              </div>
                            </div>
                          </div>

                          <div className={`obsidian-label ${labelPlacement(district.labelPosition)}`}>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100 md:text-[12px]">{district.name}</div>
                            <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-zinc-400">{district.level}</div>
                            <div className="mt-1 text-[10px] text-zinc-300 md:text-[11px]">{district.subtitle}</div>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:hidden">
              {districts.map((district) => {
                const Icon = district.icon
                const active = selectedDistrict.id === district.id
                return (
                  <button
                    key={district.id}
                    onClick={() => setSelectedDistrictId(district.id)}
                    className={`rounded-2xl border p-4 text-left transition ${active ? "border-cyan-300/35 bg-cyan-500/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="rounded-xl border border-white/10 bg-black/20 p-2">
                        <Icon className="h-4 w-4" style={{ color: district.color }} />
                      </div>
                      <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${statusTone(district.status)}`}>
                        {statusMeta[district.status]}
                      </span>
                    </div>
                    <div className="mt-3 text-sm font-semibold text-white">{district.name}</div>
                    <div className="mt-1 text-xs text-zinc-400">{district.subtitle}</div>
                    <div className="mt-2 text-xs text-cyan-100/70">{district.metric}</div>
                  </button>
                )
              })}
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <div className="obsidian-hud-card">
                <div className="obsidian-hud-title">Surface goals</div>
                <div className="mt-3 space-y-2">
                  {objectives.map((objective) => (
                    <div key={objective} className="flex items-start gap-2 text-sm text-zinc-200">
                      <span className="mt-1 h-2 w-2 rounded-full bg-cyan-300" />
                      <span>{objective}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="obsidian-hud-card">
                <div className="obsidian-hud-title">Interface mode</div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {resources.map(([label, value]) => (
                    <div key={label}>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/55">{label}</div>
                      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="obsidian-hud-card">
                <div className="obsidian-hud-title">Global state</div>
                <div className="mt-3 space-y-2">
                  {events.map(([label, timer]) => (
                    <div key={label} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-zinc-200">{label}</span>
                      <span className="font-mono text-cyan-100/70">{timer}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-[28px] border border-fuchsia-400/15 bg-[#08101d]/80 p-4 shadow-[0_0_30px_rgba(168,85,247,0.08)] backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <TrendingUp className="h-4 w-4 text-cyan-300" />
              Selected district
            </div>

            <h3 className="mt-3 text-xl font-semibold text-white">{selectedDistrict.name}</h3>
            <p className="mt-1 text-sm text-zinc-400">{selectedDistrict.subtitle}</p>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">Owner</div>
                  <div className="mt-1 text-sm font-medium text-white">{selectedDistrict.owner}</div>
                </div>
                <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${statusTone(selectedDistrict.status)}`}>
                  {statusMeta[selectedDistrict.status]}
                </span>
              </div>

              <div className="mt-4 text-[10px] uppercase tracking-[0.16em] text-zinc-500">Primary metric</div>
              <div className="mt-1 text-sm font-medium text-white">{selectedDistrict.metric}</div>
              <p className="mt-4 text-sm text-zinc-300">{selectedDistrict.detail}</p>

              {selectedDistrict.tab && (
                <button
                  onClick={() => onEnterDistrict?.(selectedDistrict.tab as string)}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/15"
                >
                  Open business panel
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="mt-4 space-y-2">
              {(selectedAgents.length ? selectedAgents : agents.slice(0, 2)).map((agent) => (
                <div key={agent.name} className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: agent.color }} />
                    <span className="font-medium text-white">{agent.name}</span>
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">{agent.role}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
