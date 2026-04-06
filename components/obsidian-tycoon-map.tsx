"use client"

import { motion } from "framer-motion"
import { AlertTriangle, ArrowRight, BookOpen, Bot, Briefcase, Building2, Coins, Cpu, FlaskConical, Gem, Lightbulb, Rocket, ShieldCheck, Sparkles, TrendingUp, Zap } from "lucide-react"

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
  size: "hub" | "large" | "medium"
  color: string
  metric: string
  detail: string
  icon: React.ElementType
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
    subtitle: "Plan • Direct • Scale",
    owner: "Kal",
    status: "thriving",
    x: "50%",
    y: "50%",
    size: "hub",
    color: "#14F1FF",
    metric: "10 agents online",
    detail: "Empire brain routing tasks, decisions, and active automations.",
    icon: Sparkles,
  },
  {
    id: "redfox-crm",
    tab: "redfox",
    name: "RedFox CRM",
    subtitle: "SaaS Citadel",
    owner: "Iris",
    status: "building",
    x: "48%",
    y: "17%",
    size: "large",
    color: "#FF5A5F",
    metric: "3 features queued",
    detail: "Pipeline maps, onboarding, billing, and launch readiness.",
    icon: Briefcase,
  },
  {
    id: "lone-star",
    tab: "lone-star",
    name: "Lone Star Lighting",
    subtitle: "Field Ops Ridge",
    owner: "Marshal",
    status: "thriving",
    x: "72%",
    y: "26%",
    size: "large",
    color: "#F59E0B",
    metric: "$20,021 booked",
    detail: "Quotes, installs, HOA outreach, crews, and seasonal cashflow.",
    icon: Lightbulb,
  },
  {
    id: "heroes",
    tab: "heroes",
    name: "Heroes of the Meta",
    subtitle: "Marketplace Forge",
    owner: "Scarlett",
    status: "watch",
    x: "74%",
    y: "72%",
    size: "large",
    color: "#10B981",
    metric: "12 listings pending",
    detail: "Inventory, sellers, orders, artist ops, and payout rails.",
    icon: Gem,
  },
  {
    id: "from-inception",
    tab: "from-inception",
    name: "From Inception",
    subtitle: "Studio District",
    owner: "Maverick",
    status: "building",
    x: "27%",
    y: "24%",
    size: "medium",
    color: "#8B5CF6",
    metric: "5 prospects warming",
    detail: "Rapid builds, proposals, retainers, templates, and launches.",
    icon: Rocket,
  },
  {
    id: "openclaw-core",
    tab: "systems",
    name: "OpenClaw Core",
    subtitle: "The Core",
    owner: "Kal",
    status: "thriving",
    x: "49%",
    y: "82%",
    size: "large",
    color: "#14F1FF",
    metric: "Automation 74%",
    detail: "Heartbeat, memory, agent routing, prompt library, and logs.",
    icon: Cpu,
  },
  {
    id: "archives",
    name: "The Archives",
    subtitle: "Knowledge Vault",
    owner: "Sierra",
    status: "thriving",
    x: "24%",
    y: "72%",
    size: "medium",
    color: "#22D3EE",
    metric: "118 docs indexed",
    detail: "Memory crystals, SOPs, research notes, and decision support.",
    icon: BookOpen,
  },
  {
    id: "research-lab",
    name: "Research Lab",
    subtitle: "Experimentarium",
    owner: "Otis",
    status: "building",
    x: "10%",
    y: "50%",
    size: "medium",
    color: "#34D399",
    metric: "4 tests running",
    detail: "Model experiments, API tests, feature validation, and prototypes.",
    icon: FlaskConical,
  },
  {
    id: "operations-deck",
    tab: "revenue-command",
    name: "Operations Deck",
    subtitle: "Execution Layer",
    owner: "Otto",
    status: "watch",
    x: "89%",
    y: "50%",
    size: "medium",
    color: "#60A5FA",
    metric: "26 jobs queued",
    detail: "Workflow engine, recurring jobs, and system glue.",
    icon: Zap,
  },
  {
    id: "finance-tower",
    tab: "analytics",
    name: "Finance Tower",
    subtitle: "Treasury Spire",
    owner: "Pax",
    status: "watch",
    x: "82%",
    y: "10%",
    size: "medium",
    color: "#EAB308",
    metric: "$18K pipeline",
    detail: "Cashflow, runway, AR, unit economics, and treasury vision.",
    icon: Coins,
  },
  {
    id: "agent-quarters",
    tab: "agents",
    name: "Agent Quarters",
    subtitle: "Guild Hall",
    owner: "Kal",
    status: "thriving",
    x: "16%",
    y: "14%",
    size: "medium",
    color: "#C084FC",
    metric: "2 idle slots",
    detail: "Roster, specialization, readiness, and deployment staging.",
    icon: Bot,
  },
]

