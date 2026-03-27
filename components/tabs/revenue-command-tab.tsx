"use client"

import { useMemo, useState } from "react"
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock3,
  Crosshair,
  Flame,
  MessageSquare,
  Phone,
  Rocket,
  Star,
  Target,
  TimerReset,
  Trophy,
} from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type ExecutionTask = {
  id: string
  title: string
  owner: string
  value: number
  time: string
  type: "call" | "text" | "proposal" | "follow-up"
  note: string
}

type OfferLane = {
  id: string
  name: string
  target: number
  committed: number
  odds: number | null
  nextMove: string
  color: string
}

const DAILY_TARGET = 300
const STRETCH_TARGET = 500
const BASE_REVENUE = 0
const LOCKED_REVENUE = 0
const PIPELINE_REVENUE = 0

const EXECUTION_TASKS: ExecutionTask[] = [
  {
    id: "task-1",
    title: "Text top warm lead",
    owner: "N/A",
    value: 0,
    time: "8:15 AM",
    type: "text",
    note: "No live pricing data yet — replace once pipeline records are wired.",
  },
  {
    id: "task-2",
    title: "Call warm leads",
    owner: "N/A",
    value: 0,
    time: "8:30 AM",
    type: "call",
    note: "No live lead values yet.",
  },
  {
    id: "task-3",
    title: "Send current proposal",
    owner: "N/A",
    value: 0,
    time: "9:40 AM",
    type: "proposal",
    note: "Awaiting live proposal/deal records.",
  },
  {
    id: "task-4",
    title: "Follow up yesterday's silent replies",
    owner: "N/A",
    value: 0,
    time: "10:15 AM",
    type: "follow-up",
    note: "Awaiting live outreach queue.",
  },
]

const OFFER_LANES: OfferLane[] = [
  {
    id: "lane-1",
    name: "Fast Cash Offers",
    target: 0,
    committed: 0,
    odds: null,
    nextMove: "N/A until live opportunity records are wired.",
    color: "from-emerald-500/30 to-emerald-400/5",
  },
  {
    id: "lane-2",
    name: "CRM Founding Seats",
    target: 0,
    committed: 0,
    odds: null,
    nextMove: "N/A until live opportunity records are wired.",
    color: "from-sky-500/30 to-sky-400/5",
  },
  {
    id: "lane-3",
    name: "Studio Retainers",
    target: 0,
    committed: 0,
    odds: null,
    nextMove: "N/A until live opportunity records are wired.",
    color: "from-violet-500/30 to-violet-400/5",
  },
]

const HOUR_BLOCKS = [
  { label: "8A", focus: "N/A", intensity: 0 },
  { label: "9A", focus: "N/A", intensity: 0 },
  { label: "10A", focus: "N/A", intensity: 0 },
  { label: "11A", focus: "N/A", intensity: 0 },
  { label: "12P", focus: "N/A", intensity: 0 },
]

const SCRIPT_LINES = [
  "No live script data yet.",
  "Wire live leads and opportunities to replace this placeholder.",
  "Use this space for proven close lines once data is flowing.",
]

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function typeIcon(type: ExecutionTask["type"]) {
  switch (type) {
    case "call":
      return Phone
    case "text":
      return MessageSquare
    case "proposal":
      return Rocket
    default:
      return TimerReset
  }
}

