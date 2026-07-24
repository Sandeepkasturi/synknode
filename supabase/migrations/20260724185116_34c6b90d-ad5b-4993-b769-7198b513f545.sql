
CREATE TABLE IF NOT EXISTS public.site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.site_visits TO anon, authenticated;
GRANT ALL ON public.site_visits TO service_role;
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_visits_insert_all" ON public.site_visits FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "site_visits_select_all" ON public.site_visits FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS site_visits_visitor_idx ON public.site_visits(visitor_id);
CREATE INDEX IF NOT EXISTS site_visits_created_idx ON public.site_visits(created_at DESC);

CREATE TABLE IF NOT EXISTS public.transfer_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name text NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text,
  status text NOT NULL DEFAULT 'uploaded',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.transfer_events TO anon, authenticated;
GRANT ALL ON public.transfer_events TO service_role;
ALTER TABLE public.transfer_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transfer_events_insert_all" ON public.transfer_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "transfer_events_select_all" ON public.transfer_events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "transfer_events_update_all" ON public.transfer_events FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS transfer_events_created_idx ON public.transfer_events(created_at DESC);

CREATE OR REPLACE FUNCTION public.get_site_analytics()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'total_transfers',  (SELECT COUNT(*) FROM public.transfer_events),
    'total_bytes',      (SELECT COALESCE(SUM(file_size), 0) FROM public.transfer_events),
    'total_downloaded', (SELECT COUNT(*) FROM public.transfer_events WHERE status = 'downloaded'),
    'active_transfers', (SELECT COUNT(*) FROM public.pending_transfers WHERE downloaded = false),
    'unique_visitors',  (SELECT COUNT(DISTINCT visitor_id) FROM public.site_visits),
    'total_visits',     (SELECT COUNT(*) FROM public.site_visits),
    'visitors_24h',     (SELECT COUNT(DISTINCT visitor_id) FROM public.site_visits WHERE created_at > now() - interval '24 hours')
  );
$$;
GRANT EXECUTE ON FUNCTION public.get_site_analytics() TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.expire_stale_transfers()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE expired_count integer := 0;
BEGIN
  WITH expired AS (
    DELETE FROM public.pending_transfers
    WHERE downloaded = false AND created_at < now() - interval '60 hours'
    RETURNING file_name, file_size, file_type, sender_name
  )
  INSERT INTO public.transfer_events (sender_name, file_name, file_size, file_type, status)
  SELECT sender_name, file_name, file_size, file_type, 'expired' FROM expired;
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$;
GRANT EXECUTE ON FUNCTION public.expire_stale_transfers() TO anon, authenticated, service_role;

ALTER PUBLICATION supabase_realtime ADD TABLE public.site_visits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transfer_events;
