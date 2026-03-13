-- 002_create_agent_tables.sql
-- Agent network schema
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,        -- e.g. 'atlas', 'vera'
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  tier INTEGER NOT NULL DEFAULT 4,  -- 1=executive, 2=lead, 3=specialist, 4=worker
  status TEXT NOT NULL DEFAULT 'idle', -- idle | active | busy | offline
  business_unit TEXT,               -- lone-star | redfox | heroes | from-inception | null=all
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | running | done | failed
  business_unit TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_business_unit ON agents(business_unit);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent_id ON agent_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);

-- RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "service_role_agents"
  ON agents FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "service_role_agent_tasks"
  ON agent_tasks FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed initial agent roster
INSERT INTO agents (slug, name, role, tier, status, business_unit) VALUES
  ('atlas',    'Atlas',    'Executive Coordinator',   1, 'active', NULL),
  ('nova',     'Nova',     'From Inception Lead',     2, 'active', 'from-inception'),
  ('vera',     'Vera',     'Lone Star Lead',          2, 'active', 'lone-star'),
  ('iris',     'Iris',     'RedFox Lead',             2, 'active', 'redfox'),
  ('scarlett', 'Scarlett', 'Heroes Lead',             2, 'active', 'heroes'),
  ('ruby',     'Ruby',     'Sales Specialist',        3, 'idle',   NULL),
  ('sierra',   'Sierra',   'Marketing Specialist',    3, 'idle',   NULL),
  ('scout',    'Scout',    'Research Specialist',     3, 'idle',   NULL),
  ('maverick', 'Maverick', 'DevOps Specialist',       3, 'idle',   NULL),
  ('barnes',   'Barnes',   'Documentation Agent',     4, 'idle',   NULL),
  ('pax',      'Pax',      'Communications Agent',    4, 'idle',   NULL),
  ('otis',     'Otis',     'Data Agent',              4, 'idle',   NULL),
  ('otto',     'Otto',     'Quality Agent',           4, 'idle',   NULL)
ON CONFLICT (slug) DO NOTHING;
