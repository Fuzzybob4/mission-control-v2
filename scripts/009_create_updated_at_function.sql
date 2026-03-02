-- 009_create_updated_at_function.sql
-- Shared trigger helper to keep updated_at columns accurate

CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

SELECT '✅ set_updated_at_timestamp() function ready' AS status;
