CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.mc_cold_outreach_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  contact_email text,
  website text,
  draft_subject text NOT NULL,
  draft_body text NOT NULL,
  brand text NOT NULL CHECK (brand IN ('from_inception', 'lone_star_lighting')),
  sender_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'sent')),
  source_file text,
  source_generated_at timestamptz,
  notes text,
  approved_at timestamptz,
  denied_at timestamptz,
  sent_at timestamptz,
  send_status text NOT NULL DEFAULT 'not_sent' CHECK (send_status IN ('not_sent', 'ready', 'stubbed', 'sent', 'failed')),
  send_error text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE UNIQUE INDEX IF NOT EXISTS mc_cold_outreach_queue_brand_business_source_idx
  ON public.mc_cold_outreach_queue (brand, business_name, source_file);

CREATE INDEX IF NOT EXISTS mc_cold_outreach_queue_brand_status_idx
  ON public.mc_cold_outreach_queue (brand, status, created_at DESC);

ALTER TABLE public.mc_cold_outreach_queue ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'mc_cold_outreach_queue'
      AND policyname = 'Allow anon authenticated read cold outreach queue'
  ) THEN
    CREATE POLICY "Allow anon authenticated read cold outreach queue"
      ON public.mc_cold_outreach_queue
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.set_mc_cold_outreach_queue_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mc_cold_outreach_queue_updated_at ON public.mc_cold_outreach_queue;

CREATE TRIGGER trg_mc_cold_outreach_queue_updated_at
BEFORE UPDATE ON public.mc_cold_outreach_queue
FOR EACH ROW
EXECUTE FUNCTION public.set_mc_cold_outreach_queue_updated_at();