export function RevenueCommandTab() {
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([])

  const completedValue = useMemo(
    () => EXECUTION_TASKS.filter((task) => completedTaskIds.includes(task.id)).reduce((sum, task) => sum + task.value, 0),
    [completedTaskIds],
  )

  const projectedRevenue = BASE_REVENUE + LOCKED_REVENUE + completedValue
  const targetProgress = Math.min(100, Math.round((projectedRevenue / DAILY_TARGET) * 100))
  const stretchProgress = Math.min(100, Math.round((projectedRevenue / STRETCH_TARGET) * 100))
  const pressure = DAILY_TARGET - projectedRevenue
  const unlockedPipeline = Math.max(0, PIPELINE_REVENUE - completedValue)

  const momentumLabel = pressure <= 0 ? "Target cleared" : projectedRevenue === 0 ? "No live revenue data yet" : "Hunt mode"

  const toggleTask = (taskId: string) => {
    setCompletedTaskIds((current) =>
      current.includes(taskId) ? current.filter((id) => id !== taskId) : [...current, taskId],
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <section className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.20),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 md:p-7">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.04),transparent)] opacity-70" />
        <div className="relative grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <Flame className="h-3.5 w-3.5" />
              Morning Revenue Command
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Build {currency(DAILY_TARGET)} before lunch.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300 md:text-base">
              This board is ready for live wiring. Until then, revenue values default to zero instead of fake numbers.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Base already in play", value: currency(BASE_REVENUE), tone: "text-blue-300" },
                { label: "Locked / likely", value: currency(LOCKED_REVENUE), tone: "text-emerald-300" },
                { label: "Open pipeline", value: currency(PIPELINE_REVENUE), tone: "text-amber-300" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">{item.label}</p>
                  <p className={cn("mt-2 text-2xl font-semibold", item.tone)}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <GlassCard className="rounded-3xl border-white/10 bg-black/25 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Target Pressure</p>
                <p className="mt-2 text-4xl font-bold text-white">{targetProgress}%</p>
                <p className="mt-1 text-sm text-gray-300">{momentumLabel}</p>
              </div>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-emerald-300">
                <Target className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
                  <span>Daily target</span>
                  <span>{currency(projectedRevenue)} / {currency(DAILY_TARGET)}</span>
                </div>
                <Progress value={projectedRevenue} max={DAILY_TARGET} className="h-3 bg-white/10 [&>div]:bg-emerald-400" />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
                  <span>Stretch target</span>
                  <span>{currency(projectedRevenue)} / {currency(STRETCH_TARGET)}</span>
                </div>
                <Progress value={projectedRevenue} max={STRETCH_TARGET} className="h-2.5 bg-white/10 [&>div]:bg-blue-400" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">Still Needed</p>
                <p className="mt-2 text-2xl font-semibold text-white">{pressure > 0 ? currency(pressure) : currency(0)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">Unlocked by actions</p>
                <p className="mt-2 text-2xl font-semibold text-amber-300">{currency(completedValue)}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <GlassCard className="rounded-3xl p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">Tomorrow morning kill list</h3>
              <p className="mt-1 text-sm text-gray-400">Non-live revenue items show $0 until wired.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
              <Clock3 className="h-3.5 w-3.5" />
              First 4 moves matter most
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {EXECUTION_TASKS.map((task) => {
              const done = completedTaskIds.includes(task.id)
              const Icon = typeIcon(task.type)

              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    "w-full rounded-2xl border p-4 text-left transition-all",
                    done
                      ? "border-emerald-400/30 bg-emerald-400/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 text-gray-300">
                      {done ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : <Circle className="h-5 w-5" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gray-400">
                            <Icon className="h-3.5 w-3.5" />
                            {task.type}
                            <span className="text-gray-600">•</span>
                            {task.time}
                          </div>
                          <h4 className="mt-2 text-base font-medium text-white">{task.title}</h4>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-semibold text-emerald-300">{currency(task.value)}</p>
                          <p className="text-xs text-gray-500">Owner: {task.owner}</p>
                        </div>
                      </div>

                      <p className="mt-3 text-sm text-gray-400">{task.note}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="rounded-3xl p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Offer lanes</h3>
                <p className="mt-1 text-sm text-gray-400">Live deal numbers not wired yet.</p>
              </div>
              <Crosshair className="h-5 w-5 text-gray-400" />
            </div>

            <div className="mt-5 space-y-3">
              {OFFER_LANES.map((lane) => (
                <div key={lane.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-medium text-white">{lane.name}</h4>
                      <p className="mt-1 text-sm text-gray-400">{lane.nextMove}</p>
                    </div>
                    <Star className="h-5 w-5 text-amber-300" />
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Target</p>
                      <p className="mt-1 font-semibold text-white">{currency(lane.target)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Committed</p>
                      <p className="mt-1 font-semibold text-white">{currency(lane.committed)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Odds</p>
                      <p className="mt-1 font-semibold text-white">{lane.odds === null ? 'N/A' : `${lane.odds}%`}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="rounded-3xl p-5 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Closer script cards</h3>
                <p className="mt-1 text-sm text-gray-400">Use placeholders until live conversation data exists.</p>
              </div>
              <Trophy className="h-5 w-5 text-emerald-300" />
            </div>

            <div className="mt-5 space-y-3">
              {SCRIPT_LINES.map((line) => (
                <div key={line} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-gray-300">
                  “{line}”
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="rounded-3xl p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Power hours</h3>
              <p className="mt-1 text-sm text-gray-400">No live focus scoring yet.</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-500" />
          </div>

          <div className="mt-6 space-y-4">
            {HOUR_BLOCKS.map((block) => (
              <div key={block.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-white">{block.label}</p>
                    <p className="text-xs text-gray-500">{block.focus}</p>
                  </div>
                  <span className="text-xs text-gray-400">{block.intensity}%</span>
                </div>
                <Progress value={block.intensity} max={100} className="h-2.5 bg-white/10 [&>div]:bg-white/60" />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="rounded-3xl p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Command notes</h3>
              <p className="mt-1 text-sm text-gray-400">Revenue placeholders stay honest until live data is wired.</p>
            </div>
            <Flame className="h-5 w-5 text-amber-300" />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              {
                title: "Do not fake confidence",
                body: "Use $0 and N/A until real records arrive. A blank board is better than a lying board.",
              },
              {
                title: "Wire deal records first",
                body: "The next real unlock is a live opportunities table with value, stage, owner, and expected close date.",
              },
              {
                title: "Tasks should unlock cash",
                body: `You only need ${pressure > 0 ? currency(pressure) : currency(0)} more from live actions to clear the daily line once data is connected.`,
              },
              {
                title: "Replace N/A with proof",
                body: "As soon as lead and proposal data exists, swap placeholders with actual outreach, deposits, and close signals.",
              },
            ].map((note) => (
              <div key={note.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <h4 className="text-sm font-semibold text-white">{note.title}</h4>
                <p className="mt-2 text-sm leading-6 text-gray-400">{note.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Honesty mode enabled
            </div>
            <p className="mt-2 text-xs text-amber-100/80">Unworked pipeline remaining: {currency(unlockedPipeline)}</p>
          </div>
        </GlassCard>
      </section>
    </div>
  )
}
