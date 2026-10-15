CREATE OR REPLACE FUNCTION public.expire_stale_transfers()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE expired_count integer := 0;
BEGIN
  WITH expired AS (
    DELETE FROM public.pending_transfers
    WHERE created_at < now() - interval '3 days'
    RETURNING file_name, file_size, file_type, sender_name
  )
  INSERT INTO public.transfer_events (sender_name, file_name, file_size, file_type, status)
  SELECT sender_name, file_name, file_size, file_type, 'expired' FROM expired;
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$function$;