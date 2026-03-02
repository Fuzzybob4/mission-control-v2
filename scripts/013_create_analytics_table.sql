-- 013_create_analytics_table.sql
-- Unified analytics metrics from Mission Control + Ops dashboards

-- Ensure enum for metric typing exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'analytics_metric_type'
  ) THEN
    CREATE TYPE analytics_metric_type AS ENUM (
      'revenue_stripe',
      'revenue_gumroad',
      'revenue_total',
      'cost_ai_apis',
      'cost_hosting',
      'cost_total',
      'profit_margin',
      'leads_generated',
      'leads_contacted',
      'conversion_rate',
      'email_open_rate',
      'email_click_rate',
      'website_visitors',
      'user_signups',
      'active_users',
      'churn_rate',
      'agent_tasks_completed',
      'agent_credits_used',
      'agent_efficiency',
      'custom'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_type analytics_metric_type NOT NULL,
  business_unit TEXT CHECK (business_unit IN ('lone_star','redfox','heroes','shared')),
  business_id UUID,
  value NUMERIC(18,4) NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_business_unit ON public.analytics(business_unit);
CREATE INDEX IF NOT EXISTS idx_analytics_metric_type ON public.analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_analytics_recorded_at ON public.analytics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_metric_time ON public.analytics(metric_type, recorded_at DESC);

ALTER TABLE public.analytics REPLICA IDENTITY FULL;
DO $$
BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE analytics';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read analytics" ON public.analytics;
CREATE POLICY "Public read analytics" ON public.analytics
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Auth write analytics" ON public.analytics;
CREATE POLICY "Auth write analytics" ON public.analytics
  FOR ALL TO authenticated USING (true);

-- Seed baseline metrics so dashboards light up immediately
INSERT INTO public.analytics (metric_type, business_unit, value, metadata)
VALUES
  ('revenue_stripe', 'lone_star', 18000, '{"label": "Q4 bookings"}'),
  ('cost_ai_apis', 'redfox', 85.00, '{"window": "24h"}'),
  ('leads_generated', 'lone_star', 47, '{"source": "door hangers"}'),
  ('agent_tasks_completed', 'shared', 156, '{"agent": "otis"}'),
  ('website_visitors', 'heroes', 342, '{"source": "organic"}')
ON CONFLICT DO NOTHING;

SELECT '✅ analytics table ready' AS status;
