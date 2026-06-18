-- Run in the Supabase SQL editor. Every care record belongs to one family.
create extension if not exists "pgcrypto";

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','caregiver','viewer')),
  primary key (family_id, user_id)
);

create table public.babies (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  birth_date date not null,
  gestational_weeks integer not null check (gestational_weeks between 20 and 45),
  gestational_days integer not null default 0 check (gestational_days between 0 and 6),
  birth_weight_grams integer check (birth_weight_grams > 0),
  created_at timestamptz not null default now()
);

create table public.care_entries (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  created_by uuid not null default auth.uid() references auth.users(id),
  kind text not null check (kind in ('weight','feeding','medication','note','milestone')),
  occurred_at timestamptz not null,
  title text not null,
  amount text,
  method text,
  notes text,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.babies enable row level security;
alter table public.care_entries enable row level security;

create or replace function public.is_family_member(target_family uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.family_members where family_id = target_family and user_id = auth.uid()) $$;

create policy "members read families" on public.families for select using (public.is_family_member(id) or owner_id = auth.uid());
create policy "users create families" on public.families for insert with check (owner_id = auth.uid());
create policy "members read membership" on public.family_members for select using (public.is_family_member(family_id));
create policy "owners manage membership" on public.family_members for all using (exists(select 1 from public.families f where f.id = family_id and f.owner_id = auth.uid()));
create policy "members read babies" on public.babies for select using (public.is_family_member(family_id));
create policy "caregivers manage babies" on public.babies for all using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));
create policy "members read entries" on public.care_entries for select using (exists(select 1 from public.babies b where b.id = baby_id and public.is_family_member(b.family_id)));
create policy "members create entries" on public.care_entries for insert with check (created_by = auth.uid() and exists(select 1 from public.babies b where b.id = baby_id and public.is_family_member(b.family_id)));
create policy "creators update entries" on public.care_entries for update using (created_by = auth.uid());
create policy "creators delete entries" on public.care_entries for delete using (created_by = auth.uid());
