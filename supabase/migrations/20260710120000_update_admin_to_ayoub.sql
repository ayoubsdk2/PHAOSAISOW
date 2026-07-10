-- 1. Drop the old trigger and functions
DROP TRIGGER IF EXISTS on_auth_user_created_grant_daniel ON auth.users;
DROP FUNCTION IF EXISTS public.grant_admin_to_daniel();
DROP FUNCTION IF EXISTS public.ensure_admin_for_daniel();

-- 2. Create the new function for auto-grant
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

-- 3. Create the new trigger
CREATE TRIGGER on_auth_user_created_grant_ayoub
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.grant_admin_to_ayoub();

-- 4. Create the new ensure_admin function
CREATE OR REPLACE FUNCTION public.ensure_admin_for_ayoub()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_uid uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN RETURN; END IF;
  SELECT email INTO v_email FROM auth.users WHERE id = v_uid;
  IF lower(v_email) = 'seddayoub77@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;

-- 5. Permissions
REVOKE ALL ON FUNCTION public.grant_admin_to_ayoub() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_admin_for_ayoub() TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.ensure_admin_for_ayoub() FROM PUBLIC, anon;

-- 6. Backfill role for the new user if they already signed up
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE lower(email) = 'seddayoub77@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
