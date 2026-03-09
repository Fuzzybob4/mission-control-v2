#!/usr/bin/env tsx
import "dotenv/config"
import fs from "node:fs"
import { promises as fsp } from "node:fs"
import path from "node:path"
import os from "node:os"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const HOME = os.homedir()
const CRON_DIR = path.join(HOME, ".openclaw", "cron")
const JOBS_PATH = path.join(CRON_DIR, "jobs.json")
const RUNS_DIR = path.join(CRON_DIR, "runs")
const STATE_PATH = path.join(process.cwd(), "logs", "cron-watcher-state.json")

function ensureEnv(): SupabaseClient<any, any, any> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing")
  }

  return createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
}

function toIso(ms?: number | null) {
  if (ms === undefined || ms === null) return null
  return new Date(ms).toISOString()
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fsp.readFile(filePath, "utf-8")
    return JSON.parse(raw) as T
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null
    }
    throw error
  }
}

async function readJsonLines(filePath: string, limit = 100) {
  try {
    const raw = await fsp.readFile(filePath, "utf-8")
    const lines = raw.trim().split(/\r?\n/).filter(Boolean)
    return lines.slice(-limit).map((line) => JSON.parse(line))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return []
    }
    throw error
  }
}

async function ensureLogsDir() {
  const logsDir = path.join(process.cwd(), "logs")
  if (!fs.existsSync(logsDir)) {
    await fsp.mkdir(logsDir, { recursive: true })
  }
}

async function writeState(payload: unknown) {
  await ensureLogsDir()
  await fsp.writeFile(STATE_PATH, JSON.stringify(payload, null, 2))
}

async function loadState<T>() {
  try {
    const raw = await fsp.readFile(STATE_PATH, "utf-8")
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

async function upsertJobs(supabase: SupabaseClient<any, any, any>, jobs: any[]) {
  if (!jobs.length) return

  const mapped = jobs.map((job) => ({
    id: job.id,
    name: job.name,
    description: job.description ?? null,
    schedule: job.schedule?.expr ?? job.schedule,
    timezone: job.schedule?.tz ?? "America/Chicago",
    target: job.sessionTarget ?? job.target ?? "main",
    enabled: job.enabled ?? true,
    next_run_at: toIso(job.state?.nextRunAtMs),
    last_run_at: toIso(job.state?.lastRunAtMs),
    last_status: job.state?.lastStatus ?? job.state?.lastRunStatus ?? null,
    last_duration_ms: job.state?.lastDurationMs ?? null,
    consecutive_errors: job.state?.consecutiveErrors ?? 0,
    last_error: job.state?.lastError ?? null,
  }))

  const { error } = await supabase.from("mc_cron_jobs").upsert(mapped as any[], { onConflict: "id" })
  if (error) {
    throw new Error(`[cron-watcher] Failed to upsert jobs: ${error.message}`)
  }
}

async function upsertRuns(supabase: SupabaseClient<any, any, any>, jobs: any[]) {
  const rows = [] as any[]

  for (const job of jobs) {
    const runLines = await readJsonLines(path.join(RUNS_DIR, `${job.id}.jsonl`), 100)
    for (const run of runLines) {
      const startedIso = toIso(run.runAtMs ?? run.startedAtMs ?? run.ts)
      const finishedIso = run.runAtMs && run.durationMs ? toIso(run.runAtMs + run.durationMs) : toIso(run.ts)
      rows.push({
        job_id: job.id,
        started_at: startedIso,
        finished_at: finishedIso,
        status: run.status ?? "ok",
        duration_ms: run.durationMs ?? null,
        error: run.lastError ?? run.error ?? null,
      })
    }
  }

  if (!rows.length) return

  const { error } = await supabase.from("mc_cron_runs").upsert(rows as any[], { onConflict: "job_id,started_at" })
  if (error) {
    throw new Error(`[cron-watcher] Failed to upsert runs: ${error.message}`)
  }
}

async function updateAgentStatus(supabase: SupabaseClient<any, any, any>, jobs: any[]) {
  const consecutiveErrors = jobs.reduce((max, job) => Math.max(max, job.state?.consecutiveErrors ?? 0), 0)
  const lastErrorJob = jobs.find((job) => job.state?.lastError)
  const latestRunMs = jobs
    .map((job) => job.state?.lastRunAtMs)
    .filter((value): value is number => typeof value === "number")
    .sort((a, b) => b - a)[0]

  const payload = {
    name: "Atlas Gateway",
    gateway_online: consecutiveErrors === 0,
    last_checked: new Date().toISOString(),
    last_success: latestRunMs ? toIso(latestRunMs) : null,
    failure_streak: consecutiveErrors,
    last_error: lastErrorJob?.state?.lastError ?? null,
  }

  const { error } = await supabase.from("mc_agents").upsert(payload as any, { onConflict: "name" })
  if (error) {
    throw new Error(`[cron-watcher] Failed to upsert agent status: ${error.message}`)
  }
}

async function main() {
  const supabase = ensureEnv()

  const jobsFile = await readJsonFile<{ jobs: any[] }>(JOBS_PATH)
  if (!jobsFile?.jobs?.length) {
    console.warn("[cron-watcher] jobs.json is empty or missing")
    return
  }

  await upsertJobs(supabase, jobsFile.jobs)
  await upsertRuns(supabase, jobsFile.jobs)
  await updateAgentStatus(supabase, jobsFile.jobs)

  await writeState({
    ranAt: new Date().toISOString(),
    jobsProcessed: jobsFile.jobs.length,
  })

  console.log(`[cron-watcher] Updated Supabase at ${new Date().toISOString()}`)
}

main().catch((error) => {
  console.error("[cron-watcher] fatal", error)
  process.exit(1)
})
