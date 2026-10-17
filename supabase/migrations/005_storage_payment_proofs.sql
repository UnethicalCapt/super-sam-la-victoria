-- Bucket privado para comprobantes
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

-- Cada usuario sube/lee solo en su carpeta {auth.uid()}/...
drop policy if exists "users upload own proofs" on storage.objects;
create policy "users upload own proofs" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users read own proofs" on storage.objects;
create policy "users read own proofs" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins leen cualquier comprobante
drop policy if exists "admins read all proofs" on storage.objects;
create policy "admins read all proofs" on storage.objects
  for select to authenticated
  using (bucket_id = 'payment-proofs' and public.is_admin());

-- Nadie borra desde el cliente por defecto (sin política de DELETE)
