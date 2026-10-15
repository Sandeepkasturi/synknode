CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created_profile AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

CREATE TABLE public.user_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  file_type text,
  file_size bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX user_files_owner_idx ON public.user_files(owner_id, created_at DESC);
GRANT SELECT, INSERT, DELETE ON public.user_files TO authenticated;
GRANT ALL ON public.user_files TO service_role;
ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own files read" ON public.user_files FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Own files insert" ON public.user_files FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id AND storage_path LIKE auth.uid()::text || '/%');
CREATE POLICY "Own files delete" ON public.user_files FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE OR REPLACE FUNCTION public.enforce_user_space_quota()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT COALESCE(SUM(file_size),0) FROM public.user_files WHERE owner_id = NEW.owner_id) + NEW.file_size > 2147483648 THEN
    RAISE EXCEPTION 'Storage limit of 2 GB reached';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER user_files_quota BEFORE INSERT ON public.user_files
  FOR EACH ROW EXECUTE FUNCTION public.enforce_user_space_quota();

CREATE TABLE public.device_presence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  device_label text NOT NULL,
  peer_code text NOT NULL,
  last_seen timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, device_label)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_presence TO authenticated;
GRANT ALL ON public.device_presence TO service_role;
ALTER TABLE public.device_presence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own devices all" ON public.device_presence FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

ALTER TABLE public.pending_transfers ADD COLUMN owner_id uuid, ADD COLUMN source_file_id uuid;