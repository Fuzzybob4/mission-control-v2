"use client"

import { useMemo, useState } from "react"
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock3,
  Crosshair,
  DollarSign,
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
  odds: number
  nextMove: string
  color: string
}

const DAILY_TARGET = 300
const STRETCH_TARGET = 500
const BASE_REVENUE = 120
const LOCKED_REVENUE = 80
const PIPELINE_REVENUE = 520

const EXECUTION_TASKS: ExecutionTask[] = [
  {
    id: "task-1",
    title: "Text Alora with same-day close window",
    owner: "Lone Star",
    value: 180,
    time: "8:15 AM",
    type: "text",
    note: "Give a tight install slot + soft scarcity. Ask for yes/no, not maybe.",
  },
  {
    id: "task-2",
    title: "Call 3 warm lighting leads before 9:00",
    owner: "Lone Star",
    value: 240,
    time: "8:30 AM",
    type: "call",
    note: "Target people who already requested pricing. Push deposit collection live on call.",
  },
  {
    id: "task-3",
    title: "Send 2-page RedFox quick-close offer",
    owner: "RedFox",
    value: 125,
    time: "9:40 AM",
    type: "proposal",
    note: "Frame as founding-user pricing that disappears Friday.",
  },
  {
    id: "task-4",
    title: "Re-open yesterday's silent replies",
    owner: "From Inception",
    value: 90,
    time: "10:15 AM",
    type: "follow-up",
    note: "Use the bump: 'Still want me to reserve this slot for you?'",
  },
]

const OFFER_LANES: OfferLane[] = [
  {
    id: "lane-1",
    name: "Fast Cash Offers",
    target: 180,
    committed: 110,
    odds: 78,
    nextMove: "Push deposit + booking text to warm install leads.",
    color: "from-emerald-500/30 to-emerald-400/5",
  },
  {
    id: "lane-2",
    name: "CRM Founding Seats",
    target: 75,
    committed: 20,
    odds: 42,
    nextMove: "Pitch one annual prepay deal with implementation bonus.",
    color: "from-sky-500/30 to-sky-400/5",
  },
  {
    id: "lane-3",
    name: "Studio Retainers",
    target: 45,
    committed: 10,
    odds: 35,
    nextMove: "Offer a 48-hour launch sprint with fixed scope.",
    color: "from-violet-500/30 to-violet-400/5",
  },
]

const HOUR_BLOCKS = [
  { label: "8A", focus: "Warm lead texts", intensity: 92 },
  { label: "9A", focus: "Phone closes", intensity: 100 },
  { label: "10A", focus: "Proposal sends", intensity: 74 },
  { label: "11A", focus: "Follow-up sweep", intensity: 68 },
  { label: "12P", focus: "Invoice / collect", intensity: 88 },
]

