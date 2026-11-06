-- 010: corregir politica admin de profiles sin recursión RLS (C-06)
-- Sustituye la política "Admins can update profiles" de 004 que tenía
-- subconsulta a public.profiles en WITH CHECK (riesgo de recursión infinita).
-- Idempotente.

-- Asegurar función is_admin() (SECURITY DEFINER, sin recursión)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Recrear política admin de profiles SIN subconsulta a profiles
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
ON public.profiles FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Guard anti-escalada (reemplaza la intención de la migración 002, que no podía
-- usar NEW/OLD): un usuario NO admin no puede cambiar role / is_winner /
-- group_id / id de su propio perfil. Los admins sí pueden.
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  -- auth.uid() es NULL en el SQL Editor y con service_role: contextos
  -- privilegiados que igual deben poder cambiar role/is_winner/group_id.
  -- (Para usuarios anon/auth sin permisos, RLS impide que lleguen aquí.)
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.is_winner IS DISTINCT FROM OLD.is_winner
     OR NEW.group_id IS DISTINCT FROM OLD.group_id
     OR NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'No autorizado a modificar campos protegidos del perfil'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_escalation();