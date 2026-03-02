-- 003_enable_rls_policies.sql
-- Enable Row Level Security for core tables

-- Core tables RLS
ALTER TABLE mc_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE mc_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE mc_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE mc_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mc_api_costs ENABLE ROW LEVEL SECURITY;

-- Service role policies (for server-side operations)
CREATE POLICY "service_role_full_access_agents" ON mc_agents FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_full_access_leads" ON mc_leads FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_full_access_events" ON mc_events FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_full_access_tasks" ON mc_tasks FOR ALL TO service_role USING (true);
CREATE POLICY "service_role_full_access_costs" ON mc_api_costs FOR ALL TO service_role USING (true);

SELECT '✅ RLS policies enabled' AS status;
