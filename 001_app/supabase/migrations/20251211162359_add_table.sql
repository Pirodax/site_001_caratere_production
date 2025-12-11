-- Migration: Client Site Schema
-- Description: Creates tables for sites, films, and media

-- ============================================
-- TABLE: sites
-- ============================================
create table public.sites (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users(id) on delete cascade not null,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index for faster lookups by owner
create index sites_owner_id_idx on public.sites(owner_id);

-- RLS
alter table public.sites enable row level security;

create policy "Users can view their own sites"
  on public.sites for select
  using (auth.uid() = owner_id);

create policy "Users can insert their own sites"
  on public.sites for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own sites"
  on public.sites for update
  using (auth.uid() = owner_id);

create policy "Users can delete their own sites"
  on public.sites for delete
  using (auth.uid() = owner_id);

-- ============================================
-- TABLE: films
-- ============================================
create table public.films (
  id uuid default gen_random_uuid() primary key,
  site_id uuid references public.sites(id) on delete cascade not null,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index for faster lookups by site
create index films_site_id_idx on public.films(site_id);

-- RLS
alter table public.films enable row level security;

create policy "Users can view films of their sites"
  on public.films for select
  using (
    exists (
      select 1 from public.sites
      where sites.id = films.site_id
      and sites.owner_id = auth.uid()
    )
  );

create policy "Users can insert films to their sites"
  on public.films for insert
  with check (
    exists (
      select 1 from public.sites
      where sites.id = films.site_id
      and sites.owner_id = auth.uid()
    )
  );

create policy "Users can update films of their sites"
  on public.films for update
  using (
    exists (
      select 1 from public.sites
      where sites.id = films.site_id
      and sites.owner_id = auth.uid()
    )
  );

create policy "Users can delete films of their sites"
  on public.films for delete
  using (
    exists (
      select 1 from public.sites
      where sites.id = films.site_id
      and sites.owner_id = auth.uid()
    )
  );

-- ============================================
-- TABLE: media
-- ============================================
create table public.media (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  url text not null,
  filename text,
  mime_type text,
  size_bytes int8,
  width int4,
  height int4,
  alt text,
  created_at timestamptz default now() not null
);

-- Index for faster lookups by user
create index media_user_id_idx on public.media(user_id);

-- RLS
alter table public.media enable row level security;

create policy "Users can view their own media"
  on public.media for select
  using (auth.uid() = user_id);

create policy "Users can insert their own media"
  on public.media for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own media"
  on public.media for update
  using (auth.uid() = user_id);

create policy "Users can delete their own media"
  on public.media for delete
  using (auth.uid() = user_id);

-- ============================================
-- FUNCTION: Auto-update updated_at
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger sites_updated_at
  before update on public.sites
  for each row execute function public.handle_updated_at();

create trigger films_updated_at
  before update on public.films
  for each row execute function public.handle_updated_at();