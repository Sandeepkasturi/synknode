-- Enable realtime for pending_transfers table
ALTER TABLE public.pending_transfers REPLICA IDENTITY FULL;

-- Add table to realtime publication if not already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'pending_transfers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pending_transfers;
  END IF;
END $$;