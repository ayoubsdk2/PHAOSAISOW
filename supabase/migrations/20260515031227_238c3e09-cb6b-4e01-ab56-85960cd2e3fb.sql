
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

CREATE POLICY "Admins can view roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Auto-grant admin to seddayoub77@gmail.com on signup
CREATE OR REPLACE FUNCTION public.grant_admin_to_ayoub()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) = 'seddayoub77@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_grant_ayoub
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.grant_admin_to_ayoub();

-- Snapshots
CREATE TABLE public.snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_type TEXT NOT NULL,           -- 'sow' | 'timeline'
  kind TEXT NOT NULL,               -- 'save' | 'submit' | 'archive' | 'clear' | 'auto' | 'migration' | 'timeline_save'
  person_name TEXT,
  browser_id TEXT,
  company_name TEXT,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert snapshots"
  ON public.snapshots FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view snapshots"
  ON public.snapshots FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE INDEX idx_snapshots_created_at ON public.snapshots (created_at DESC);
CREATE INDEX idx_snapshots_browser ON public.snapshots (browser_id);
CREATE INDEX idx_snapshots_doc_type ON public.snapshots (doc_type);
