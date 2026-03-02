-- 012_create_agent_discussions_table.sql
-- Threaded agent discussions + mention intelligence

CREATE TABLE IF NOT EXISTS public.agent_discussions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id TEXT NOT NULL REFERENCES mc_agents(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.agent_discussions(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.agent_tasks(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  mentions TEXT[] DEFAULT ARRAY[]::TEXT[],
  attachments JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_discussions_agent ON public.agent_discussions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_discussions_task ON public.agent_discussions(task_id);
CREATE INDEX IF NOT EXISTS idx_agent_discussions_parent ON public.agent_discussions(parent_id);
CREATE INDEX IF NOT EXISTS idx_agent_discussions_created ON public.agent_discussions(created_at DESC);

ALTER TABLE public.agent_discussions REPLICA IDENTITY FULL;
DO $$
BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE agent_discussions';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.agent_discussions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read agent_discussions" ON public.agent_discussions;
CREATE POLICY "Public read agent_discussions" ON public.agent_discussions
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Auth write agent_discussions" ON public.agent_discussions;
CREATE POLICY "Auth write agent_discussions" ON public.agent_discussions
  FOR ALL TO authenticated USING (true);

DROP TRIGGER IF EXISTS tr_agent_discussions_updated ON public.agent_discussions;
CREATE TRIGGER tr_agent_discussions_updated
  BEFORE UPDATE ON public.agent_discussions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at_timestamp();

-- Rich views for UI consumption
CREATE OR REPLACE VIEW public.agent_discussions_with_agents AS
SELECT
  ad.id,
  ad.agent_id,
  ad.parent_id,
  ad.task_id,
  ad.content,
  ad.mentions,
  ad.attachments,
  ad.created_at,
  ad.updated_at,
  ma.name AS agent_name,
  ma.role AS agent_role,
  ma.status AS agent_status
FROM public.agent_discussions ad
JOIN public.mc_agents ma ON ad.agent_id = ma.id
ORDER BY ad.created_at DESC;

CREATE OR REPLACE VIEW public.agent_discussion_threads AS
SELECT
  ad.id,
  ad.agent_id,
  ad.content,
  ad.created_at,
  ma.name AS agent_name,
  ma.role AS agent_role,
  COUNT(reply.id) AS reply_count
FROM public.agent_discussions ad
JOIN public.mc_agents ma ON ad.agent_id = ma.id
LEFT JOIN public.agent_discussions reply ON reply.parent_id = ad.id
WHERE ad.parent_id IS NULL
GROUP BY ad.id, ad.agent_id, ad.content, ad.created_at, ma.name, ma.role
ORDER BY ad.created_at DESC;

-- Mention helper functions
CREATE OR REPLACE FUNCTION public.extract_agent_mentions(content_text TEXT)
RETURNS TABLE(agent_id TEXT, agent_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT ma.id, ma.name
  FROM public.mc_agents ma
  WHERE content_text ILIKE '%' || '@' || ma.name || '%';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.get_discussions_with_mentions(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  agent_id TEXT,
  agent_name TEXT,
  agent_role TEXT,
  parent_id UUID,
  content TEXT,
  mentions TEXT[],
  mention_names TEXT[],
  attachments JSONB,
  created_at TIMESTAMPTZ,
  reply_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ad.id,
    ad.agent_id,
    ma.name,
    ma.role,
    ad.parent_id,
    ad.content,
    ad.mentions,
    ARRAY(
      SELECT ma2.name
      FROM public.mc_agents ma2
      WHERE ma2.id = ANY(ad.mentions)
    ) AS mention_names,
    ad.attachments,
    ad.created_at,
    COUNT(reply.id) AS reply_count
  FROM public.agent_discussions ad
  JOIN public.mc_agents ma ON ad.agent_id = ma.id
  LEFT JOIN public.agent_discussions reply ON reply.parent_id = ad.id
  GROUP BY ad.id, ad.agent_id, ma.name, ma.role, ad.parent_id, ad.content, ad.mentions, ad.attachments, ad.created_at
  ORDER BY ad.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Seed the canonical Otis thread if it is missing
INSERT INTO public.agent_discussions (agent_id, content, mentions, created_at)
SELECT 'otis', 'Just pushed the vault edit functionality. @atlas can you test it?', ARRAY['atlas'], NOW() - INTERVAL '2 hours'
WHERE NOT EXISTS (
  SELECT 1 FROM public.agent_discussions WHERE content ILIKE '%vault edit functionality%'
);

SELECT '✅ agent_discussions table ready' AS status;
