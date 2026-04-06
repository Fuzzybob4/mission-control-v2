"use client"

import { Building2, CircleDollarSign, Cpu, MonitorSmartphone, Sparkles, Zap } from "lucide-react"

interface TycoonHQProps {
  onEnterRoom?: (tab: string) => void
}

type RoomStatus = "thriving" | "building" | "idle"
type AgentState = "routing leads" | "shipping systems" | "watching inventory" | "closing pipeline" | "drafting campaigns" | "syncing ops"

interface AgentUnit {
  name: string
  role: string
  state: AgentState
  x: string
  y: string
  hue: string
}

interface Room {
  id: string
  tab: string
  name: string
  subtitle: string
  revenue: string
  pipeline: string
  status: RoomStatus
  glow: string
  border: string
  accent: string
  agents: AgentUnit[]
}

const rooms: Room[] = [
  {
    id: "executive-core",
    tab: "revenue-command",
    name: "Executive Core",
    subtitle: "War room, capital flow, and priority routing",
    revenue: "$20,021",
    pipeline: "$18K live",
    status: "thriving",
    glow: "from-cyan-500/30 via-sky-500/10 to-transparent",
    border: "border-cyan-400/40",
    accent: "text-cyan-300",
    agents: [
      { name: "Kal", role: "Commander", state: "syncing ops", x: "58%", y: "26%", hue: "#00e5ff" },
      { name: "Ledger", role: "Finance AI", state: "closing pipeline", x: "30%", y: "54%", hue: "#ffd166" },
    ],
  },
  {
    id: "lone-star-room",
    tab: "lone-star",
    name: "Lone Star Grid",
    subtitle: "Sales floor for installs, referrals, and follow-up",
    revenue: "$20,021",
    pipeline: "12 active leads",
    status: "thriving",
    glow: "from-amber-500/30 via-orange-500/10 to-transparent",
    border: "border-amber-400/40",
    accent: "text-amber-300",
    agents: [
      { name: "Ruby", role: "Outreach Scout", state: "routing leads", x: "24%", y: "62%", hue: "#f59e0b" },
      { name: "Volt", role: "Field Ops", state: "closing pipeline", x: "68%", y: "36%", hue: "#fbbf24" },
      { name: "Halo", role: "Follow-up", state: "drafting campaigns", x: "74%", y: "72%", hue: "#f97316" },
    ],
  },
  {
    id: "redfox-lab",
    tab: "redfox",
    name: "RedFox Lab",
    subtitle: "Product forge for CRM systems and automation",
    revenue: "$0",
    pipeline: "3 features queued",
    status: "building",
    glow: "from-blue-500/30 via-indigo-500/10 to-transparent",
    border: "border-blue-400/40",
    accent: "text-blue-300",
    agents: [
      { name: "Patch", role: "Builder", state: "shipping systems", x: "34%", y: "46%", hue: "#60a5fa" },
      { name: "Mux", role: "Automation", state: "syncing ops", x: "66%", y: "66%", hue: "#818cf8" },
    ],
  },
  {
    id: "from-inception-studio",
    tab: "from-inception",
    name: "Inception Studio",
    subtitle: "Design bay for sites, funnels, and client launch work",
    revenue: "$0",
    pipeline: "5 prospects watching",
    status: "building",
    glow: "from-fuchsia-500/30 via-cyan-500/10 to-transparent",
    border: "border-fuchsia-400/40",
    accent: "text-fuchsia-300",
    agents: [
      { name: "Echo", role: "Creative", state: "drafting campaigns", x: "28%", y: "30%", hue: "#e879f9" },
      { name: "Frame", role: "UI Engineer", state: "shipping systems", x: "62%", y: "58%", hue: "#22d3ee" },
    ],
  },
  {
    id: "heroes-arcade",
    tab: "heroes",
    name: "Heroes Arcade",
    subtitle: "Inventory vault and secondary revenue lane",
    revenue: "$0",
    pipeline: "12 cards pending",
    status: "idle",
    glow: "from-violet-500/30 via-purple-500/10 to-transparent",
    border: "border-violet-400/40",
    accent: "text-violet-300",
    agents: [
      { name: "Stack", role: "Inventory", state: "watching inventory", x: "48%", y: "44%", hue: "#a78bfa" },
    ],
  },
]

