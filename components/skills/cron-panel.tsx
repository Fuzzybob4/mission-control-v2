import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card"
import { StatusBadge } from "@/components/ui/status-badge"
import type { AgentStatusRecord, CronJobRecord, CronRunRecord } from "@/types"
import { format, formatDistanceToNow } from "date-fns"
import { Activity, AlertTriangle, Clock, Repeat, Server, Target, Timer } from "lucide-react"

export type CronJobWithMeta = CronJobRecord & {
  nextRunIso?: string | null
  lastRun?: CronRunRecord
}

export type CronRunWithJob = CronRunRecord & {
  job_name?: string
}

interface CronPanelProps {
  jobs: CronJobWithMeta[]
  recentRuns: CronRunWithJob[]
  agentStatus?: AgentStatusRecord | null
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "—"
  const date = new Date(value)
  return `${format(date, "MMM d, h:mm a")}`
}

const formatRelative = (value?: string | null) => {
  if (!value) return "—"
  return formatDistanceToNow(new Date(value), { addSuffix: true })
}

const formatDuration = (value?: number | null) => {
  if (value == null) return "—"
  if (value < 1000) return `${value} ms`
  const seconds = value / 1000
  if (seconds < 60) return `${seconds.toFixed(1)} s`
  const minutes = Math.floor(seconds / 60)
  const remainder = Math.floor(seconds % 60)
  return `${minutes}m ${remainder}s`
}

export function CronPanel({ jobs, recentRuns, agentStatus }: CronPanelProps) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Repeat className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-300">Automation</p>
            <h2 className="text-lg font-semibold text-white">Cron Jobs Dashboard</h2>
          </div>
        </div>
        <p className="text-sm text-gray-400 max-w-3xl">
          Live view of every scheduled automation plus the Mission Control gateway heartbeat.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard className="md:col-span-1">
          <GlassCardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <Server className="w-4 h-4 text-emerald-300" />
              Agent Gateway
            </div>
            <StatusBadge
              status={agentStatus?.gateway_online ? "online" : "offline"}
              label={agentStatus?.gateway_online ? "Online" : "Offline"}
            />
          </GlassCardHeader>
          <GlassCardContent className="space-y-3 text-sm text-gray-400">
            <div className="flex items-center justify-between">
              <span>Last Checked</span>
              <span className="text-gray-200">{formatRelative(agentStatus?.last_checked)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Last Success</span>
              <span>{formatRelative(agentStatus?.last_success)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Failure Streak</span>
              <span className={agentStatus?.failure_streak ? "text-amber-300" : "text-gray-200"}>
                {agentStatus?.failure_streak ?? 0}
              </span>
            </div>
            {agentStatus?.last_error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-200">
                <AlertTriangle className="w-4 h-4 mt-0.5" />
                <span>{agentStatus.last_error}</span>
              </div>
            )}
          </GlassCardContent>
        </GlassCard>

        <GlassCard className="md:col-span-2">
          <GlassCardHeader className="flex items-center justify-between">
            <GlassCardTitle>Job Summary</GlassCardTitle>
            <span className="text-xs text-gray-400">{jobs.length} configured</span>
          </GlassCardHeader>
          <GlassCardContent className="grid gap-3 md:grid-cols-2">
            {jobs.length === 0 && (
              <p className="text-sm text-gray-400 col-span-2">No cron jobs have been synced yet.</p>
            )}
            {jobs.map(job => (
              <div key={job.id} className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{job.name}</p>
                    <p className="text-xs text-gray-400">
                      {job.schedule} · {job.timezone || "UTC"}
                    </p>
                  </div>
                  <StatusBadge
                    status={job.enabled ? "active" : "paused"}
                    label={job.enabled ? "Enabled" : "Disabled"}
                  />
                </div>

                {job.target && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Target className="w-3.5 h-3.5" />
                    {job.target}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                    <div className="flex items-center gap-1 text-[11px] uppercase tracking-wide">
                      <Clock className="w-3 h-3" />
                      Last Run
                    </div>
                    <p className="mt-1 text-sm text-white">{formatRelative(job.lastRun?.started_at)}</p>
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <StatusBadge
                        status={job.lastRun?.status === "ok" ? "online" : "offline"}
                        label={job.lastRun ? job.lastRun.status : "—"}
                      />
                      <span>{formatDuration(job.lastRun?.duration_ms)}</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                    <div className="flex items-center gap-1 text-[11px] uppercase tracking-wide">
                      <Activity className="w-3 h-3" />
                      Next Run
                    </div>
                    <p className="mt-1 text-sm text-white">
                      {job.nextRunIso ? formatDateTime(job.nextRunIso) : job.schedule}
                    </p>
                    <span className="text-[11px] text-gray-400">{job.nextRunIso ? formatRelative(job.nextRunIso) : "—"}</span>
                  </div>
                </div>
              </div>
            ))}
          </GlassCardContent>
        </GlassCard>
      </div>

      <GlassCard>
        <GlassCardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-300">
            <Timer className="w-4 h-4 text-blue-300" />
            <GlassCardTitle>Recent Runs</GlassCardTitle>
          </div>
          <span className="text-xs text-gray-400">Last {recentRuns.length} executions</span>
        </GlassCardHeader>
        <GlassCardContent>
          {recentRuns.length === 0 ? (
            <p className="text-sm text-gray-400">No runs reported yet.</p>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-5 text-[11px] uppercase tracking-wide text-gray-500">
                <span>Job</span>
                <span>Started</span>
                <span>Status</span>
                <span>Duration</span>
                <span>Error</span>
              </div>
              {recentRuns.map(run => (
                <div
                  key={run.id}
                  className="grid grid-cols-5 items-center rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-sm text-gray-200"
                >
                  <span className="truncate">
                    {run.job_name || run.job_id.slice(0, 6)}
                  </span>
                  <span className="text-xs text-gray-400">{formatDateTime(run.started_at)}</span>
                  <span>
                    <StatusBadge
                      status={run.status === "ok" ? "online" : "offline"}
                      label={run.status.toUpperCase()}
                    />
                  </span>
                  <span className="text-xs text-gray-300">{formatDuration(run.duration_ms)}</span>
                  <span className="text-xs text-red-300 truncate">
                    {run.status === "error" ? run.error || "—" : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassCardContent>
      </GlassCard>
    </section>
  )
}
