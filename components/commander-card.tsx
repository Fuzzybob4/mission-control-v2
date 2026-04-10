"use client"

export function CommanderCard() {
  return (
    <div className="commander-card group relative mb-6 overflow-hidden rounded-[28px] p-5" data-component="commander-card">
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-20" />
      <div
        className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: "inset 0 0 30px rgba(0, 229, 255, 0.15)" }}
      />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start">
        <div
          className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl text-3xl"
          style={{
            background: "rgba(0, 229, 255, 0.08)",
            border: "1px solid rgba(0, 229, 255, 0.3)",
            boxShadow: "0 0 20px rgba(0, 229, 255, 0.2)",
          }}
        >
          🔮
        </div>

        <div className="min-w-0 flex-1">
          <h2
            className="text-2xl font-bold uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-orbitron), monospace",
              color: "#00e5ff",
              textShadow: "0 0 20px rgba(0, 229, 255, 0.5)",
            }}
          >
            KAL MISSION CONTROL
          </h2>

          <p className="mt-0.5 text-xs uppercase tracking-[0.3em]" style={{ color: "rgba(0, 229, 255, 0.6)", fontFamily: "monospace" }}>
            Business command surface
          </p>

          <p className="mt-3 max-w-3xl text-sm text-cyan-50/65">
            The mission is simpler now, see what matters fast, move on the next revenue or operations bottleneck, and keep the interface readable on mobile without killing the atmosphere.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Primary job", value: "Run the businesses" },
              { label: "Current focus", value: "Revenue + operations" },
              { label: "Design direction", value: "Cleaner, sharper, faster" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/55">{item.label}</div>
                <div className="mt-1 text-sm font-medium text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
