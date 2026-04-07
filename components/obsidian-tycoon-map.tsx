"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, BookOpen, Bot, Briefcase, Coins, Cpu, FlaskConical, Gem, Lightbulb, Rocket, Sparkles, TrendingUp, Zap } from "lucide-react"

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
    subtitle: "Plan · Manage · Dominate",
    owner: "Kal",
    status: "thriving",
    x: "50%",
    y: "40%",
    size: "hub",
    color: "#2ee7ff",
    metric: "10 agents online",
    detail: "The central command dais routing businesses, agents, automations, and escalations.",
    level: "HQ",
    icon: Sparkles,
    labelPosition: "top",
  },
  {
    id: "agent-quarters",
    name: "Agent Quarters",
    subtitle: "Train, Upgrade, Rest",
    owner: "Kal",
    status: "thriving",
    x: "20%",
    y: "18%",
    size: "large",
    color: "#d27bff",
    metric: "2 idle slots",
    detail: "Guild hall for readiness, deployment, specialization, and leveling your crew.",
    level: "Level 3",
    icon: Bot,
    labelPosition: "left",
  },
  {
    id: "foundry",
    name: "The Foundry",
    subtitle: "Build, Craft, Create",
    owner: "Otis",
    status: "building",
    x: "50%",
    y: "12%",
    size: "medium",
    color: "#ff9f43",
    metric: "4 prototypes running",
    detail: "Ship features, forge systems, and test upgrades before they enter the grid.",
    level: "Level 4",
    icon: Cpu,
    labelPosition: "top-right",
  },
  {
    id: "market-district",
    name: "Market District",
    subtitle: "Trade · Invest · Profit",
    owner: "Scarlett",
    status: "watch",
    x: "79%",
    y: "18%",
    size: "large",
    color: "#ff66d9",
    metric: "12 listings pending",
    detail: "Commercial skyline for marketplaces, deal flow, and offer movement.",
    level: "Level 3",
    icon: Gem,
    labelPosition: "top-right",
  },
  {
    id: "research-lab",
    name: "Research Lab",
    subtitle: "Innovate the Future",
    owner: "Otis",
    status: "building",
    x: "11%",
    y: "44%",
    size: "medium",
    color: "#4dffb8",
    metric: "4 tests running",
    detail: "Experiments, API validation, model trials, and future-casting systems work.",
    level: "Level 3",
    icon: FlaskConical,
    labelPosition: "left",
  },
  {
    id: "finance-tower",
    name: "Finance Tower",
    subtitle: "Wealth Drives Power",
    owner: "Pax",
    status: "watch",
    x: "88%",
    y: "42%",
    size: "medium",
    color: "#ffd84d",
    metric: "$20,021 booked",
    detail: "Treasury, cashflow, revenue command, and the empire's economic pulse.",
    level: "Level 4",
    icon: Coins,
    labelPosition: "right",
  },
  {
    id: "archives",
    name: "The Archives",
    subtitle: "Knowledge is Power",
    owner: "Sierra",
    status: "thriving",
    x: "17%",
    y: "70%",
    size: "medium",
    color: "#53d9ff",
    metric: "118 docs indexed",
    detail: "Memory vault, SOPs, research notes, playbooks, and long-range strategy lore.",
    level: "Level 5",
    icon: BookOpen,
    labelPosition: "left",
  },
  {
    id: "command-bridge",
    name: "Command Bridge",
    subtitle: "Oversee Operations",
    owner: "Otto",
    status: "watch",
    x: "37%",
    y: "87%",
    size: "small",
    color: "#5bbcff",
    metric: "26 jobs queued",
    detail: "Execution rails, dispatching, and active task visibility.",
    level: "Level 4",
    icon: Briefcase,
    labelPosition: "bottom-left",
  },
  {
    id: "the-core",
    name: "The Core",
    subtitle: "Your Empire's Heart",
    owner: "Kal",
    status: "thriving",
    x: "55%",
    y: "83%",
    size: "small",
    color: "#8f7dff",
    metric: "Automation 74%",
    detail: "The crystal engine beneath the city, feeding power into every active district.",
    level: "Level 6",
    icon: Zap,
    labelPosition: "bottom-right",
  },
  {
    id: "operations-deck",
    name: "Operations Deck",
    subtitle: "Execute & Optimize",
    owner: "Otto",
    status: "watch",
    x: "82%",
    y: "68%",
    size: "medium",
    color: "#45d6ff",
    metric: "Workflows stable",
    detail: "Automation, reminders, glue systems, recurring jobs, and process tuning.",
    level: "Level 4",
    icon: Cpu,
    labelPosition: "right",
  },
  {
    id: "innovation-hub",
    name: "Innovation Hub",
    subtitle: "Shape Tomorrow",
    owner: "Maverick",
    status: "building",
    x: "80%",
    y: "88%",
    size: "small",
    color: "#4cc9ff",
    metric: "3 experiments staged",
    detail: "Concept lab for future products, offers, and weird profitable magic.",
    level: "Level 3",
    icon: Rocket,
    labelPosition: "bottom-right",
  },
  {
    id: "lone-star",
    tab: "lone-star",
    name: "Lone Star Lighting",
    subtitle: "Field Ops Ridge",
    owner: "Marshal",
    status: "thriving",
    x: "65%",
    y: "27%",
    size: "small",
    color: "#f59e0b",
    metric: "$20,021 booked",
    detail: "Sales, installs, HOA opportunities, crews, quotes, and the current revenue engine.",
    level: "Business",
    icon: Lightbulb,
    labelPosition: "top-left",
  },
  {
    id: "redfox-crm",
    tab: "redfox",
    name: "RedFox CRM",
    subtitle: "SaaS Citadel",
    owner: "Iris",
    status: "building",
    x: "59%",
    y: "55%",
    size: "small",
    color: "#ff5a5f",
    metric: "3 features queued",
    detail: "Product, onboarding, billing, roadmap, and launch pressure.",
    level: "Business",
    icon: Briefcase,
    labelPosition: "right",
  },
  {
    id: "from-inception",
    tab: "from-inception",
    name: "From Inception",
    subtitle: "Studio District",
    owner: "Maverick",
    status: "building",
    x: "44%",
    y: "58%",
    size: "small",
    color: "#9c6bff",
    metric: "5 prospects warming",
    detail: "Rapid builds, proposals, retainers, and client delivery lanes.",
    level: "Business",
    icon: Rocket,
    labelPosition: "left",
  },
]

