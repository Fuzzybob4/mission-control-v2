-- 004_create_projects_table.sql
-- Active projects tracking per business unit
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  business_unit TEXT NOT NULL,     -- lone-star | redfox | heroes | from-inception
  status TEXT NOT NULL DEFAULT 'in-dev', -- live | in-dev | on-hold | pending
  tech_stack TEXT[],               -- ['Next.js', 'Supabase']
  description TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_projects_business_unit ON projects(business_unit);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "service_role_projects"
  ON projects FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed initial projects
INSERT INTO projects (name, business_unit, status, tech_stack, description) VALUES
  ('Lone Star Lighting Displays', 'lone-star', 'live',     ARRAY['Next.js', 'Supabase', 'RedFox CRM'],  'Main business website and quoting system'),
  ('2025 Install Season',          'lone-star', 'on-hold',  ARRAY['Operations'],                         'Nov 2025 – Jan 2026 install season'),
  ('RedFox CRM — Core Build',      'redfox',    'in-dev',   ARRAY['Next.js', 'PostgreSQL', 'Supabase'],  'Custom CRM platform core development'),
  ('Beta Onboarding (Lone Star)',   'redfox',    'pending',  ARRAY['Integration'],                        'First live customer integration pilot'),
  ('Heroes of the Meta — Marketplace', 'heroes', 'on-hold', ARRAY['React', 'Node.js'],                  'Trading card marketplace — paused until other businesses stable'),
  ('From Inception — Studio Site', 'from-inception', 'in-dev', ARRAY['Next.js', 'Vercel'],              'Web development studio public site'),
  ('Lone Star Lighting (client build)', 'from-inception', 'live', ARRAY['Next.js', 'Supabase'],         'Client project: Lone Star website'),
  ('RedFox CRM (client build)',    'from-inception', 'in-dev', ARRAY['Next.js', 'PostgreSQL'],          'Client project: RedFox CRM platform')
ON CONFLICT DO NOTHING;
