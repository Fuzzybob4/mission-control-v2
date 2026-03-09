-- 20260309_cron_skills.sql
-- Schema objects for Mission Control cron + agent intelligence + pending skills intake.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.mc_cron_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  schedule TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  target TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,
  last_status TEXT,
  last_duration_ms INTEGER,
  consecutive_errors INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mc_cron_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.mc_cron_jobs(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('ok', 'error')),
  duration_ms INTEGER,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  ALTER TABLE public.mc_cron_runs
    ADD CONSTRAINT mc_cron_runs_job_started_unique UNIQUE (job_id, started_at);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_mc_cron_runs_job_id_started_at
  ON public.mc_cron_runs (job_id, started_at DESC);

CREATE TABLE IF NOT EXISTS public.mc_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  gateway_online BOOLEAN NOT NULL DEFAULT TRUE,
  last_checked TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_success TIMESTAMPTZ,
  failure_streak INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mc_pending_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  install_command TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  requested_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  decision_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_mc_pending_skills_status ON public.mc_pending_skills (status);

DROP TRIGGER IF EXISTS set_timestamp_mc_cron_jobs ON public.mc_cron_jobs;
CREATE TRIGGER set_timestamp_mc_cron_jobs
  BEFORE UPDATE ON public.mc_cron_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_timestamp_mc_agents ON public.mc_agents;
CREATE TRIGGER set_timestamp_mc_agents
  BEFORE UPDATE ON public.mc_agents
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

COMMIT;
