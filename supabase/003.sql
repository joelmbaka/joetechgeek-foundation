-- 003_fix_permissions_and_rls.sql

-- Update the trigger function with SECURITY DEFINER so it can insert into profiles
-- This allows the function to run with the privileges of the function owner
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, created_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null),
    now()
  )
  on conflict (id) do update
    set full_name = coalesce(excluded.full_name, profiles.full_name);
  return new;
end;
$$;

-- Enable Row Level Security on profiles table
alter table public.profiles enable row level security;

-- Policy: Users can read their own profile
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Policy: Users can update their own profile
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Policy: Allow insert for authenticated users (for the trigger, but also for direct inserts)
create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

