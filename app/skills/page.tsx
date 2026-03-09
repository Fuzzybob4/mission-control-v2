import Link from "next/link"
import { differenceInHours, formatDistanceToNow } from "date-fns"
import { ArrowLeft, ExternalLink, Sparkles, ShieldCheck, Command, Activity, AlertTriangle, CheckCircle2, Clock3 } from "lucide-react"

import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from "@/components/ui/glass-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { PendingSkillsBoard, type PendingSkill } from "@/components/skills/pending-skills-board"
import { getSupabaseClient } from "@/lib/supabaseClient"
import type { CronJobRecord, CronRunRecord, AgentStatusRecord } from "@/types"

type CronJob = CronJobRecord

type CronRun = CronRunRecord

type AgentStatus = AgentStatusRecord | null

const skills = [
  {
    name: "Email Lead Triage",
    slug: "email-lead-triage",
    category: "Operations",
    type: "Custom",
    description: "Automates the heartbeat-driven inbox sweep: refresh the IMAP queue, summarize pending leads, draft replies, and choose the right send path (SendGrid → Gmail → manual).",
    location: "skills/email-lead-triage/SKILL.md",
    highlights: [
      "Runs scripts/email-monitor-robust.sh before every summary",
      "Drafts replies into memory/email-queue/{lead}_reply.md",
      "Tracks SLA + status updates back to Christian"
    ],
    commands: [
      "./scripts/email-monitor-robust.sh",
      "memory/email-queue/lead*.json",
      "SendGrid or Gmail delivery"
    ],
    status: "Active",
    stack: "Workspace"
  },
  {
    name: "HubSpot CRM",
    slug: "hubspot",
    category: "Revenue",
    type: "Marketplace",
    description: "Full HubSpot CRM/CMS access via REST (contacts, companies, deals, owners, files). Perfect for syncing lead intel back into the CRM.",
    location: "skills/hubspot/SKILL.md",
    highlights: [
      "Create/search/update contacts, companies, and deals",
      "Supports associations + timeline events",
      "Requires HUBSPOT_ACCESS_TOKEN"
    ],
    commands: [
      "curl https://api.hubapi.com/crm/v3/objects/contacts",
      "curl .../deals?limit=10",
      "curl .../files"
    ],
    status: "Ready",
    stack: "HubSpot API"
  },
  {
    name: "Firecrawl",
    slug: "firecrawl",
    category: "Research",
    type: "Marketplace",
    description: "Official Firecrawl CLI skill for search, scrape, crawl, and browser automation with clean markdown output for LLM workflows.",
    location: "~/.openclaw/workspace/.agents/skills/firecrawl/SKILL.md",
    highlights: [
      "search/scrape/map/crawl/browser commands",
      "Handles JS-heavy + authenticated flows",
      "Writes artifacts to .firecrawl/ and reuses cache"
    ],
    commands: [
      "firecrawl search \"from inception web design\" --scrape",
      "firecrawl scrape https://example.com --only-main-content",
      "firecrawl map https://docs.example.com --search auth"
    ],
    status: "Active",
    stack: "Firecrawl API"
  },
  {
    name: "QMD Local Search",
    slug: "qmd",
    category: "Knowledge",
    type: "Marketplace",
    description: "Local doc indexing + BM25/vector search so I can instantly fetch prior work, SOPs, or transcripts without re-reading entire folders.",
    location: "skills/qmd/SKILL.md",
    highlights: [
      "Create/update local search collections",
      "Hybrid BM25 + vector querying",
      "Supports MCP mode when needed"
    ],
    commands: [
      "qmd collection add ./docs --name ops",
      "qmd update",
      "qmd query \"lead follow-up\""
    ],
    status: "Ready",
    stack: "Local"
  },
  {
    name: "Twitter / X Ops",
    slug: "twitter-openclaw",
    category: "Growth",
    type: "Marketplace",
    description: "twclaw-powered X automation for posting, replying, searches, and engagement on @from_inception.",
    location: "skills/x-twitter/SKILL.md",
    highlights: [
      "Timeline/mention search + thread pulls",
      "Post, reply, retweet (with confirmation)",
      "List + follower management"
    ],
    commands: [
      "twclaw mentions -n 10",
      "twclaw tweet \"Value post...\"",
      "twclaw search \"need a website\" --recent"
    ],
    status: "Ready",
    stack: "Twitter API"
  }
]

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
})

