-- 009: columnas de perfil usadas por Register / Profile / AuthContext
-- Idempotente

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT;

-- Backfill desde full_name cuando first/last estén vacíos
UPDATE public.profiles
SET
  first_name = COALESCE(
    NULLIF(trim(first_name), ''),
    NULLIF(trim(split_part(COALESCE(full_name, ''), ' ', 1)), '')
  ),
  last_name = COALESCE(
    NULLIF(trim(last_name), ''),
    NULLIF(
      trim(substring(COALESCE(full_name, '') from length(split_part(COALESCE(full_name, ''), ' ', 1)) + 2)),
      ''
    )
  )
WHERE full_name IS NOT NULL
  AND trim(full_name) <> ''
  AND (first_name IS NULL OR trim(first_name) = '' OR last_name IS NULL OR trim(last_name) = '');

COMMENT ON COLUMN public.profiles.first_name IS 'Nombre del participante';
COMMENT ON COLUMN public.profiles.last_name IS 'Apellido del participante';
COMMENT ON COLUMN public.profiles.address IS 'Dirección (opcional; puede quedar null)';
COMMENT ON COLUMN public.profiles.birth_date IS 'Fecha de nacimiento';
COMMENT ON COLUMN public.profiles.gender IS 'Género opcional';