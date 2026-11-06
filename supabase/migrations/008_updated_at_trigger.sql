-- Migracion 008: trigger set_updated_at en public.profiles
-- Idempotente: apta para aplicarse varias veces y para migration repair --status applied.

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();
