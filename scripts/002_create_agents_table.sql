-- 002_create_agents_table.sql
-- Step 2: Create the 13-agent hierarchy

CREATE TABLE IF NOT EXISTS mc_agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  tier INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 4),
  status TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'active', 'busy', 'error', 'offline')),
  description TEXT,
  task_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 100.00,
  last_active TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the 13 agents
INSERT INTO mc_agents (id, name, role, tier, status, description) VALUES 
  ('atlas', 'Atlas', 'Executive Coordinator', 1, 'active', 'Executive coordinator managing all business operations'),
  ('vera', 'Vera', 'Lone Star Lead', 2, 'active', 'Holiday lighting business operations'),
  ('iris', 'Iris', 'RedFox Lead', 2, 'active', 'CRM SaaS development'),
  ('scarlett', 'Scarlett', 'Heroes Lead', 2, 'active', 'Trading card marketplace'),
  ('ruby', 'Ruby', 'Sales Specialist', 3, 'idle', 'Lead qualification'),
  ('sierra', 'Sierra', 'Marketing Specialist', 3, 'idle', 'Content creation'),
  ('scout', 'Scout', 'Research Specialist', 3, 'idle', 'Market research'),
  ('maverick', 'Maverick', 'DevOps Specialist', 3, 'idle', 'Infrastructure automation'),
  ('barnes', 'Barnes', 'Documentation Agent', 4, 'idle', 'SOP creation'),
  ('pax', 'Pax', 'Communications Agent', 4, 'idle', 'Email coordination'),
  ('otis', 'Otis', 'Data Agent', 4, 'idle', 'Data entry and reporting'),
  ('otto', 'Otto', 'Quality Agent', 4, 'idle', 'Testing and QA')
ON CONFLICT (id) DO NOTHING;

-- Enable realtime
ALTER TABLE mc_agents REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE mc_agents;

SELECT '✅ Agents table created with 13 agents' as status;