const agents: Agent[] = [
  { name: "Kal", role: "Supreme Orchestrator", district: "Mission Control", color: "#14F1FF" },
  { name: "Otis", role: "DevOps Director", district: "Research Lab", color: "#34D399" },
  { name: "Marshal", role: "Sales Director", district: "Lone Star Lighting", color: "#F59E0B" },
  { name: "Iris", role: "RedFox Director", district: "RedFox CRM", color: "#FF5A5F" },
  { name: "Scarlett", role: "Marketplace Director", district: "Heroes of the Meta", color: "#10B981" },
  { name: "Sierra", role: "Research Director", district: "The Archives", color: "#22D3EE" },
  { name: "Scout", role: "Outreach Operator", district: "Operations Deck", color: "#60A5FA" },
  { name: "Maverick", role: "Design Director", district: "From Inception", color: "#8B5CF6" },
  { name: "Barnes", role: "Backend Operator", district: "Research Lab", color: "#06B6D4" },
  { name: "Ruby", role: "Content Operator", district: "From Inception", color: "#EC4899" },
  { name: "Pax", role: "Analytics Operator", district: "Finance Tower", color: "#EAB308" },
  { name: "Otto", role: "Automation Operator", district: "Operations Deck", color: "#3B82F6" },
]

const resources = [
  { label: "Capital", value: "$20,021", icon: Coins },
  { label: "Influence", value: "87", icon: TrendingUp },
  { label: "Automation", value: "74%", icon: Cpu },
  { label: "Knowledge", value: "118", icon: BookOpen },
  { label: "Momentum", value: "High", icon: Zap },
]

const objectives = [
  "Launch RedFox MVP lane",
  "Increase Lone Star booked revenue",
  "Expand From Inception retainers",
  "Grow Heroes GMV",
]

const events = [
  "Lead surge detected in Lone Star Grid",
  "Finance Tower flagged one follow-up risk",
  "OpenClaw Core heartbeat stable",
  "Research Lab testing new workflow chain",
]

const bridgePairs = [
  ["mission-control", "redfox-crm"],
  ["mission-control", "lone-star"],
  ["mission-control", "heroes"],
  ["mission-control", "from-inception"],
  ["mission-control", "openclaw-core"],
  ["mission-control", "archives"],
  ["mission-control", "research-lab"],
  ["mission-control", "operations-deck"],
  ["mission-control", "finance-tower"],
  ["mission-control", "agent-quarters"],
  ["openclaw-core", "operations-deck"],
  ["archives", "research-lab"],
  ["finance-tower", "redfox-crm"],
  ["finance-tower", "heroes"],
] as const

const statusMeta: Record<DistrictStatus, { label: string; className: string }> = {
  thriving: { label: "Thriving", className: "text-emerald-300 border-emerald-400/30 bg-emerald-500/15" },
  building: { label: "Building", className: "text-sky-300 border-sky-400/30 bg-sky-500/15" },
  watch: { label: "Watch", className: "text-amber-300 border-amber-400/30 bg-amber-500/15" },
  critical: { label: "Critical", className: "text-rose-300 border-rose-400/30 bg-rose-500/15" },
}

