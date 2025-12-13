-- Drop existing authorized_receivers data and add username/password columns
TRUNCATE TABLE public.authorized_receivers;

-- Add new columns for username/password auth
ALTER TABLE public.authorized_receivers 
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ALTER COLUMN phone_number DROP NOT NULL;

-- Insert the default admin user (Sandeep)
INSERT INTO public.authorized_receivers (username, password_hash, is_primary, phone_number)
VALUES ('Sandeep', 'Srgec@1526', true, NULL);

-- Update RLS policy to allow public read for login validation
DROP POLICY IF EXISTS "Authenticated users can view authorized receivers" ON public.authorized_receivers;

CREATE POLICY "Anyone can check credentials for login"
ON public.authorized_receivers
FOR SELECT
USING (true);

-- Keep admin management policy
DROP POLICY IF EXISTS "Admin can manage authorized receivers" ON public.authorized_receivers;