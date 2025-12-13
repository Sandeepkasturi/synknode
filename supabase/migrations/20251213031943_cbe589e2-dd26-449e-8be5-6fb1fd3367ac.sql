-- Create storage bucket for temporary file transfers
INSERT INTO storage.buckets (id, name, public)
VALUES ('pending-files', 'pending-files', false);

-- Create table to track pending file transfers
CREATE TABLE public.pending_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  downloaded BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.pending_transfers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (senders)
CREATE POLICY "Anyone can insert pending transfers"
ON public.pending_transfers
FOR INSERT
WITH CHECK (true);

-- Allow anyone to read pending transfers (receiver)
CREATE POLICY "Anyone can read pending transfers"
ON public.pending_transfers
FOR SELECT
USING (true);

-- Allow anyone to update (mark as downloaded)
CREATE POLICY "Anyone can update pending transfers"
ON public.pending_transfers
FOR UPDATE
USING (true);

-- Allow anyone to delete (cleanup after download)
CREATE POLICY "Anyone can delete pending transfers"
ON public.pending_transfers
FOR DELETE
USING (true);

-- Storage policies for pending-files bucket
CREATE POLICY "Anyone can upload to pending-files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'pending-files');

CREATE POLICY "Anyone can read from pending-files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'pending-files');

CREATE POLICY "Anyone can delete from pending-files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'pending-files');