"use client"

interface Mission {
  title: string
  detail: string
  status: "now" | "watch" | "build"
}

const MISSIONS: Mission[] = [
  {
    title: "Protect the cash engine",
    detail: "Keep Lone Star collections, overdue invoices, and send queues visible.",
    status: "now",
  },
  {
    title: "Turn outreach into throughput",
    detail: "Make draft, approval, sent, and reply status obvious instead of buried.",
    status: "now",
  },
  {
    title: "Launch RedFox cleanly",
    detail: "Keep product, onboarding, and pricing moves visible without noise.",
    status: "build",
  },
  {
    title: "Keep the magic, lose the clutter",
    detail: "Atmosphere stays. Friction, fake game stats, and visual overload go away.",
    status: "watch",
  },
]

function tone(status: Mission["status"]) {
  switch (status) {
    case "now":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
    case "build":
      return "border-sky-400/20 bg-sky-400/10 text-sky-200"
    default:
      return "border-amber-400/20 bg-amber-400/10 text-amber-200"
  }
}

export function ActiveMissions() {
  return (
    <div className="mb-6" data-component="active-missions">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: "rgba(0, 229, 255, 0.7)", fontFamily: "monospace" }}>
          Active Focus
        </h2>
        <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(0,229,255,0.3), transparent)" }} />
        <span
          className="rounded px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest"
          style={{
            background: "rgba(0,229,255,0.08)",
            border: "1px solid rgba(0,229,255,0.2)",
            color: "rgba(0,229,255,0.5)",
          }}
        >
          4 priorities
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {MISSIONS.map((mission) => (
          <div key={mission.title} className="rounded-2xl border border-white/10 bg-[rgba(10,14,26,0.82)] p-4 backdrop-blur-sm">
            <div className={`inline-flex rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${tone(mission.status)}`}>
              {mission.status}
            </div>
            <h3 className="mt-3 text-sm font-semibold text-white">{mission.title}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{mission.detail}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
