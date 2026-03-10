"use client"

import { useState } from "react"
import { RecentActivity } from "@/components/recent-activity"
import {
  Lightbulb, Code2, Gamepad2, Monitor,
  TrendingUp, AlertCircle, ArrowUpRight, ChevronRight,
} from "lucide-react"

// ── Types ────────────────────────────────────────────────────────────────────

interface Business {
  id: string
  name: string
  description: string
  icon: React.ElementType
  accent: string
  accentBg: string
  accentBorder: string
  status: "active" | "in-dev" | "on-hold"
  metric: string
  metricLabel: string
}

// ── Data ─────────────────────────────────────────────────────────────────────

const BUSINESSES: Business[] = [
  {
    id: "lone-star",
    name: "Lone Star Lighting",
    description: "Holiday lighting installs",
    icon: Lightbulb,
    accent: "text-amber-400",
    accentBg: "bg-amber-500/15",
    accentBorder: "border-amber-500/40",
    status: "active",
    metric: "$20,021",
    metricLabel: "Revenue",
  },
  {
    id: "redfox",
    name: "RedFox CRM",
    description: "SaaS for light installers",
    icon: Code2,
    accent: "text-blue-400",
    accentBg: "bg-blue-500/15",
    accentBorder: "border-blue-500/40",
    status: "in-dev",
    metric: "$0",
    metricLabel: "Revenue",
  },
  {
    id: "heroes",
    name: "Heroes of the Meta",
    description: "Trading card marketplace",
    icon: Gamepad2,
    accent: "text-violet-400",
    accentBg: "bg-violet-500/15",
    accentBorder: "border-violet-500/40",
    status: "on-hold",
    metric: "$0",
    metricLabel: "Revenue",
  },
  {
    id: "from-inception",
    name: "From Inception",
    description: "Web development studio",
    icon: Monitor,
    accent: "text-cyan-400",
    accentBg: "bg-cyan-500/15",
    accentBorder: "border-cyan-500/40",
    status: "in-dev",
    metric: "$0",
    metricLabel: "Revenue",
  },
]

const STATUS_MAP = {
  "active":   { label: "Active",   dot: "bg-emerald-400", text: "text-emerald-400" },
  "in-dev":   { label: "In Dev",   dot: "bg-blue-400",    text: "text-blue-400"    },
  "on-hold":  { label: "On Hold",  dot: "bg-gray-400",    text: "text-gray-400"    },
}

// Weekly revenue bars (Mon–Sun), last value = current
const WEEK_BARS = [8200, 11400, 9800, 15600, 13200, 18900, 20021]
const BAR_MAX = Math.max(...WEEK_BARS)
const BAR_DAYS = ["M", "T", "W", "T", "F", "S", "S"]

// Goal
const GOAL_TARGET = 60000
const GOAL_CURRENT = 20021
const GOAL_PCT = Math.round((GOAL_CURRENT / GOAL_TARGET) * 100)

// Donut helpers
const DONUT_R = 52
const DONUT_C = 2 * Math.PI * DONUT_R
const DONUT_DASH = (DONUT_C * GOAL_PCT) / 100

// ── Sub-components ───────────────────────────────────────────────────────────

