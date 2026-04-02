"use client"

interface Mission {
  icon: string
  title: string
  current: number
  total: number
  unit?: string
  xpReward: number
  prefix?: string
}

const MISSIONS: Mission[] = [
  {
    icon: "🎯",
    title: "Close 3 New Clients",
    current: 1,
    total: 3,
    xpReward: 750,
  },
  {
    icon: "💰",
    title: "Hit $5,000 MRR",
    current: 2800,
    total: 5000,
    xpReward: 1500,
    prefix: "$",
  },
  {
    icon: "📧",
    title: "Send 50 Outreach Emails",
    current: 23,
    total: 50,
    xpReward: 500,
  },
  {
    icon: "⭐",
    title: "Get 5-Star Reviews ×5",
    current: 2,
    total: 5,
    xpReward: 600,
  },
]

function formatValue(val: number, prefix?: string) {
  if (prefix === "$") return `$${val.toLocaleString()}`
  return val.toLocaleString()
}

function MissionCard({ mission }: { mission: Mission }) {
  const pct = Math.round((mission.current / mission.total) * 100)

  return (
    <div
      className="relative rounded-xl p-4 group transition-all duration-300 hover:translate-y-[-1px]"
      style={{
        background: "rgba(10, 14, 26, 0.8)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(0, 229, 255, 0.2)",
        boxShadow: "0 0 15px rgba(0, 229, 255, 0.05)",
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: "0 0 20px rgba(0, 229, 255, 0.1)" }}
      />

      {/* MISSION badge */}
      <div
        className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] tracking-widest uppercase font-bold mb-2"
        style={{
          background: "rgba(0, 229, 255, 0.1)",
          border: "1px solid rgba(0, 229, 255, 0.3)",
          color: "rgba(0, 229, 255, 0.7)",
          fontFamily: "monospace",
        }}
      >
        MISSION
      </div>

      <div className="flex items-start gap-3 relative">
        {/* Icon */}
        <span className="text-2xl leading-none mt-0.5">{mission.icon}</span>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3
            className="text-sm font-semibold tracking-wide mb-2 truncate"
            style={{ color: "rgba(255,255,255,0.9)", fontFamily: "monospace" }}
          >
            {mission.title}
          </h3>

          {/* Progress bar */}
          <div
            className="relative h-1.5 rounded-full overflow-hidden mb-1.5"
            style={{ background: "rgba(0, 255, 136, 0.1)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #00cc6a, #00ff88)",
                boxShadow: "0 0 8px rgba(0, 255, 136, 0.5)",
                transition: "width 1s ease",
              }}
            />
          </div>

          {/* Progress text */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.5)" }}>
              {formatValue(mission.current, mission.prefix)} / {formatValue(mission.total, mission.prefix)}{" "}
              <span style={{ color: "#00ff88" }}>({pct}%)</span>
            </span>
            <span
              className="text-[11px] font-bold font-mono"
              style={{ color: "#ffd700", textShadow: "0 0 6px rgba(255,215,0,0.4)" }}
            >
              +{mission.xpReward.toLocaleString()} XP
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ActiveMissions() {
  return (
    <div className="mb-6" data-component="active-missions">
      <div className="flex items-center gap-3 mb-3">
        <h2
          className="text-xs font-bold tracking-[0.3em] uppercase"
          style={{ color: "rgba(0, 229, 255, 0.7)", fontFamily: "monospace" }}
        >
          ⚡ Active Missions
        </h2>
        <div
          className="flex-1 h-px"
          style={{ background: "linear-gradient(90deg, rgba(0,229,255,0.3), transparent)" }}
        />
        <span
          className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded"
          style={{
            background: "rgba(0,229,255,0.08)",
            border: "1px solid rgba(0,229,255,0.2)",
            color: "rgba(0,229,255,0.5)",
          }}
        >
          4 active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {MISSIONS.map((m) => (
          <MissionCard key={m.title} mission={m} />
        ))}
      </div>
    </div>
  )
}
