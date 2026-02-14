-- 000_reset_database.sql
-- DANGER: This deletes ALL data! Use with caution.
-- Run this to completely reset your Supabase database

-- Disable RLS first (to avoid permission issues)
ALTER TABLE IF EXISTS mc_agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS mc_leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS mc_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS mc_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS mc_api_costs DISABLE ROW LEVEL SECURITY;

-- Drop tables with CASCADE (removes policies, triggers, etc.)
DROP TABLE IF EXISTS mc_api_costs CASCADE;
DROP TABLE IF EXISTS mc_tasks CASCADE;
DROP TABLE IF EXISTS mc_events CASCADE;
DROP TABLE IF EXISTS mc_leads CASCADE;
DROP TABLE IF EXISTS mc_agents CASCADE;

-- Drop any remaining functions or types we created
-- (Supabase keeps some internal ones, that's OK)

-- Reset realtime publication
DO $$
BEGIN
    -- Try to remove tables from realtime (ignore if not exists)
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE mc_agents;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE mc_leads;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE mc_events;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    BEGIN
        ALTER PUBLICATION supabase_realtime DROP TABLE mc_tasks;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
END $$;

SELECT '✅ All Mission Control tables deleted. Database is clean.' as status;
SELECT 'Now run scripts 001-007 to recreate tables.' as next_step;
