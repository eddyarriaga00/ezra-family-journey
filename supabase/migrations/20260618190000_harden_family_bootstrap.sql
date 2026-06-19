alter table public.family_members alter column role set default 'viewer';

create unique index if not exists families_owner_id_idx on public.families (owner_id);

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

  -- Serialize first-time setup for the same account across tabs/devices.
  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text, 0));

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

revoke all on function public.bootstrap_family() from public, anon;
grant execute on function public.bootstrap_family() to authenticated;
