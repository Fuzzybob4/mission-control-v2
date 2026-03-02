-- 010_create_agent_tasks_table.sql
-- Mission Control-style task history merged into Kal Ops

-- Ensure custom enum exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'agent_task_status'
  ) THEN
    CREATE TYPE agent_task_status AS ENUM (
      'pending',
      'running',
      'completed',
      'failed',
      'cancelled'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.agent_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL REFERENCES mc_agents(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  task_description TEXT,
  status agent_task_status DEFAULT 'pending',
  credits_used NUMERIC(12,2) DEFAULT 0,
  time_elapsed_seconds INTEGER,
  output_files JSONB DEFAULT '[]'::JSONB,
  parent_session UUID,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes to keep dashboards fast
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent ON public.agent_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON public.agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_created ON public.agent_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_parent_session ON public.agent_tasks(parent_session);

-- Enable realtime + logical decoding support
ALTER TABLE public.agent_tasks REPLICA IDENTITY FULL;
DO $$
BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE agent_tasks';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- RLS + policies
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read agent_tasks" ON public.agent_tasks;
CREATE POLICY "Public read agent_tasks" ON public.agent_tasks
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Auth write agent_tasks" ON public.agent_tasks;
CREATE POLICY "Auth write agent_tasks" ON public.agent_tasks
  FOR ALL TO authenticated USING (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS tr_agent_tasks_updated ON public.agent_tasks;
CREATE TRIGGER tr_agent_tasks_updated
  BEFORE UPDATE ON public.agent_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

SELECT '✅ agent_tasks table ready' AS status;
