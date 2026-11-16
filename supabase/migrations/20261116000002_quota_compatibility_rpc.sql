CREATE OR REPLACE FUNCTION public.check_sender_daily_quota(
  p_sender_name text,
  p_new_bytes bigint,
  p_daily_limit_gb integer DEFAULT 5
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF p_daily_limit_gb IS DISTINCT FROM 5 THEN
    RAISE EXCEPTION 'The transfer quota is fixed at 5 GiB';
  END IF;

  v_result := public.check_visitor_transfer_quota(p_sender_name, p_new_bytes);
  RETURN v_result || pg_catalog.jsonb_build_object(
    'available_bytes', v_result -> 'remaining_bytes'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.check_sender_daily_quota(text, bigint, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_sender_daily_quota(text, bigint, integer) TO anon, authenticated;
