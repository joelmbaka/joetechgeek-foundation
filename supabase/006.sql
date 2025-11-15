-- 006_modules_and_update_lessons.sql
-- Add modules table
-- Update lessons to belong to modules rather than courses
-- Add duration_minutes to lessons
-- Apply full role-based RLS (admin/mentor/student)

------------------------------------------------------------
-- Helper:
-- (select role from public.profiles where id = auth.uid())
------------------------------------------------------------


------------------------------------------------------------
-- 1) MODULES
-- Each module belongs to a course
------------------------------------------------------------

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  order_index int not null,
  created_at timestamptz default now()
);

alter table public.modules enable row level security;

-- Authenticated users may read modules
create policy "Users can read modules"
  on public.modules
  for select
  using (auth.role() = 'authenticated');

-- Admins + mentors manage modules
create policy "Admins and mentors manage modules"
  on public.modules
  for all
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin', 'mentor')
  )
  with check (
    (select role from public.profiles where id = auth.uid()) in ('admin', 'mentor')
  );


------------------------------------------------------------
-- 2) UPDATE LESSONS STRUCTURE
-- Add module_id
-- Add duration_minutes
-- Remove course_id
------------------------------------------------------------

-- Add new columns
alter table public.lessons
add column module_id uuid references public.modules(id) on delete cascade;

alter table public.lessons
add column duration_minutes int not null default 5;

-- Remove course_id column if it exists
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name='lessons' and column_name='course_id'
  ) then
    alter table public.lessons drop column course_id;
  end if;
end $$;


------------------------------------------------------------
-- 3) RLS FOR LESSONS (recompile after schema change)
------------------------------------------------------------

-- Drop old policies if they exist
drop policy if exists "Users can read lessons" on public.lessons;
drop policy if exists "Admins and mentors manage lessons" on public.lessons;

-- Students & all authenticated users can read lessons
create policy "Users can read lessons"
  on public.lessons
  for select
  using (auth.role() = 'authenticated');

-- Admins + mentors manage lessons
create policy "Admins and mentors manage lessons"
  on public.lessons
  for all
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin', 'mentor')
  )
  with check (
    (select role from public.profiles where id = auth.uid()) in ('admin', 'mentor')
  );


------------------------------------------------------------
-- END MIGRATION 006
------------------------------------------------------------
