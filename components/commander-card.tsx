"use client"

export function CommanderCard() {
  const xpCurrent = 12450
  const xpTotal = 20000
  const xpPercent = Math.round((xpCurrent / xpTotal) * 100)

  return (
    <div className="commander-card relative overflow-hidden rounded-[28px] p-5 mb-6 group" data-component="commander-card">
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay pointer-events-none opacity-20" />

      {/* Animated border glow */}
      <div
        className="absolute inset-0 rounded-[28px] pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{ boxShadow: "inset 0 0 30px rgba(0, 229, 255, 0.15)" }}
      />

      <div className="relative flex items-start gap-5">
        {/* Avatar / rank icon */}
        <div
          className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
          style={{
            background: "rgba(0, 229, 255, 0.08)",
            border: "1px solid rgba(0, 229, 255, 0.3)",
            boxShadow: "0 0 20px rgba(0, 229, 255, 0.2)",
          }}
        >
          🔮
        </div>

        <div className="flex-1 min-w-0">
          {/* Name */}
          <h2
            className="text-2xl font-bold tracking-widest uppercase"
            style={{
              fontFamily: "var(--font-orbitron), monospace",
              color: "#00e5ff",
              textShadow: "0 0 20px rgba(0, 229, 255, 0.5)",
            }}
          >
            KAL OBSIDIAN
          </h2>

          {/* Title */}
          <p
            className="text-xs tracking-[0.3em] uppercase mt-0.5"
            style={{ color: "rgba(0, 229, 255, 0.6)", fontFamily: "monospace" }}
          >
            TYCOON COMMANDER
          </p>

          <p className="mt-2 max-w-2xl text-sm text-cyan-50/65">
            The empire layer is online. Floating districts now represent business lanes, support towers, and agent guilds inside Obsidian Mission Control.
          </p>

          {/* Level badge */}
          <div className="flex items-center gap-3 mt-3">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase"
              style={{
                background: "rgba(255, 215, 0, 0.1)",
                border: "1px solid rgba(255, 215, 0, 0.4)",
                color: "#ffd700",
                textShadow: "0 0 8px rgba(255, 215, 0, 0.4)",
              }}
            >
              ⚔️ LV.7 COMMANDER
            </span>
          </div>

          {/* XP Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] tracking-widest uppercase font-mono" style={{ color: "rgba(0, 229, 255, 0.5)" }}>
                Experience Points
              </span>
              <span className="text-xs font-mono font-bold" style={{ color: "#00e5ff" }}>
                {xpCurrent.toLocaleString()} <span style={{ color: "rgba(0,229,255,0.4)" }}>/ {xpTotal.toLocaleString()} XP</span>
              </span>
            </div>
            <div
              className="relative h-2 rounded-full overflow-hidden"
              style={{ background: "rgba(0, 229, 255, 0.1)", border: "1px solid rgba(0, 229, 255, 0.2)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${xpPercent}%`,
                  background: "linear-gradient(90deg, #00b4cc, #00e5ff)",
                  boxShadow: "0 0 10px rgba(0, 229, 255, 0.6)",
                }}
              />
            </div>
            <p className="text-[10px] mt-1 font-mono" style={{ color: "rgba(0,229,255,0.4)" }}>
              {xpPercent}% to Level 8, {(xpTotal - xpCurrent).toLocaleString()} XP until the next expansion
            </p>
          </div>
        </div>

        {/* Right stat cluster */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2 text-right">
          <div>
            <div className="text-[10px] tracking-widest uppercase font-mono" style={{ color: "rgba(255, 0, 110, 0.6)" }}>
              Streak
            </div>
            <div className="text-xl font-bold font-mono" style={{ color: "#ff006e", textShadow: "0 0 12px rgba(255,0,110,0.4)" }}>
              14d
            </div>
          </div>
          <div>
            <div className="text-[10px] tracking-widest uppercase font-mono" style={{ color: "rgba(255, 215, 0, 0.6)" }}>
              Rank
            </div>
            <div className="text-xl font-bold font-mono" style={{ color: "#ffd700", textShadow: "0 0 12px rgba(255,215,0,0.4)" }}>
              #1
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
