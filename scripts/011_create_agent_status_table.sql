-- 011_create_agent_status_table.sql
-- Real-time agent heartbeat grid

CREATE TABLE IF NOT EXISTS public.agent_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL REFERENCES mc_agents(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('online','working','idle','offline','error')),
  current_task TEXT,
  task_progress INTEGER DEFAULT 0 CHECK (task_progress BETWEEN 0 AND 100),
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT agent_status_agent_unique UNIQUE (agent_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_status_agent ON public.agent_status(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_status_updated ON public.agent_status(updated_at DESC);

ALTER TABLE public.agent_status REPLICA IDENTITY FULL;
DO $$
BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE agent_status';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.agent_status ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read agent_status" ON public.agent_status;
CREATE POLICY "Public read agent_status" ON public.agent_status
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Auth write agent_status" ON public.agent_status;
CREATE POLICY "Auth write agent_status" ON public.agent_status
  FOR ALL TO authenticated USING (true);

DROP TRIGGER IF EXISTS tr_agent_status_updated ON public.agent_status;
CREATE TRIGGER tr_agent_status_updated
  BEFORE UPDATE ON public.agent_status
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

-- Seed canonical statuses for the core agents
INSERT INTO public.agent_status (agent_id, status, current_task, task_progress, metadata)
VALUES
  ('atlas', 'working', 'Coordinating agent operations', 80, '{"agent_name": "Atlas", "agent_type": "orchestrator"}'),
  ('vera', 'online', 'Planning HOA outreach strategy', 20, '{"agent_name": "Vera", "agent_type": "lone_star"}'),
  ('iris', 'online', 'Defining product roadmap', 15, '{"agent_name": "Iris", "agent_type": "redfox"}'),
  ('scarlett', 'online', 'Analyzing marketplace trends', 10, '{"agent_name": "Scarlett", "agent_type": "heroes"}'),
  ('otis', 'working', 'Building Mission Control dashboard', 65, '{"agent_name": "Otis", "agent_type": "data"}')
ON CONFLICT (agent_id) DO UPDATE SET
  status = EXCLUDED.status,
  current_task = EXCLUDED.current_task,
  task_progress = EXCLUDED.task_progress,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

SELECT '✅ agent_status table ready' AS status;
