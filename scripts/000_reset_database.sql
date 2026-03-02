-- 000_reset_database.sql
-- ⚠️ DANGER: This drops ALL Mission Control tables. Use only for fresh setup.

DROP TABLE IF EXISTS mc_api_costs CASCADE;
DROP TABLE IF EXISTS mc_tasks CASCADE;
DROP TABLE IF EXISTS mc_events CASCADE;
DROP TABLE IF EXISTS mc_leads CASCADE;
DROP TABLE IF EXISTS mc_agents CASCADE;
DROP TABLE IF EXISTS vault_audit_log CASCADE;
DROP TABLE IF EXISTS vault_credentials CASCADE;
DROP TABLE IF EXISTS vault_metadata CASCADE;

SELECT 'Database reset complete' AS status;