const agents: Agent[] = [
  { name: "Kal", role: "Supreme Orchestrator", district: "Mission Control", color: "#14F1FF" },
  { name: "Otis", role: "DevOps Director", district: "Research Lab", color: "#34D399" },
  { name: "Marshal", role: "Sales Director", district: "Lone Star Lighting", color: "#F59E0B" },
  { name: "Iris", role: "RedFox Director", district: "RedFox CRM", color: "#FF5A5F" },
  { name: "Scarlett", role: "Marketplace Director", district: "Market District", color: "#10B981" },
  { name: "Sierra", role: "Research Director", district: "The Archives", color: "#22D3EE" },
  { name: "Maverick", role: "Design Director", district: "From Inception", color: "#8B5CF6" },
  { name: "Pax", role: "Analytics Operator", district: "Finance Tower", color: "#EAB308" },
  { name: "Otto", role: "Automation Operator", district: "Operations Deck", color: "#3B82F6" },
]

const resources = [
  ["Agents", "24/50"],
  ["Funds", "$98.4M"],
  ["Influence", "72,540"],
  ["Projects", "8 Active"],
]

const objectives = [
  "Expand your influence",
  "Complete special projects",
  "Dominate the market",
]

const events = [
  ["Double Research Speed", "13:47:22"],
  ["Market Shift", "05:21:10"],
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

export function ObsidianTycoonMap({ onEnterDistrict }: ObsidianTycoonMapProps) {
  const [selectedDistrictId, setSelectedDistrictId] = useState("mission-control")

  const selectedDistrict = useMemo(
    () => districts.find((district) => district.id === selectedDistrictId) ?? districts[0],
    [selectedDistrictId]
  )

  const selectedAgents = agents.filter((agent) => agent.district === selectedDistrict.name)

  return (
    <section className="space-y-4">
      <div className="obsidian-stage relative overflow-hidden rounded-[34px] border border-cyan-400/15 p-3 md:p-6">
        <div className="relative z-10 rounded-[28px] overflow-hidden">
          <div className="relative h-[1220px] min-w-[1320px] scale-[0.44] origin-top-left sm:scale-[0.56] md:scale-[0.72] lg:scale-[0.88] xl:scale-100" style={{ width: "1320px" }}>
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
                  transition={{ delay: index * 0.03, duration: 0.28 }}
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

            <div className="absolute inset-x-0 bottom-0 z-20 px-3 pb-3 md:px-6 md:pb-6">
              <div className="grid gap-3 lg:grid-cols-[1.1fr_1fr_1fr_220px]">
                <div className="obsidian-hud-card">
                  <div className="obsidian-hud-title">Empire Stats</div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {resources.map(([label, value]) => (
                      <div key={label} className="border-r border-white/6 pr-2 last:border-r-0">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/55">{label}</div>
                        <div className="mt-1 text-lg font-semibold text-white">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="obsidian-hud-card">
                  <div className="obsidian-hud-title">Objectives</div>
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
                  <div className="obsidian-hud-title">Global Events</div>
                  <div className="mt-3 space-y-2">
                    {events.map(([label, timer]) => (
                      <div key={label} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-zinc-200">{label}</span>
                        <span className="font-mono text-cyan-100/70">{timer}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="obsidian-hud-card flex items-center justify-center">
                  <div className="obsidian-mini-map">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-10 mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-xs text-zinc-300 md:hidden">
          <span>Tap districts below to inspect them. The world view is scaled for mobile preview.</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_320px]">
        <div className="rounded-[28px] border border-white/10 bg-[#08101d]/75 p-4 backdrop-blur-xl">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
            <TrendingUp className="h-4 w-4 text-cyan-300" />
            District status board
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {districts.map((district) => (
              <button
                key={district.id}
                onClick={() => setSelectedDistrictId(district.id)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${selectedDistrict.id === district.id ? "border-cyan-300/35 bg-cyan-500/8" : "border-white/10 bg-black/20 hover:bg-white/[0.04]"}`}
              >
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">{district.level}</div>
                <div className="mt-1 text-sm font-semibold text-white">{district.name}</div>
                <div className="mt-1 text-xs text-zinc-400">{district.metric}</div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.16em] text-cyan-100/55">{statusMeta[district.status]}</div>
              </button>
            ))}
          </div>
        </div>

        <aside className="rounded-[28px] border border-fuchsia-400/15 bg-[#08101d]/80 p-4 shadow-[0_0_30px_rgba(168,85,247,0.08)] backdrop-blur-xl">
          <div className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-100/45">Selected district</div>
          <h3 className="mt-2 text-xl font-semibold text-white">{selectedDistrict.name}</h3>
          <p className="mt-1 text-sm text-zinc-400">{selectedDistrict.subtitle}</p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">Owner</div>
            <div className="mt-1 text-sm font-medium text-white">{selectedDistrict.owner}</div>
            <div className="mt-3 text-[10px] uppercase tracking-[0.16em] text-zinc-500">Primary metric</div>
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
    </section>
  )
}
