-- 007_enable_rls_policies.sql
-- Step 7: Enable Row Level Security

-- Enable RLS on all tables
ALTER TABLE mc_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE mc_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE mc_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE mc_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mc_api_costs ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous read access
CREATE POLICY "Public read agents" ON mc_agents FOR SELECT TO anon USING (true);
CREATE POLICY "Public read leads" ON mc_leads FOR SELECT TO anon USING (true);
CREATE POLICY "Public read events" ON mc_events FOR SELECT TO anon USING (true);
CREATE POLICY "Public read tasks" ON mc_tasks FOR SELECT TO anon USING (true);

-- Create policies for authenticated write access
CREATE POLICY "Auth write agents" ON mc_agents FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth write leads" ON mc_leads FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth write events" ON mc_events FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth write tasks" ON mc_tasks FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth write costs" ON mc_api_costs FOR ALL TO authenticated USING (true);

SELECT '✅ RLS policies enabled' as status;
