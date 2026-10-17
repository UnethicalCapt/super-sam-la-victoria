-- Supabase corrective migration for Super Sam La Victoria
-- Fixes profile update policy to prevent privilege escalation
-- Allows users to update only non-sensitive fields: cedula, full_name, phone
-- Prevents users from modifying role, is_winner, group_id, etc.

-- Drop the existing update policy to replace it with a more restrictive one
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create a new policy that restricts which columns can be updated
-- Users can only update cedula, full_name, and phone (non-sensitive fields)
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        -- Ensure that only allowed columns are being updated
        -- Check that NEW.values for restricted columns are equal to OLD.values
        (NEW.role = OLD.role) AND
        (NEW.is_winner = OLD.is_winner) AND
        (NEW.group_id = OLD.group_id) AND
        (NEW.id = OLD.id)  -- id should never change
        -- Note: We don't need to check cedula, full_name, phone as they are allowed to change
        -- created_at and updated_at are managed by database/triggers
    );