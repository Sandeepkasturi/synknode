CREATE TABLE IF NOT EXISTS public.system_heartbeat (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'cron',
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.system_heartbeat TO anon;
GRANT SELECT ON public.system_heartbeat TO authenticated;
GRANT ALL ON public.system_heartbeat TO service_role;

ALTER TABLE public.system_heartbeat ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Heartbeat is publicly readable" ON public.system_heartbeat;
CREATE POLICY "Heartbeat is publicly readable"
ON public.system_heartbeat FOR SELECT
USING (true);

CREATE OR REPLACE FUNCTION public.keep_backend_awake()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.system_heartbeat (source, note) VALUES ('cron', 'scheduled wake-up');
  DELETE FROM public.system_heartbeat WHERE created_at < now() - interval '7 days';
  PERFORM public.expire_stale_transfers();
END;
$$;

CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.unschedule('synknode-keep-awake')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'synknode-keep-awake');

SELECT cron.schedule(
  'synknode-keep-awake',
  '0 */2 * * *',
  $$SELECT public.keep_backend_awake();$$
);