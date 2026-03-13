-- 006_create_cold_outreach_tables.sql
-- Pending cold outreach queue + basic RLS for Mission Control

CREATE TABLE IF NOT EXISTS mc_cold_outreach_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name TEXT NOT NULL,
  contact_email TEXT,
  website TEXT,
  draft_subject TEXT NOT NULL,
  draft_body TEXT NOT NULL,
  brand TEXT NOT NULL CHECK (brand IN ('from_inception', 'lone_star_lighting')),
  sender_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'sent')),
  source_file TEXT,
  source_generated_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  denied_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  send_status TEXT NOT NULL DEFAULT 'not_sent' CHECK (send_status IN ('not_sent', 'ready', 'stubbed', 'sent', 'failed')),
  send_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS mc_cold_outreach_queue_brand_business_source_key
  ON mc_cold_outreach_queue (brand, business_name, source_file);

CREATE INDEX IF NOT EXISTS mc_cold_outreach_queue_status_idx
  ON mc_cold_outreach_queue (status, brand, created_at DESC);

ALTER TABLE mc_cold_outreach_queue REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE mc_cold_outreach_queue;

ALTER TABLE mc_cold_outreach_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read cold outreach queue" ON mc_cold_outreach_queue;
CREATE POLICY "Public read cold outreach queue"
  ON mc_cold_outreach_queue FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Auth write cold outreach queue" ON mc_cold_outreach_queue;
CREATE POLICY "Auth write cold outreach queue"
  ON mc_cold_outreach_queue FOR ALL TO authenticated USING (true);

CREATE OR REPLACE FUNCTION mc_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS mc_cold_outreach_queue_set_updated_at ON mc_cold_outreach_queue;
CREATE TRIGGER mc_cold_outreach_queue_set_updated_at
  BEFORE UPDATE ON mc_cold_outreach_queue
  FOR EACH ROW
  EXECUTE FUNCTION mc_set_updated_at();

SELECT '✅ Cold outreach queue ready' AS status;
