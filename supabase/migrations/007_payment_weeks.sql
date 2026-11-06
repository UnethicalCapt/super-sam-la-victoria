-- Migracion 007: tabla de semanas de pago (payment_weeks) + politica RLS + funcion current_week_number()
-- Idempotente: apta para aplicarse varias veces y para migration repair --status applied.

create table if not exists public.payment_weeks (
  id uuid primary key default gen_random_uuid(),
  week_number integer not null unique,
  due_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.payment_weeks enable row level security;

drop policy if exists "auth read weeks" on public.payment_weeks;
create policy "auth read weeks" on public.payment_weeks
  for select to authenticated using (true);

drop policy if exists "admins manage weeks" on public.payment_weeks;
create policy "admins manage weeks" on public.payment_weeks
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create index if not exists idx_payment_weeks_due_date on public.payment_weeks(due_date);

-- Funcion auxiliar: devuelve el week_number de la semana activa (menor due_date entre las activas).
-- Si no hay ninguna, devuelve null. El cliente debe manejar el caso "sin semana configurada".
create or replace function public.current_week_number()
returns integer
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select week_number
  from public.payment_weeks
  where is_active = true
  order by due_date asc
  limit 1;
$$;

grant execute on function public.current_week_number() to authenticated;