function getDistrict(id: string) {
  return districts.find((district) => district.id === id)
}

function districtSizeClasses(size: District["size"]) {
  if (size === "hub") return "h-44 w-44 md:h-52 md:w-52"
  if (size === "large") return "h-32 w-32 md:h-36 md:w-36"
  return "h-28 w-28 md:h-32 md:w-32"
}

function bridgeStyle(from: District, to: District) {
  const dx = parseFloat(to.x) - parseFloat(from.x)
  const dy = parseFloat(to.y) - parseFloat(from.y)
  const length = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)

  return {
    left: from.x,
    top: from.y,
    width: `${length}%`,
    transform: `translateY(-50%) rotate(${angle}deg)`,
    transformOrigin: "0 50%",
  }
}

export function ObsidianTycoonMap({ onEnterDistrict }: ObsidianTycoonMapProps) {
  const selectedDistrict = districts.find((district) => district.id !== "mission-control" && district.status === "thriving") ?? districts[1]

  return (
    <section className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="rounded-[28px] border border-cyan-400/15 bg-[#08101d]/80 p-4 shadow-[0_0_30px_rgba(20,241,255,0.08)] backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-100/45">Agent roster</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Guild network</h3>
            </div>
            <ShieldCheck className="h-5 w-5 text-cyan-300" />
          </div>

          <div className="space-y-2">
            {agents.map((agent) => (
              <div key={agent.name} className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: agent.color, boxShadow: `0 0 14px ${agent.color}` }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-white">{agent.name}</div>
                    <div className="truncate text-[11px] text-zinc-400">{agent.role}</div>
                  </div>
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.22em] text-zinc-500">{agent.district}</div>
              </div>
            ))}
          </div>
        </aside>

        <div className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_28%),radial-gradient(circle_at_bottom,rgba(20,241,255,0.14),transparent_30%),linear-gradient(180deg,#0b1020,#120a24)] p-4 shadow-[0_0_80px_rgba(0,0,0,0.35)]">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-cyan-100/70">
                <Building2 className="h-3.5 w-3.5" />
                Obsidian Mission Control
              </div>
              <h2 className="mt-3 text-2xl font-bold uppercase tracking-[0.2em] text-white" style={{ fontFamily: "var(--font-orbitron), monospace" }}>
                Floating empire map
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-cyan-50/70">
                A living headquarters map with district islands, bridge energy, named agents, and room-level drilldown into the real business tabs.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              {resources.map((resource) => {
                const Icon = resource.icon
                return (
                  <div key={resource.label} className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2.5">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-zinc-400">
                      <Icon className="h-3.5 w-3.5 text-cyan-300" />
                      {resource.label}
                    </div>
                    <div className="mt-2 text-lg font-semibold text-white">{resource.value}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="obsidian-map-shell relative overflow-hidden rounded-[30px] border border-white/10 bg-[#070b17]/75 p-3">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(20,241,255,0.12),transparent_18%),radial-gradient(circle_at_20%_20%,rgba(168,85,247,0.14),transparent_18%),radial-gradient(circle_at_80%_80%,rgba(34,197,94,0.12),transparent_18%)]" />
            <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:36px_36px]" />

            <div className="relative h-[720px] w-full overflow-hidden rounded-[26px]">
              {bridgePairs.map(([fromId, toId]) => {
                const from = getDistrict(fromId)
                const to = getDistrict(toId)
                if (!from || !to) return null
                const style = bridgeStyle(from, to)
                return (
                  <div key={`${fromId}-${toId}`} className="obsidian-bridge" style={style}>
                    <span className="obsidian-bridge-flow" />
                  </div>
                )
              })}

              {districts.map((district, index) => {
                const Icon = district.icon
                const status = statusMeta[district.status]
                return (
                  <motion.button
                    key={district.id}
                    initial={{ opacity: 0, scale: 0.9, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.35 }}
                    onClick={() => district.tab && onEnterDistrict?.(district.tab)}
                    className={`group absolute -translate-x-1/2 -translate-y-1/2 ${districtSizeClasses(district.size)}`}
                    style={{ left: district.x, top: district.y }}
                  >
                    <div className="obsidian-island h-full w-full rounded-[32px] border border-white/12 bg-[#0c1325]/88 p-3 text-left shadow-[0_0_30px_rgba(0,0,0,0.35)]">
                      <div className="absolute inset-0 rounded-[32px] opacity-80" style={{ background: `radial-gradient(circle at 50% 0%, ${district.color}22, transparent 55%), linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))` }} />
                      <div className="relative flex h-full flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-2">
                            <Icon className="h-5 w-5" style={{ color: district.color }} />
                          </div>
                          <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.22em] ${status.className}`}>
                            {status.label}
                          </span>
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-white md:text-base">{district.name}</div>
                          <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-400 md:text-[11px]">{district.subtitle}</div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-[11px] text-zinc-300">{district.metric}</div>
                          <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Owner {district.owner}</div>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>

        <aside className="rounded-[28px] border border-fuchsia-400/15 bg-[#08101d]/80 p-4 shadow-[0_0_30px_rgba(168,85,247,0.08)] backdrop-blur-xl">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-100/45">District detail</p>
              <h3 className="mt-1 text-lg font-semibold text-white">{selectedDistrict.name}</h3>
              <p className="mt-1 text-sm text-zinc-400">{selectedDistrict.subtitle}</p>
            </div>
            <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] ${statusMeta[selectedDistrict.status].className}`}>
              {statusMeta[selectedDistrict.status].label}
            </span>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">District owner</div>
            <div className="mt-1 text-xl font-semibold text-white">{selectedDistrict.owner}</div>
            <p className="mt-3 text-sm text-zinc-300">{selectedDistrict.detail}</p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {[
              ["Primary metric", selectedDistrict.metric],
              ["Health", statusMeta[selectedDistrict.status].label],
              ["Power lane", selectedDistrict.name === "Lone Star Lighting" ? "Revenue" : "Build"],
              ["Empire effect", "Feeds the central hub"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
                <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">{label}</div>
                <div className="mt-1 text-sm font-medium text-white">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
              <AlertTriangle className="h-4 w-4 text-amber-300" />
              Actions
            </div>
            <div className="space-y-2">
              {[
                "Open district control panel",
                "Assign additional agent",
                "Inspect active work queue",
                "Review upgrade path",
              ].map((action) => (
                <button key={action} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left text-sm text-zinc-200 transition hover:bg-white/[0.06]">
                  {action}
                  <ArrowRight className="h-4 w-4 text-zinc-500" />
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_300px]">
        <div className="rounded-[28px] border border-white/10 bg-[#08101d]/80 p-4 backdrop-blur-xl">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
            <TrendingUp className="h-4 w-4 text-cyan-300" />
            Global objectives
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {objectives.map((objective, index) => (
              <div key={objective} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Objective {index + 1}</div>
                <div className="mt-1 text-sm text-white">{objective}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#08101d]/80 p-4 backdrop-blur-xl">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
            <Zap className="h-4 w-4 text-amber-300" />
            Event log
          </div>
          <div className="space-y-2">
            {events.map((event) => (
              <div key={event} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-200">
                {event}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#08101d]/80 p-4 backdrop-blur-xl">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
            <BookOpen className="h-4 w-4 text-emerald-300" />
            Empire pulse
          </div>
          <div className="space-y-3">
            {[
              ["Booked revenue", "$20,021"],
              ["Tasks completed", "142"],
              ["Active automations", "26"],
              ["Districts healthy", "8 / 10"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">{label}</div>
                <div className="mt-1 text-lg font-semibold text-white">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
