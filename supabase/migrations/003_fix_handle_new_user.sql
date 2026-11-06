-- Supabase corrective migration for Super Sam La Victoria
-- Protege handle_new_user() con un search_path explícito.
--
-- IMPORTANTE: se usa CREATE OR REPLACE en lugar de DROP FUNCTION, porque el
-- trigger on_auth_user_created depende de esta función y un DROP sin CASCADE
-- fallaría con "cannot drop function ... because other objects depend on it".

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- search_path seguro para una función SECURITY DEFINER
    SET search_path = pg_catalog, public;

    INSERT INTO public.profiles (id, cedula, full_name, role, is_winner)
    VALUES (
        NEW.id,
        NULL, -- cedula arranca en NULL; el usuario la completa luego
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            NEW.email
        ),
        'user',
        FALSE
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
