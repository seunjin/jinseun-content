-- assets 버킷: 모두 읽기 허용
drop policy if exists "assets_public_read" on storage.objects;
create policy "assets_public_read"
  on storage.objects
  for select
  using (bucket_id = 'assets');

-- assets 버킷: 인증된 유저만 업로드/수정/삭제 허용
drop policy if exists "assets_authenticated_insert" on storage.objects;
create policy "assets_authenticated_insert"
  on storage.objects
  for insert
  with check (bucket_id = 'assets' and auth.role() = 'authenticated');

drop policy if exists "assets_authenticated_update" on storage.objects;
create policy "assets_authenticated_update"
  on storage.objects
  for update
  using (bucket_id = 'assets' and auth.role() = 'authenticated')
  with check (bucket_id = 'assets' and auth.role() = 'authenticated');

drop policy if exists "assets_authenticated_delete" on storage.objects;
create policy "assets_authenticated_delete"
  on storage.objects
  for delete
  using (bucket_id = 'assets' and auth.role() = 'authenticated');
