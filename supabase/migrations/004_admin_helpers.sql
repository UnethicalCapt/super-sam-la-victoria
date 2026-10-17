-- Helper de admin sin recursión de RLS
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- Reemplazar políticas admin que consultaban profiles desde policies de profiles
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles" on public.profiles
  for select using (public.is_admin());

drop policy if exists "Admins can view all payments" on public.payments;
create policy "Admins can view all payments" on public.payments
  for select using (public.is_admin());

drop policy if exists "Admins can update all payments" on public.payments;
create policy "Admins can update all payments" on public.payments
  for update using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can insert groups" on public.groups;
create policy "Admins can insert groups" on public.groups
  for insert with check (public.is_admin());

drop policy if exists "Admins can update groups" on public.groups;
create policy "Admins can update groups" on public.groups
  for update using (public.is_admin());

-- Permitir a admins marcar ganador y asignar grupo (no cambiar role)
drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles" on public.profiles
  for update
  using (public.is_admin())
  with check (
    public.is_admin()
    and role = (select role from public.profiles p where p.id = profiles.id)
  );
