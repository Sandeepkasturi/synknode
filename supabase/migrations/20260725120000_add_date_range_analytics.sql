-- Create new RPC function for date-range analytics (e.g., 2025-2026)
CREATE OR REPLACE FUNCTION public.get_analytics_by_date_range(start_date timestamptz, end_date timestamptz)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'total_transfers',  (SELECT COUNT(*) FROM public.transfer_events WHERE created_at >= start_date AND created_at <= end_date),
    'total_bytes',      (SELECT COALESCE(SUM(file_size), 0) FROM public.transfer_events WHERE created_at >= start_date AND created_at <= end_date),
    'total_downloaded', (SELECT COUNT(*) FROM public.transfer_events WHERE status = 'downloaded' AND created_at >= start_date AND created_at <= end_date),
    'unique_visitors',  (SELECT COUNT(DISTINCT visitor_id) FROM public.site_visits WHERE created_at >= start_date AND created_at <= end_date),
    'total_visits',     (SELECT COUNT(*) FROM public.site_visits WHERE created_at >= start_date AND created_at <= end_date)
  );
$$;
GRANT EXECUTE ON FUNCTION public.get_analytics_by_date_range(timestamptz, timestamptz) TO anon, authenticated;
