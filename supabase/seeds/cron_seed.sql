-- supabase/seeds/cron_seed.sql
-- Sample data so the Mission Control dashboard renders meaningful defaults after `supabase db reset`.

INSERT INTO public.mc_cron_jobs (id, name, schedule, timezone, target, enabled)
VALUES
  ('da16653a-573f-431b-859c-1cff64b5a234', 'Mission Control Sync', '*/15 * * * *', 'America/Chicago', 'main', TRUE),
  ('0e380d77-7322-4b84-8866-b53c0294b226', 'Daily Briefing Dispatch', '35 8 * * 1-5', 'America/Chicago', 'isolated', TRUE),
  ('e12cd280-74f1-4638-9c52-a291c8ef2f03', 'Nightly Lead Audit', '5 22 * * *', 'America/Chicago', 'main', TRUE)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.mc_agents (id, name, gateway_online, last_checked, last_success, failure_streak, last_error)
VALUES
  ('f1baf8d0-3116-4c8b-9137-1fbd1f579fd7', 'Atlas Gateway', TRUE, NOW(), NOW(), 0, NULL),
  ('23c6a5b4-0b1a-40f0-a42a-9d76fb191aa9', 'Vera Ops Terminal', TRUE, NOW() - INTERVAL '2 minutes', NOW() - INTERVAL '40 minutes', 1, NULL),
  ('46535421-f354-4a72-b82b-02a6c8829e3b', 'Scout Research Node', FALSE, NOW() - INTERVAL '5 minutes', NOW() - INTERVAL '90 minutes', 3, 'Lost heartbeat during Firecrawl sweep')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.mc_pending_skills (id, name, description, category, install_command, status, requested_by, decision_at)
VALUES
  ('f696436d-ec2d-4bda-a53d-b96f9c9431fa', 'Mission Watchtower', 'Realtime alerting + escalation when cron failures pile up.', 'Operations', 'pnpm openclaw skill install mission-watchtower', 'pending', 'Kal', NULL),
  ('e0e09fe1-6762-453b-ab6e-7a1b9293fc36', 'Daily Briefing Composer', 'Auto-compile morning summary with leads, ops notes, and weather.', 'Reporting', 'pnpm openclaw skill install daily-briefing', 'pending', 'Kal', NULL),
  ('34949022-3b69-44f5-a733-5d3bf0ff1970', 'Red Team Recon Pack', 'Sandboxed recon agent for competitive intelligence drops.', 'Research', 'pnpm openclaw skill install red-team-recon', 'pending', 'Kal', NULL)
ON CONFLICT (id) DO NOTHING;
