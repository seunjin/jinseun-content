alter table if exists public.categories enable row level security;

alter table if exists public.categories force row level security;

drop policy if exists "categories_select_all" on public.categories;
create policy "categories_select_all"
  on public.categories
  for select
  using (true);

drop policy if exists "categories_insert_master" on public.categories;
create policy "categories_insert_master"
  on public.categories
  for insert
  with check (public.is_master_email((auth.jwt() ->> 'email'::text)));

drop policy if exists "categories_update_master" on public.categories;
create policy "categories_update_master"
  on public.categories
  for update
  using (public.is_master_email((auth.jwt() ->> 'email'::text)))
  with check (public.is_master_email((auth.jwt() ->> 'email'::text)));

drop policy if exists "categories_delete_master" on public.categories;
create policy "categories_delete_master"
  on public.categories
  for delete
  using (public.is_master_email((auth.jwt() ->> 'email'::text)));
