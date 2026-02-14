-- 004_create_events_table.sql
-- Step 4: Create heartbeat/events table

CREATE TABLE IF NOT EXISTS mc_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level TEXT DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warn', 'error', 'critical')),
  source TEXT NOT NULL CHECK (source IN ('atlas', 'agent', 'system', 'user')),
  agent_id TEXT REFERENCES mc_agents(id),
  message TEXT NOT NULL,
  business_unit TEXT CHECK (business_unit IN ('lone_star', 'redfox', 'heroes', 'shared')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime
ALTER TABLE mc_events REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE mc_events;

-- Insert sample events
INSERT INTO mc_events (level, source, agent_id, message, business_unit) VALUES 
  ('info', 'agent', 'atlas', 'Mission Control v2 deployed successfully', 'shared'),
  ('info', 'agent', 'vera', 'New lead: Alora Hess (CBRE) - $18K pipeline', 'lone_star'),
  ('success', 'system', null, 'Database initialized', 'shared')
ON CONFLICT DO NOTHING;

SELECT '✅ Events table created' as status;