function formatDateTime(value?: string | null) {
  if (!value) return "—"
  return dateFormatter.format(new Date(value))
}

function formatRelative(value?: string | null) {
  if (!value) return "—"
  return formatDistanceToNow(new Date(value), { addSuffix: true })
}

function formatDuration(durationMs?: number | null) {
  if (durationMs === null || durationMs === undefined) {
    return "—"
  }
  if (durationMs < 1000) {
    return `${durationMs} ms`
  }
  return `${(durationMs / 1000).toFixed(1)} s`
}

async function fetchCronDashboard() {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return {
      jobs: [] as CronJob[],
      runs: [] as CronRun[],
      agentStatus: null as AgentStatus,
      errors: ["Supabase environment variables are missing."],
    }
  }

  const [jobsResponse, runsResponse, statusResponse] = await Promise.all([
    supabase.from("mc_cron_jobs").select("*").order("name", { ascending: true }),
    supabase
      .from("mc_cron_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(50),
    supabase.from("mc_agents").select("*").order("last_checked", { ascending: false }).limit(1),
  ])

  const errors = [jobsResponse.error, runsResponse.error, statusResponse.error]
    .filter(Boolean)
    .map((err) => err!.message)

  return {
    jobs: (jobsResponse.data as CronJob[] | null) ?? [],
    runs: (runsResponse.data as CronRun[] | null) ?? [],
    agentStatus: (statusResponse.data as AgentStatusRecord[] | null)?.[0] ?? null,
    errors,
  }
}

async function fetchPendingSkills() {
  const supabase = getSupabaseClient()

  if (!supabase) {
    return { data: [] as PendingSkill[], error: "Supabase environment variables are missing." }
  }

  const response = await supabase
    .from("mc_pending_skills")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })

  return {
    data: (response.data as PendingSkill[] | null) ?? [],
    error: response.error?.message ?? null,
  }
}

