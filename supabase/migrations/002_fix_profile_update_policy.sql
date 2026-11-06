-- Supabase corrective migration for Super Sam La Victoria
-- Corrige la política de auto-actualización del perfil.
--
-- IMPORTANTE: dentro de una política RLS NO se pueden usar NEW/OLD
-- (solo son válidos en funciones de trigger). La versión anterior fallaba con
-- ERROR 42P01 "missing FROM-clause entry for table new".
--
-- La restricción de columnas (impedir que un usuario cambie su propio
-- role / is_winner / group_id) se aplica con un TRIGGER en la migración 010,
-- porque necesita public.is_admin(). La protección de fila queda aquí.

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
