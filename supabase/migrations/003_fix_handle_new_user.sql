-- Supabase corrective migration for Super Sam La Victoria
-- Secures the handle_new_user() function by adding explicit search_path
-- Prevents potential security risks from uncontrolled search_path in SECURITY DEFINER functions

-- Drop the existing function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function with explicit search_path for security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Set a secure search_path to prevent execution of unexpected objects
    SET search_path = pg_catalog, public;
    
    INSERT INTO public.profiles (id, cedula, full_name, role, is_winner)
    VALUES (
        NEW.id,
        NULL, -- cedula is NULL initially, to be updated by user later
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