export default async function SkillsPage() {
  const [{ jobs, runs, agentStatus, errors: cronErrors }, { data: pendingSkills, error: pendingError }] = await Promise.all([
    fetchCronDashboard(),
    fetchPendingSkills(),
  ])

  const totalSkills = skills.length
  const categories = new Set(skills.map(skill => skill.category)).size
  const customSkills = skills.filter(skill => skill.type === "Custom").length

  const enabledJobs = jobs.filter(job => job.enabled).length
  const runsLastDay = runs.filter(run => run.started_at && differenceInHours(new Date(), new Date(run.started_at)) <= 24).length
  const successRate = runs.length ? Math.round((runs.filter((run) => run.status === "ok").length / runs.length) * 100) : 0

  const cronSummary = [
    { label: "Total Jobs", value: jobs.length, icon: Activity },
    { label: "Enabled", value: enabledJobs, icon: ShieldCheck },
    { label: "Runs / 24h", value: runsLastDay, icon: Clock3 },
    { label: "Success Rate", value: runs.length ? `${successRate}%` : "—", icon: CheckCircle2 },
  ]

  const lastRunsByJob = new Map<string, CronRun>()
  for (const run of runs) {
    if (run.job_id && !lastRunsByJob.has(run.job_id)) {
      lastRunsByJob.set(run.job_id, run)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Mission Control
        </Link>

        <section className="glass-strong rounded-3xl border border-white/10 p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-300">Skill Stack</p>
              <h1 className="text-3xl md:text-4xl font-semibold text-white mt-2">Kal's Installed Skills</h1>
              <p className="text-gray-400 mt-3 text-sm md:text-base">
                Everything the agent can do right now—CLI integrations, custom workflows, and research stacks. New skills drop here as soon as they’re installed.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center min-w-[240px]">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-semibold">{totalSkills}</p>
                <p className="text-xs uppercase tracking-widest text-gray-400">Total Skills</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-semibold">{categories}</p>
                <p className="text-xs uppercase tracking-widest text-gray-400">Categories</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 col-span-2">
                <p className="text-2xl font-semibold">{customSkills}</p>
                <p className="text-xs uppercase tracking-widest text-gray-400">Custom Workflows</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <div className="inline-flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Authenticated to Supabase, HubSpot, SendGrid, Firecrawl
            </div>
            <div className="inline-flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              Updated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
            <div className="inline-flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Command className="w-3.5 h-3.5 text-purple-300" />
              Use via Claude Code, Codex, OpenClaw
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Skill inventory</h2>
            <p className="text-sm text-gray-400">Every skill is production-ready—click into the SKILL.md entries in-repo for full instructions.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {skills.map((skill) => (
              <GlassCard key={skill.slug} className="flex flex-col">
                <GlassCardHeader className="flex items-center justify-between">
                  <div>
                    <GlassCardTitle>{skill.name}</GlassCardTitle>
                    <p className="text-xs text-gray-400 mt-1">{skill.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] uppercase tracking-widest text-blue-300">{skill.category}</span>
                    <div className="text-[11px] text-gray-400">{skill.type}</div>
                  </div>
                </GlassCardHeader>
                <GlassCardContent className="flex-1 flex flex-col gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Highlights</p>
                    <ul className="space-y-1 text-sm text-gray-300 list-disc list-inside">
                      {skill.highlights.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase mb-1">Go-to commands</p>
                    <div className="space-y-1">
                      {skill.commands.map((cmd) => (
                        <code key={cmd} className="block text-xs bg-black/30 border border-white/10 rounded-md px-2 py-1 text-gray-200">
                          {cmd}
                        </code>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
                    <span>{skill.status} • {skill.stack}</span>
                    <span className="inline-flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      {skill.location}
                    </span>
                  </div>
                </GlassCardContent>
              </GlassCard>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold">Cron automation dashboard</h2>
            <p className="text-sm text-gray-400">Direct pull from Supabase (mc_cron_jobs, mc_cron_runs, mc_agents). Use this to see heartbeat health, recent executions, and which agents are in the fight.</p>
          </div>

          {cronErrors.length ? (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Supabase returned {cronErrors.length > 1 ? "errors" : "an error"}:</span>
              </div>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                {cronErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cronSummary.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
                <div className="rounded-xl bg-black/30 p-2 border border-white/10">
                  <Icon className="w-5 h-5 text-blue-200" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{value}</p>
                  <p className="text-xs uppercase tracking-widest text-gray-400">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <GlassCard>
              <GlassCardHeader>
                <GlassCardTitle>Agent gateway</GlassCardTitle>
                <p className="text-sm text-gray-400">Live heartbeat from Supabase agent_status.</p>
              </GlassCardHeader>
              <GlassCardContent className="space-y-3">
                {agentStatus ? (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold">{agentStatus.gateway_online ? "Online" : "Offline"}</p>
                      <StatusBadge
                        status={agentStatus.gateway_online ? "online" : "offline"}
                        label={agentStatus.gateway_online ? "ONLINE" : "OFFLINE"}
                      />
                    </div>
                    <div className="grid gap-3 text-sm text-gray-300">
                      <p>
                        <span className="text-white/60">Last checked:</span> {formatRelative(agentStatus.last_checked)}
                      </p>
                      <p>
                        <span className="text-white/60">Last success:</span> {formatRelative(agentStatus.last_success)}
                      </p>
                      <p>
                        <span className="text-white/60">Failure streak:</span> {agentStatus.failure_streak ?? 0}
                      </p>
                      {agentStatus.last_error ? (
                        <p className="text-red-300 text-xs">
                          <span className="text-white/60">Last error:</span> {agentStatus.last_error}
                        </p>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No gateway heartbeats have been recorded yet.</p>
                )}
              </GlassCardContent>
            </GlassCard>

            <GlassCard className="lg:col-span-2">
              <GlassCardHeader>
                <GlassCardTitle>Cron jobs</GlassCardTitle>
                <p className="text-sm text-gray-400">cron_jobs + cron_runs (Supabase).</p>
              </GlassCardHeader>
              <GlassCardContent>
                {jobs.length === 0 ? (
                  <p className="text-sm text-gray-500">No cron jobs found in Supabase.</p>
                ) : (
                  <div className="space-y-3">
                    {jobs.map((job) => {
                      const lastRun = job.id ? lastRunsByJob.get(job.id) : undefined
                      return (
                        <div key={job.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                            <div>
                              <p className="font-medium text-white">{job.name}</p>
                              <p className="text-sm text-gray-400">{job.target || "No target configured"}</p>
                            </div>
                            <StatusBadge status={job.enabled ? "active" : "paused"} label={job.enabled ? "ENABLED" : "DISABLED"} />
                          </div>
                          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs text-gray-400">
                            <div>
                              <p className="text-white/60">Schedule</p>
                              <p className="text-sm text-white font-mono">{job.schedule}</p>
                            </div>
                            <div>
                              <p className="text-white/60">Timezone</p>
                              <p className="text-sm text-white">{job.timezone || "—"}</p>
                            </div>
                            <div>
                              <p className="text-white/60">Target</p>
                              <p className="text-sm text-white">{job.target || "—"}</p>
                            </div>
                            <div>
                              <p className="text-white/60">Next run (cron)</p>
                              <p className="text-sm text-white font-mono">{job.schedule}</p>
                            </div>
                          </div>
                          <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-xs text-white/60">Last run</p>
                                <p className="text-sm text-white">{lastRun ? formatDateTime(lastRun.finished_at ?? lastRun.started_at) : "Never ran"}</p>
                              </div>
                              {lastRun ? (
                                <StatusBadge
                                  status={lastRun.status === "ok" ? "active" : "urgent"}
                                  label={lastRun.status.toUpperCase()}
                                />
                              ) : null}
                            </div>
                            {lastRun ? (
                              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-400">
                                <div>
                                  <p className="text-white/60">Duration</p>
                                  <p className="text-white">{formatDuration(lastRun.duration_ms)}</p>
                                </div>
                                <div>
                                  <p className="text-white/60">Finished</p>
                                  <p className="text-white">{formatRelative(lastRun.finished_at)}</p>
                                </div>
                              </div>
                            ) : null}
                            {lastRun?.error ? (
                              <p className="mt-2 text-xs text-red-300">{lastRun.error}</p>
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </GlassCardContent>
            </GlassCard>
          </div>

          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Recent runs</GlassCardTitle>
              <p className="text-sm text-gray-400">Latest cron_runs rows straight out of Supabase.</p>
            </GlassCardHeader>
            <GlassCardContent>
              {runs.length === 0 ? (
                <p className="text-sm text-gray-500">No cron runs logged in the last window.</p>
              ) : (
                <div className="space-y-3">
                  {runs.map((run) => (
                    <div key={run.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">{run.job_id}</p>
                          <p className="text-xs text-gray-400">Started {formatDateTime(run.started_at)}</p>
                        </div>
                        <StatusBadge
                          status={run.status === "ok" ? "active" : "urgent"}
                          label={run.status.toUpperCase()}
                        />
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-4 text-xs text-gray-400">
                        <div>
                          <p className="text-white/60">Finished</p>
                          <p className="text-white">{formatDateTime(run.finished_at)}</p>
                        </div>
                        <div>
                          <p className="text-white/60">Duration</p>
                          <p className="text-white">{formatDuration(run.duration_ms)}</p>
                        </div>
                        <div>
                          <p className="text-white/60">Ago</p>
                          <p className="text-white">{formatRelative(run.finished_at)}</p>
                        </div>
                      </div>
                      {run.error ? (
                        <p className="mt-3 text-sm text-red-300">{run.error}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </GlassCardContent>
          </GlassCard>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Pending skills queue</h2>
            <p className="text-sm text-gray-400">Approve or deny capabilities requested by the field teams. Actions hit /api/skills/pending → Supabase.</p>
          </div>

          {pendingError ? (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {pendingError}
            </div>
          ) : null}

          <PendingSkillsBoard initialSkills={pendingSkills} />
        </section>
      </div>
    </div>
  )
}
