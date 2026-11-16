BEGIN;

CREATE TABLE IF NOT EXISTS public.transfer_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name text NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL CHECK (file_size >= 0),
  file_type text,
  status text NOT NULL DEFAULT 'uploaded',
  visitor_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transfer_events ADD COLUMN IF NOT EXISTS visitor_id text;
ALTER TABLE public.transfer_events ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.transfer_events TO anon, authenticated;
GRANT ALL ON public.transfer_events TO service_role;

DROP POLICY IF EXISTS transfer_events_insert_all ON public.transfer_events;
CREATE POLICY transfer_events_insert_all ON public.transfer_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS transfer_events_select_all ON public.transfer_events;
CREATE POLICY transfer_events_select_all ON public.transfer_events
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS transfer_events_update_all ON public.transfer_events;
CREATE POLICY transfer_events_update_all ON public.transfer_events
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS transfer_events_created_idx
  ON public.transfer_events (created_at DESC);
CREATE INDEX IF NOT EXISTS transfer_events_visitor_time_idx
  ON public.transfer_events (visitor_id, created_at DESC)
  WHERE status = 'uploaded';

CREATE TABLE IF NOT EXISTS public.site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.site_visits TO anon, authenticated;
GRANT ALL ON public.site_visits TO service_role;
DROP POLICY IF EXISTS site_visits_insert_all ON public.site_visits;
CREATE POLICY site_visits_insert_all ON public.site_visits
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS site_visits_select_all ON public.site_visits;
CREATE POLICY site_visits_select_all ON public.site_visits
  FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS site_visits_visitor_idx ON public.site_visits (visitor_id);
CREATE INDEX IF NOT EXISTS site_visits_created_idx ON public.site_visits (created_at DESC);

DROP FUNCTION IF EXISTS public.check_sender_daily_quota(text, bigint, integer);
DROP FUNCTION IF EXISTS public.check_visitor_transfer_quota(text, bigint);
CREATE FUNCTION public.check_visitor_transfer_quota(
  p_visitor_id text,
  p_new_bytes bigint DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_limit_bytes constant bigint := 5368709120;
  v_used_bytes bigint;
  v_next_reset_at timestamptz;
BEGIN
  IF p_visitor_id IS NULL OR p_visitor_id !~ '^[0-9a-fA-F-]{36}$'
    OR p_new_bytes IS NULL OR p_new_bytes < 0 THEN
    RAISE EXCEPTION 'Invalid quota request';
  END IF;

  SELECT COALESCE(SUM(te.file_size), 0)::bigint,
         MIN(te.created_at + interval '24 hours')
    INTO v_used_bytes, v_next_reset_at
    FROM public.transfer_events AS te
    WHERE te.visitor_id = p_visitor_id
      AND te.status = 'uploaded'
      AND te.created_at > pg_catalog.now() - interval '24 hours';

  RETURN pg_catalog.jsonb_build_object(
    'allowed', p_new_bytes <= GREATEST(0, v_limit_bytes - v_used_bytes),
    'used_bytes', v_used_bytes,
    'remaining_bytes', GREATEST(0, v_limit_bytes - v_used_bytes),
    'limit_bytes', v_limit_bytes,
    'requested_bytes', p_new_bytes,
    'next_reset_at', v_next_reset_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.check_visitor_transfer_quota(text, bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_visitor_transfer_quota(text, bigint) TO anon, authenticated;

COMMIT;