const SCRIPT_LINES = [
  "I've got a same-day slot open and can lock your install with a small deposit.",
  "If we wrap this tonight, I can keep pricing clean and avoid next week's backlog.",
  "Want me to reserve the spot and send the payment link right now?",
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

  const momentumLabel = pressure <= 0 ? "Target cleared" : pressure <= 60 ? "Within striking distance" : "Hunt mode"

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
              This surface is tuned for one thing: converting warm intent into cash tomorrow morning. It turns the board into a revenue ritual — what to hit, in what order, and how close you are to the line.
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
              <p className="mt-1 text-sm text-gray-400">Check the box as cash moves closer. The totals above update instantly.</p>
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
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    "group w-full rounded-2xl border p-4 text-left transition-all",
                    done
                      ? "border-emerald-400/30 bg-emerald-400/10"
                      : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 text-white">
                      {done ? <CheckCircle2 className="h-5 w-5 text-emerald-300" /> : <Circle className="h-5 w-5 text-gray-500" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-white">{task.title}</span>
                        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-gray-400">{task.owner}</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-400">{task.note}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                        <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{task.time}</span>
                        <span className="inline-flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" />{task.type}</span>
                        <span className="inline-flex items-center gap-1.5 text-emerald-300"><DollarSign className="h-3.5 w-3.5" />{currency(task.value)} impact</span>
                      </div>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-gray-600 transition-transform group-hover:translate-x-1 group-hover:text-gray-300" />
                  </div>
                </button>
              )
            })}
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Offer lanes</h3>
              <Crosshair className="h-4 w-4 text-amber-300" />
            </div>
            <div className="mt-4 space-y-3">
              {OFFER_LANES.map((lane) => (
                <div key={lane.id} className={cn("rounded-2xl border border-white/10 bg-gradient-to-br p-4", lane.color)}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{lane.name}</p>
                      <p className="mt-1 text-xs text-gray-300">{lane.nextMove}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">{currency(lane.committed)}</p>
                      <p className="text-[11px] text-gray-400">of {currency(lane.target)}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="mb-2 flex items-center justify-between text-[11px] text-gray-300">
                      <span>Close odds</span>
                      <span>{lane.odds}%</span>
                    </div>
                    <Progress value={lane.committed} max={lane.target} className="h-2.5 bg-black/20 [&>div]:bg-white" />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Closer script</h3>
              <Star className="h-4 w-4 text-blue-300" />
            </div>
            <div className="mt-4 space-y-3">
              {SCRIPT_LINES.map((line, index) => (
                <div key={line} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Line {index + 1}</p>
                  <p className="mt-2 text-sm leading-6 text-gray-200">“{line}”</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="rounded-3xl p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">Power hours</h3>
              <p className="mt-1 text-sm text-gray-400">A visual read on where to spend the morning spellbook.</p>
            </div>
            <Trophy className="h-5 w-5 text-amber-300" />
          </div>
          <div className="mt-5 flex items-end gap-3 overflow-x-auto pb-2">
            {HOUR_BLOCKS.map((block) => (
              <div key={block.label} className="min-w-[88px] flex-1">
                <div className="flex h-44 items-end rounded-3xl border border-white/10 bg-white/[0.03] p-2">
                  <div
                    className="w-full rounded-2xl bg-gradient-to-t from-emerald-500 via-emerald-400 to-blue-400 transition-all"
                    style={{ height: `${block.intensity}%` }}
                  />
                </div>
                <p className="mt-3 text-sm font-medium text-white">{block.label}</p>
                <p className="mt-1 text-xs leading-5 text-gray-400">{block.focus}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="rounded-3xl p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">Command notes</h3>
              <p className="mt-1 text-sm text-gray-400">Small strategic nudges that keep the day pointed at revenue, not noise.</p>
            </div>
            <Rocket className="h-5 w-5 text-emerald-300" />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {[
              {
                title: "Collect before you create",
                body: "Tomorrow morning should bias toward deposits, invoices, and closes — not drafting, building, or polishing.",
              },
              {
                title: "Use narrow asks",
                body: "Every touch should end with a binary next step: reserve slot, pay deposit, approve quote, or book a call.",
              },
              {
                title: "Protect the noon scoreboard",
                body: "By 12 PM, either the board says target hit or you immediately pivot into the highest-odds lane still open.",
              },
              {
                title: "Cash creates calm",
                body: `You only need ${pressure > 0 ? currency(pressure) : currency(0)} more from this board to clear the daily line. Stay ruthless.`,
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-gray-400">{item.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-amber-200">Current board read</p>
            <p className="mt-2 text-sm leading-6 text-amber-50">
              {pressure <= 0
                ? "The line is already covered. Tomorrow becomes margin expansion: raise average close size and collect early."
                : `The board only needs ${currency(pressure)} more. Fastest path: hit the warm install texts first, then move straight into phone closes while urgency is hot.`}
            </p>
            <p className="mt-3 text-xs text-amber-100/80">Unworked pipeline remaining: {currency(unlockedPipeline)}</p>
          </div>
        </GlassCard>
      </section>
    </div>
  )
}
