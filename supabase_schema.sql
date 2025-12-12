-- Create a table for user profiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  phone_number TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Create a table for user roles (admin, editor)
CREATE TABLE public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own roles
CREATE POLICY "Users can read own roles" 
ON public.user_roles FOR SELECT 
USING (auth.uid() = user_id);

-- Create a table for reserved receiver codes
CREATE TABLE public.reserved_codes (
  code TEXT PRIMARY KEY,
  allowed_role TEXT CHECK (role IN ('admin', 'editor')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on reserved_codes
ALTER TABLE public.reserved_codes ENABLE ROW LEVEL SECURITY;

-- Everyone can read reserved codes (to check validity)
CREATE POLICY "Everyone can read reserved codes" 
ON public.reserved_codes FOR SELECT 
TO authenticated
USING (true);

-- Insert the static code 'SRGEC' requiring 'admin' or 'editor' access
INSERT INTO public.reserved_codes (code, allowed_role, description)
VALUES ('SRGEC', 'editor', 'Reserved code for SRGEC Permanent Receiver')
ON CONFLICT (code) DO NOTHING;

-- Function to handle new user signup (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone_number)
  VALUES (new.id, new.phone);

  -- Auto-assign admin role to authorized numbers (e.g. +91 9919932723)
  -- Note: Supabase stores phones in E.164 format (e.g. +919919932723)
  IF new.phone = '+919919932723' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'admin');
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