const statusStyles: Record<RoomStatus, { label: string; chip: string }> = {
  thriving: { label: "Thriving", chip: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30" },
  building: { label: "Building", chip: "bg-sky-500/15 text-sky-300 border-sky-400/30" },
  idle: { label: "Idle", chip: "bg-zinc-500/15 text-zinc-300 border-zinc-400/30" },
}

export function TycoonHQ({ onEnterRoom }: TycoonHQProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-cyan-400/20 bg-[#070b17]/85 p-5 shadow-[0_0_60px_rgba(0,229,255,0.08)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,229,255,0.12),transparent_35%),linear-gradient(135deg,rgba(6,10,22,0.95),rgba(11,16,31,0.88))]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(0,229,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative z-10 space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.3em] text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" />
              Tycoon Overlay
            </div>
            <h2 className="mt-3 text-2xl font-bold uppercase tracking-[0.2em] text-cyan-100" style={{ fontFamily: "var(--font-orbitron), monospace" }}>
              Mission Control City
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-cyan-50/70">
              Each room is a live business lane. Agents move where the pressure is, and the board shows which empire chamber needs power next.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { icon: Building2, label: "Rooms", value: "5" },
              { icon: Cpu, label: "Agents", value: "10" },
              { icon: CircleDollarSign, label: "Live Revenue", value: "$20K" },
              { icon: MonitorSmartphone, label: "Automation", value: "74%" },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-cyan-100/50">
                    <Icon className="h-3.5 w-3.5 text-cyan-300" />
                    {stat.label}
                  </div>
                  <div className="mt-2 text-xl font-semibold text-white">{stat.value}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <div className="tycoon-scanlines rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-100/45">City map</p>
                <p className="mt-1 text-sm text-zinc-300">Rooms pulse brighter as business pressure climbs.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-emerald-300">
                <Zap className="h-3.5 w-3.5" />
                Grid stable
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {rooms.map((room) => {
                const status = statusStyles[room.status]
                return (
                  <button
                    key={room.id}
                    onClick={() => onEnterRoom?.(room.tab)}
                    className={`group relative overflow-hidden rounded-[24px] border ${room.border} bg-[#091120]/90 p-4 text-left transition duration-200 hover:-translate-y-1 hover:shadow-[0_0_35px_rgba(0,229,255,0.16)]`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${room.glow} opacity-70`} />
                    <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:18px_18px]" />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-white">{room.name}</p>
                          <p className="mt-1 text-xs text-zinc-300/75">{room.subtitle}</p>
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.25em] ${status.chip}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                          <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">Revenue</div>
                          <div className={`mt-1 font-semibold ${room.accent}`}>{room.revenue}</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                          <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">Pressure</div>
                          <div className="mt-1 font-semibold text-white">{room.pipeline}</div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-[20px] border border-white/10 bg-black/30 p-3">
                        <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-zinc-400">
                          <span>Agent floor</span>
                          <span>{room.agents.length} online</span>
                        </div>
                        <div className="relative h-28 rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_60%)]">
                          {room.agents.map((agent) => (
                            <div
                              key={agent.name}
                              className="absolute -translate-x-1/2 -translate-y-1/2"
                              style={{ left: agent.x, top: agent.y }}
                            >
                              <div className="tycoon-agent">
                                <span className="tycoon-agent-core" style={{ backgroundColor: agent.hue, boxShadow: `0 0 16px ${agent.hue}` }} />
                              </div>
                              <div className="mt-2 min-w-[88px] -translate-x-1/3 rounded-xl border border-white/10 bg-[#08101d]/90 px-2 py-1 shadow-lg backdrop-blur-sm">
                                <p className="text-[11px] font-medium text-white">{agent.name}</p>
                                <p className="text-[10px] text-zinc-400">{agent.role}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-fuchsia-400/20 bg-fuchsia-500/5 p-4">
              <div className="text-xs uppercase tracking-[0.25em] text-fuchsia-200/60">Upgrade queue</div>
              <div className="mt-3 space-y-3">
                {[
                  ["Agent pathfinding", "Make agents move room-to-room off real cron and task state"],
                  ["Room economy", "Tie upgrades to live revenue, leads, and shipping velocity"],
                  ["Neon city map", "Add district view with zoomed headquarters transitions"],
                ].map(([title, desc]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <p className="text-sm font-medium text-white">{title}</p>
                    <p className="mt-1 text-xs text-zinc-400">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-cyan-400/20 bg-cyan-500/5 p-4">
              <div className="text-xs uppercase tracking-[0.25em] text-cyan-100/60">Control notes</div>
              <div className="mt-3 space-y-3 text-sm text-zinc-300">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  Lone Star is the profit engine, so its room burns hottest and carries the most active agents.
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  RedFox and From Inception are shown as build lanes, ideal for future unlocks and sprint views.
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  Click any room to dive into its existing business dashboard.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
