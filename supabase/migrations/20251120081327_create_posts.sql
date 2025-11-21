-- 게시글 저장용 posts 테이블 및 RLS 정책 추가

create table if not exists public.posts (
  id serial primary key,
  category_id integer not null references public.categories(id),
  title varchar(200) not null,
  slug varchar(200) not null unique,
  description text,
  -- 게시글과 연관된 키워드 문자열 배열입니다. UI에서는 최대 5개까지 입력합니다.
  keywords text[],
  -- 목록/상세에서 사용할 썸네일 이미지 URL (선택)
  thumbnail_url text,
  -- BlockNote 에디터 문서를 JSON 문자열로 직렬화해 저장합니다.
  content text,
  -- 발행 여부 (false: 비공개/초안, true: 공개)
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.posts enable row level security;
alter table if exists public.posts force row level security;

-- 모든 사용자는 발행된 글만 조회할 수 있도록 허용합니다.
drop policy if exists "posts_select_published" on public.posts;
create policy "posts_select_published"
  on public.posts
  for select
  using (is_published = true);

-- 마스터 계정만 게시글을 생성할 수 있도록 제한합니다.
drop policy if exists "posts_insert_master" on public.posts;
create policy "posts_insert_master"
  on public.posts
  for insert
  with check (public.is_master_email((auth.jwt() ->> 'email'::text)));

-- 마스터 계정만 게시글을 수정할 수 있도록 제한합니다.
drop policy if exists "posts_update_master" on public.posts;
create policy "posts_update_master"
  on public.posts
  for update
  using (public.is_master_email((auth.jwt() ->> 'email'::text)))
  with check (public.is_master_email((auth.jwt() ->> 'email'::text)));

-- 마스터 계정만 게시글을 삭제할 수 있도록 제한합니다.
drop policy if exists "posts_delete_master" on public.posts;
create policy "posts_delete_master"
  on public.posts
  for delete
  using (public.is_master_email((auth.jwt() ->> 'email'::text)));

