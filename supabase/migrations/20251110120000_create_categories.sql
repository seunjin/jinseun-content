create table if not exists public.categories (
  id serial primary key,
  name varchar(50) not null,
  slug varchar(60) not null unique,
  description text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
