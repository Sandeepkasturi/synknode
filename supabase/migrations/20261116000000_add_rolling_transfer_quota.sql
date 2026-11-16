CREATE INDEX IF NOT EXISTS idx_transfer_events_sender_time
  ON public.transfer_events (sender_name, created_at DESC);

CREATE OR REPLACE FUNCTION public.check_sender_daily_quota(
  p_sender_name text,
  p_new_bytes bigint,
  p_daily_limit_gb integer DEFAULT 50
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_used_bytes bigint;
  v_limit_bytes bigint;
  v_available_bytes bigint;
BEGIN
  IF p_sender_name IS NULL OR length(btrim(p_sender_name)) = 0
    OR p_new_bytes IS NULL OR p_new_bytes < 0
    OR p_daily_limit_gb IS NULL OR p_daily_limit_gb < 50 OR p_daily_limit_gb > 100 THEN
    RAISE EXCEPTION 'Invalid quota request';
  END IF;

  v_limit_bytes := p_daily_limit_gb::bigint * 1024 * 1024 * 1024;

  SELECT COALESCE(SUM(file_size), 0)::bigint
    INTO v_used_bytes
    FROM public.transfer_events
    WHERE sender_name = btrim(p_sender_name)
      AND created_at >= pg_catalog.now() - interval '24 hours';

  v_available_bytes := GREATEST(0, v_limit_bytes - v_used_bytes);

  RETURN pg_catalog.jsonb_build_object(
    'allowed', v_used_bytes + p_new_bytes <= v_limit_bytes,
    'used_bytes', v_used_bytes,
    'available_bytes', v_available_bytes,
    'limit_bytes', v_limit_bytes,
    'requested_bytes', p_new_bytes
  );
END;
$$;

REVOKE ALL ON FUNCTION public.check_sender_daily_quota(text, bigint, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_sender_daily_quota(text, bigint, integer) TO anon, authenticated;
