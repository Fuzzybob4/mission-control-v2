-- 003_create_analytics_tables.sql
-- Analytics and usage metrics schema
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,       -- e.g. 'api_call', 'token_use', 'page_view'
  business_unit TEXT,             -- lone-star | redfox | heroes | from-inception | null=global
  model TEXT,                     -- openai/gpt-4o, anthropic/claude-opus, etc.
  tokens_used INTEGER DEFAULT 0,
  cost_usd NUMERIC(10, 6) DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_daily_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  business_unit TEXT,
  total_tokens INTEGER DEFAULT 0,
  total_cost_usd NUMERIC(10, 4) DEFAULT 0,
  total_api_calls INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, business_unit)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_business_unit ON analytics_events(business_unit);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_date ON analytics_daily_summary(date DESC);

-- RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "service_role_analytics_events"
  ON analytics_events FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "service_role_analytics_daily"
  ON analytics_daily_summary FOR ALL TO service_role USING (true) WITH CHECK (true);
