-- Sprint 1: Integridad de pagos y protección de roles
-- Idempotente: se puede aplicar varias veces sin dañar la base

-- Función que protege los pagos: solo admins pueden cambiarlos
-- Un participante no puede aprobar su propio pago ni cambiar el monto
CREATE OR REPLACE FUNCTION public.protect_payment_write()
RETURNS TRIGGER AS $$
BEGIN
  -- Si viene del editor SQL de Supabase (auth.uid() es null), permitimos todo
  IF TG_OP = 'INSERT' THEN
    -- Si viene del editor SQL de Supabase (auth.uid() es null), permitimos todo
    IF auth.uid() IS NULL THEN
      RETURN NEW;
    END IF;

    -- Si es admin, permitimos cambios completos
    IF public.is_admin() THEN
      RETURN NEW;
    END IF;

    -- En INSERT, si auth.uid() no es null y la persona no es admin: fuerza status = 'pending', reviewed_by = null y reviewed_at = null
    IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
      NEW.status := 'pending';
      NEW.reviewed_by := NULL;
      NEW.reviewed_at := NULL;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Si viene del editor SQL de Supabase (auth.uid() es null), permitimos todo
    IF auth.uid() IS NULL THEN
      RETURN NEW;
    END IF;

    -- En UPDATE, si la persona no es admin y auth.uid() no es null: lanza error 42501 con el texto «No autorizado a modificar pagos»
    IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'No autorizado a modificar pagos'
        USING ERRCODE = '42501';
    END IF;

    -- En UPDATE de un admin, o si auth.uid() es null: permite cambiar status, notes, reviewed_by y reviewed_at
    IF auth.uid() IS NULL OR public.is_admin() THEN
      -- Si cambian id, user_id, amount, proof_url o week_number, lanza error 42501 con el texto «Esos datos del pago no se pueden modificar»
      IF (
        NEW.id IS DISTINCT FROM OLD.id OR
        NEW.user_id IS DISTINCT FROM OLD.user_id OR
        NEW.amount IS DISTINCT FROM OLD.amount OR
        NEW.proof_url IS DISTINCT FROM OLD.proof_url OR
        NEW.week_number IS DISTINCT FROM OLD.week_number
      ) THEN
        RAISE EXCEPTION 'Esos datos del pago no se pueden modificar'
          USING ERRCODE = '42501';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para proteger los pagos
DROP TRIGGER IF EXISTS payments_protect_write ON public.payments;
CREATE TRIGGER payments_protect_write
  BEFORE INSERT OR UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_payment_write();

-- Índice único para que no haya dos pagos de la misma persona en la misma semana
CREATE UNIQUE INDEX IF NOT EXISTS payments_user_week_unique
  ON public.payments (user_id, week_number)
  WHERE week_number IS NOT NULL;

-- Función que protege el rol de admin
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Si viene del editor SQL, permitimos todo
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Cualquier usuario con sesión, admin o no, no puede cambiar role ni id
  IF TG_OP = 'UPDATE' AND (
    NEW.role IS DISTINCT FROM OLD.role OR
    NEW.id IS DISTINCT FROM OLD.id
  ) THEN
    RAISE EXCEPTION 'No autorizado a modificar campos protegidos del perfil'
      USING ERRCODE = '42501';
  END IF;

  -- Un admin sí puede cambiar is_winner y group_id
  IF TG_OP = 'UPDATE' AND public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- Quien no es admin no puede cambiar is_winner ni group_id
  IF TG_OP = 'UPDATE' AND (
    NEW.is_winner IS DISTINCT FROM OLD.is_winner OR
    NEW.group_id IS DISTINCT FROM OLD.group_id
  ) THEN
    RAISE EXCEPTION 'No autorizado a modificar campos protegidos del perfil'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para proteger el perfil
DROP TRIGGER IF EXISTS profiles_prevent_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- Comentar que esta migración protege la base para un san de motos comercial
COMMENT ON FUNCTION public.protect_payment_write() IS 'Protege que un participante no pueda aprobar su propio pago ni cambiar el monto. Solo admins pueden modificar pagos.';
COMMENT ON FUNCTION public.prevent_profile_privilege_escalation() IS 'Protege que un usuario no pueda cambiar su propio role ni id. Un admin sí puede cambiar is_winner y group_id.';
