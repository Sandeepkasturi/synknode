-- Enhanced RPC function that includes all-time totals plus date-range metrics + live pending transfers
CREATE OR REPLACE FUNCTION public.get_analytics_enhanced(start_date timestamptz, end_date timestamptz)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    -- Date-range metrics (Nov 2024 onwards)
    'total_transfers',      (SELECT COUNT(*) FROM public.transfer_events WHERE created_at >= start_date AND created_at <= end_date),
    'total_bytes',          (SELECT COALESCE(SUM(file_size), 0) FROM public.transfer_events WHERE created_at >= start_date AND created_at <= end_date),
    'total_downloaded',     (SELECT COUNT(*) FROM public.transfer_events WHERE status = 'downloaded' AND created_at >= start_date AND created_at <= end_date),
    'unique_visitors',      (SELECT COUNT(DISTINCT visitor_id) FROM public.site_visits WHERE created_at >= start_date AND created_at <= end_date),
    -- All-time totals
    'all_time_files',       (SELECT COUNT(*) FROM public.transfer_events),
    'all_time_bytes',       (SELECT COALESCE(SUM(file_size), 0) FROM public.transfer_events),
    'all_time_downloaded',  (SELECT COUNT(*) FROM public.transfer_events WHERE status = 'downloaded'),
    'all_time_visitors',    (SELECT COUNT(DISTINCT visitor_id) FROM public.site_visits),
    -- Live data from queue
    'pending_files',        (SELECT COUNT(*) FROM public.pending_transfers WHERE downloaded = false),
    'pending_bytes',        (SELECT COALESCE(SUM(file_size), 0) FROM public.pending_transfers WHERE downloaded = false)
  );
$$;
GRANT EXECUTE ON FUNCTION public.get_analytics_enhanced(timestamptz, timestamptz) TO anon, authenticated;
