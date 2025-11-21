-- posts 테이블 RLS 정책 수정
-- - 마스터 이메일은 모든 게시글(select) 조회 가능
-- - 그 외에는 is_published = true 인 게시글만 조회 가능

alter table if exists public.posts enable row level security;
alter table if exists public.posts force row level security;

drop policy if exists "posts_select_published" on public.posts;
create policy "posts_select_master_or_published"
  on public.posts
  for select
  using (
    public.is_master_email((auth.jwt() ->> 'email'::text))
    or is_published = true
  );

