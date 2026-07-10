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

GRANT EXECUTE ON FUNCTION public.ensure_admin_for_ayoub() TO authenticated;

-- Backfill: grant admin role to any existing seddayoub77@gmail.com user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE lower(email) = 'seddayoub77@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;