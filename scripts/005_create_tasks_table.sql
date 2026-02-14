-- 005_create_tasks_table.sql
-- Step 5: Create tasks table

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

-- Enable realtime
ALTER TABLE mc_tasks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE mc_tasks;

-- Insert sample tasks
INSERT INTO mc_tasks (title, status, priority, assigned_agent_id, due_date, business_unit) VALUES 
  ('Follow up with Alora Hess', 'queued', 'high', 'vera', '2026-02-20', 'lone_star'),
  ('Fix v0 deployment', 'completed', 'high', 'maverick', null, 'shared')
ON CONFLICT DO NOTHING;

SELECT '✅ Tasks table created' as status;
