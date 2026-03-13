-- 002_create_core_tables.sql
-- Step 2: Create all Mission Control core tables plus seed data

-- === Agents ===============================================================
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

INSERT INTO mc_agents (id, name, role, tier, status, description) VALUES 
  ('atlas', 'Atlas', 'Executive Coordinator', 1, 'active', 'Executive coordinator managing all business operations'),
  ('nova', 'Nova', 'From Inception Lead', 2, 'active', 'Web agency pipeline and client delivery'),
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

ALTER TABLE mc_agents REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE mc_agents;


-- === Leads ================================================================
CREATE TABLE IF NOT EXISTS mc_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  address TEXT,
  property_type TEXT CHECK (property_type IN ('residential', 'commercial', 'hoa', 'municipal')),
  estimated_value DECIMAL(10,2),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'accepted', 'scheduled', 'completed', 'lost', 'spam')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  source TEXT,
  notes TEXT,
  follow_up_date DATE,
  business_unit TEXT DEFAULT 'lone_star' CHECK (business_unit IN ('lone_star', 'redfox', 'heroes', 'shared')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO mc_leads (name, email, company, estimated_value, status, priority, notes, follow_up_date, business_unit) VALUES 
  ('Alora Hess', 'alora.hess@cbre.com', 'CBRE - Bee Cave Galleria', 18000, 'quoted', 'high', 'Commercial property quote $17-19K. Follow up Feb 20.', '2026-02-20', 'lone_star')
ON CONFLICT DO NOTHING;

ALTER TABLE mc_leads REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE mc_leads;


-- === Events ===============================================================
CREATE TABLE IF NOT EXISTS mc_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level TEXT DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warn', 'error', 'critical')),
  source TEXT NOT NULL CHECK (source IN ('atlas', 'agent', 'system', 'user')),
  agent_id TEXT REFERENCES mc_agents(id),
  message TEXT NOT NULL,
  business_unit TEXT CHECK (business_unit IN ('lone_star', 'redfox', 'heroes', 'shared')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO mc_events (level, source, agent_id, message, business_unit) VALUES 
  ('info', 'agent', 'atlas', 'Mission Control v2 deployed successfully', 'shared'),
  ('info', 'agent', 'vera', 'New lead: Alora Hess (CBRE) - $18K pipeline', 'lone_star'),
  ('info', 'system', null, 'Database initialized', 'shared')
ON CONFLICT DO NOTHING;

ALTER TABLE mc_events REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE mc_events;


-- === Tasks ================================================================
CREATE TABLE IF NOT EXISTS mc_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'in_progress', 'completed', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_agent_id TEXT REFERENCES mc_agents(id),
  business_unit TEXT CHECK (business_unit IN ('lone_star', 'redfox', 'heroes', 'shared')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE
);

INSERT INTO mc_tasks (title, status, priority, assigned_agent_id, due_date, business_unit) VALUES 
  ('Follow up with Alora Hess', 'queued', 'high', 'vera', '2026-02-20', 'lone_star'),
  ('Fix v0 deployment', 'completed', 'high', 'maverick', null, 'shared')
ON CONFLICT DO NOTHING;

ALTER TABLE mc_tasks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE mc_tasks;


-- === API Costs ============================================================
CREATE TABLE IF NOT EXISTS mc_api_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL CHECK (provider IN ('kimi', 'openai', 'brave', 'supabase')),
  tokens_in INTEGER DEFAULT 0,
  tokens_out INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,6) DEFAULT 0,
  business_unit TEXT CHECK (business_unit IN ('lone_star', 'redfox', 'heroes', 'shared')),
  agent_id TEXT REFERENCES mc_agents(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE mc_api_costs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE mc_api_costs;


SELECT '✅ Core tables ready' AS status;
