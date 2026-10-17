alter table public.payments
  drop constraint if exists payments_amount_fixed;
alter table public.payments
  add constraint payments_amount_fixed check (amount = 100.00);
