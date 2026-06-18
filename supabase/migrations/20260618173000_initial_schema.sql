-- ProjectFresh PostgreSQL schema for Supabase.
-- Static photos remain public; authenticated family accounts own care data.
create extension if not exists "pgcrypto";

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'caregiver', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create table if not exists public.babies (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  birth_date date not null,
  gestational_weeks smallint not null check (gestational_weeks between 20 and 45),
  gestational_days smallint not null default 0 check (gestational_days between 0 and 6),
  birth_weight_grams integer check (birth_weight_grams > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.care_entries (
  id uuid primary key default gen_random_uuid(),
  baby_id uuid not null references public.babies(id) on delete cascade,
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text not null check (kind in ('weight', 'feeding', 'medication', 'milestone')),
  occurred_at timestamptz not null,
  title text not null check (length(trim(title)) > 0),
  amount text,
  method text,
  notes text,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists family_members_user_id_idx on public.family_members (user_id);
create index if not exists babies_family_id_idx on public.babies (family_id);
create index if not exists care_entries_baby_occurred_idx on public.care_entries (baby_id, occurred_at desc);
create index if not exists care_entries_created_by_idx on public.care_entries (created_by);

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.babies enable row level security;
alter table public.care_entries enable row level security;

create or replace function public.is_family_member(target_family uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.family_members
    where family_id = target_family and user_id = auth.uid()
  )
$$;

create or replace function public.can_manage_family(target_family uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.family_members
    where family_id = target_family
      and user_id = auth.uid()
      and role in ('owner', 'caregiver')
  )
$$;

-- Creates the signed-in user's first family and Ezra record exactly once.
create or replace function public.bootstrap_family()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  selected_family_id uuid;
  selected_baby_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select b.id
    into selected_baby_id
  from public.family_members fm
  join public.babies b on b.family_id = fm.family_id
  where fm.user_id = current_user_id
  order by b.created_at
  limit 1;

  if selected_baby_id is not null then
    return selected_baby_id;
  end if;

  insert into public.families (name, owner_id)
  values ('Ezra Family', current_user_id)
  returning id into selected_family_id;

  insert into public.family_members (family_id, user_id, role)
  values (selected_family_id, current_user_id, 'owner');

  insert into public.babies (
    family_id,
    name,
    birth_date,
    gestational_weeks,
    gestational_days,
    birth_weight_grams
  ) values (
    selected_family_id,
    'Ezra',
    date '2026-03-19',
    31,
    0,
    907
  ) returning id into selected_baby_id;

  return selected_baby_id;
end
$$;

revoke all on function public.is_family_member(uuid) from public, anon;
revoke all on function public.can_manage_family(uuid) from public, anon;
revoke all on function public.bootstrap_family() from public, anon;
grant execute on function public.is_family_member(uuid) to authenticated;
grant execute on function public.can_manage_family(uuid) to authenticated;
grant execute on function public.bootstrap_family() to authenticated;

drop policy if exists "members read families" on public.families;
drop policy if exists "users create families" on public.families;
drop policy if exists "members read membership" on public.family_members;
drop policy if exists "owners manage membership" on public.family_members;
drop policy if exists "members read babies" on public.babies;
drop policy if exists "caregivers manage babies" on public.babies;
drop policy if exists "members read entries" on public.care_entries;
drop policy if exists "members create entries" on public.care_entries;
drop policy if exists "creators update entries" on public.care_entries;
drop policy if exists "creators delete entries" on public.care_entries;

create policy "members read families" on public.families
  for select to authenticated
  using (public.is_family_member(id) or owner_id = (select auth.uid()));

create policy "users create families" on public.families
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy "members read membership" on public.family_members
  for select to authenticated
  using (public.is_family_member(family_id));

create policy "owners manage membership" on public.family_members
  for all to authenticated
  using (exists (
    select 1 from public.families f
    where f.id = family_id and f.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.families f
    where f.id = family_id and f.owner_id = (select auth.uid())
  ));

create policy "members read babies" on public.babies
  for select to authenticated
  using (public.is_family_member(family_id));

create policy "caregivers manage babies" on public.babies
  for all to authenticated
  using (public.can_manage_family(family_id))
  with check (public.can_manage_family(family_id));

create policy "members read entries" on public.care_entries
  for select to authenticated
  using (exists (
    select 1 from public.babies b
    where b.id = baby_id and public.is_family_member(b.family_id)
  ));

create policy "caregivers create entries" on public.care_entries
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and exists (
      select 1 from public.babies b
      where b.id = baby_id and public.can_manage_family(b.family_id)
    )
  );

create policy "creators update entries" on public.care_entries
  for update to authenticated
  using (created_by = (select auth.uid()))
  with check (created_by = (select auth.uid()));

create policy "creators delete entries" on public.care_entries
  for delete to authenticated
  using (created_by = (select auth.uid()));

revoke all on public.families, public.family_members, public.babies, public.care_entries from anon;
grant select, insert on public.families to authenticated;
grant select, insert, update, delete on public.family_members to authenticated;
grant select, insert, update, delete on public.babies to authenticated;
grant select, insert, update, delete on public.care_entries to authenticated;