function StatChip({
  label, value, color, barPct,
}: { label: string; value: string; color: string; barPct?: number }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">{label}</span>
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-full border ${color} font-semibold text-sm whitespace-nowrap`}
      >
        {barPct !== undefined && (
          <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-current opacity-70"
              style={{ width: `${barPct}%` }}
            />
          </div>
        )}
        {value}
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

export function OverviewTab({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)

  return (
    <div className="space-y-5 animate-fade-in-up">

      {/* ── Row 1: Hero Stat Chips ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 pb-2 border-b border-white/[0.06] sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-8 sm:gap-y-4">
        <div className="grid grid-cols-2 gap-3 sm:contents">
          <StatChip
            label="Total Revenue"
            value="$20,021"
            color="bg-amber-500/20 border-amber-500/30 text-amber-300"
            barPct={33}
          />
          <StatChip
            label="Goal Progress — $60,000"
            value={`${GOAL_PCT}%`}
            color="bg-white/[0.06] border-white/10 text-white"
            barPct={GOAL_PCT}
          />
          <StatChip
            label="Pipeline Value"
            value="$18,000"
            color="bg-blue-500/15 border-blue-500/25 text-blue-300"
          />
          <StatChip
            label="Businesses Active"
            value="1 of 4"
            color="bg-white/[0.06] border-white/10 text-gray-300"
          />
        </div>

        {/* Big numbers */}
        <div className="flex items-end gap-6 sm:gap-8 sm:ml-auto">
          {[
            { n: "1", label: "Active Biz" },
            { n: "4",  label: "Total Agents" },
            { n: "3",  label: "Projects" },
          ].map(({ n, label }) => (
            <div key={label} className="text-right">
              <p className="text-3xl sm:text-4xl font-bold text-white leading-none">{n}</p>
              <p className="text-[11px] text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 2: Main Bento ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-4">

        {/* Business Status Card — 4 cols */}
        <div className="col-span-12 md:col-span-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">Businesses</h3>
            <TrendingUp className="w-4 h-4 text-gray-500" />
          </div>
          {BUSINESSES.map((biz) => {
            const Icon = biz.icon
            const s = STATUS_MAP[biz.status]
            return (
              <button
                key={biz.id}
                onClick={() => onNavigate?.(biz.id)}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.07] transition-colors text-left w-full group"
              >
                <div className={`p-2 rounded-lg ${biz.accentBg} flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${biz.accent}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{biz.name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{biz.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    <span className={`text-[11px] font-medium ${s.text}`}>{s.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-colors" />
                </div>
              </button>
            )
          })}
        </div>

        {/* Revenue Bar Chart — 4 cols */}
        <div className="col-span-12 md:col-span-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5 flex flex-col">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide">Revenue</p>
              <p className="text-3xl font-bold text-white mt-0.5 leading-none">$20,021</p>
              <p className="text-[11px] text-gray-500 mt-1">This week</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium bg-emerald-400/10 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" />
              +12%
            </div>
          </div>

          {/* Bars */}
          <div className="flex-1 flex items-end gap-1.5 mt-5 min-h-[80px]">
            {WEEK_BARS.map((val, i) => {
              const heightPct = (val / BAR_MAX) * 100
              const isLast = i === WEEK_BARS.length - 1
              const isHovered = hoveredBar === i
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {isHovered && (
                    <div className="text-[10px] text-white bg-white/10 rounded px-1.5 py-0.5 whitespace-nowrap">
                      ${(val / 1000).toFixed(1)}k
                    </div>
                  )}
                  <div
                    className={`w-full rounded-t-md transition-all duration-150 ${
                      isLast
                        ? "bg-amber-400"
                        : isHovered
                        ? "bg-white/40"
                        : "bg-white/15"
                    }`}
                    style={{ height: `${heightPct}%`, minHeight: 4 }}
                  />
                  <span className="text-[10px] text-gray-500">{BAR_DAYS[i]}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Goal Donut — 4 cols */}
        <div className="col-span-12 md:col-span-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5 flex flex-col items-center justify-center gap-4">
          <div className="w-full flex items-center justify-between">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">Monthly Goal</p>
            <span className="text-[11px] text-gray-500">$60K target</span>
          </div>

          {/* SVG Donut */}
          <div className="relative flex items-center justify-center">
            <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
              {/* Track */}
              <circle
                cx="70" cy="70" r={DONUT_R}
                fill="none"
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="12"
              />
              {/* Progress */}
              <circle
                cx="70" cy="70" r={DONUT_R}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${DONUT_DASH} ${DONUT_C}`}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute text-center">
              <p className="text-3xl font-bold text-white leading-none">{GOAL_PCT}%</p>
              <p className="text-[11px] text-gray-500 mt-1">of goal</p>
            </div>
          </div>

          <div className="w-full grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-base font-bold text-white">$20K</p>
              <p className="text-[10px] text-gray-500">Current</p>
            </div>
            <div>
              <p className="text-base font-bold text-gray-400">$40K</p>
              <p className="text-[10px] text-gray-500">Remaining</p>
            </div>
            <div>
              <p className="text-base font-bold text-amber-400">$60K</p>
              <p className="text-[10px] text-gray-500">Target</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Activity + Urgent Actions ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Activity */}
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
          <RecentActivity maxItems={5} />
        </div>

        {/* Urgent Actions */}
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Urgent Actions
          </h3>
          <div className="space-y-2">
            {[
              {
                title: "Alora Hess Follow-up",
                sub: "Due: Feb 20, 2026",
                right: "$17K–$19K",
                rightCls: "text-emerald-400 font-semibold text-sm",
                border: "border-l-amber-500",
              },
              {
                title: "Review RedFox CRM PR",
                sub: "New features ready for review",
                right: "Dev",
                rightCls: "text-blue-400 text-xs",
                border: "border-l-blue-500",
              },
              {
                title: "Inventory Update",
                sub: "Heroes of the Meta — 12 new cards",
                right: "Side",
                rightCls: "text-violet-400 text-xs",
                border: "border-l-violet-500",
              },
              {
                title: "From Inception Site Copy",
                sub: "Finalize homepage draft",
                right: "Web",
                rightCls: "text-cyan-400 text-xs",
                border: "border-l-cyan-500",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] border-l-2 ${item.border}`}
              >
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{item.sub}</p>
                </div>
                <span className={item.rightCls}>{item.right}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
