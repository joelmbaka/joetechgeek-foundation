-- 001_create_profiles_and_trigger.sql

-- Create a profiles table keyed by auth.users.id
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text,
  full_name text,
  bio text,
  role text default 'student',
  created_at timestamptz default timezone('utc', now())
);

-- Function that inserts into profiles when a new auth.user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
as $$
begin
  insert into public.profiles (id, email, created_at)
  values (new.id, new.email, now())
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger on auth.users AFTER INSERT
drop trigger if exists trigger_handle_new_user on auth.users;
create trigger trigger_handle_new_user
after insert on auth.users
for each row
execute function public.handle_new_user();
