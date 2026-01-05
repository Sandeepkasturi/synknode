-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can delete pending transfers" ON public.pending_transfers;
DROP POLICY IF EXISTS "Anyone can insert pending transfers" ON public.pending_transfers;
DROP POLICY IF EXISTS "Anyone can read pending transfers" ON public.pending_transfers;
DROP POLICY IF EXISTS "Anyone can update pending transfers" ON public.pending_transfers;

-- Recreate as permissive policies (PERMISSIVE is the default)
CREATE POLICY "Allow all insert on pending_transfers" 
ON public.pending_transfers 
FOR INSERT 
TO public
WITH CHECK (true);

CREATE POLICY "Allow all select on pending_transfers" 
ON public.pending_transfers 
FOR SELECT 
TO public
USING (true);

CREATE POLICY "Allow all update on pending_transfers" 
ON public.pending_transfers 
FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all delete on pending_transfers" 
ON public.pending_transfers 
FOR DELETE 
TO public
USING (true);