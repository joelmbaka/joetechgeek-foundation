-- 005_courses_lessons_enrollments_lesson_progress.sql
-- MODE B (Course → Lesson → Enrollment → Lesson Progress)
-- Adds:
--   courses
--   lessons
--   enrollments
--   lesson_progress
-- All RLS based on roles (admin / mentor / student)


------------------------------------------------------------
-- Helper: role check expression (used inside policies)
-- (select role from public.profiles where id = auth.uid())
------------------------------------------------------------


------------------------------------------------------------
-- 1) COURSES
------------------------------------------------------------

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  created_at timestamptz default now()
);

alter table public.courses enable row level security;

-- Authenticated users may read courses
create policy "Users can read courses"
  on public.courses
  for select
  using (auth.role() = 'authenticated');

-- Admins and mentors may create/update/delete courses
create policy "Admins and mentors manage courses"
  on public.courses
  for all
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin','mentor')
  )
  with check (
    (select role from public.profiles where id = auth.uid()) in ('admin','mentor')
  );


------------------------------------------------------------
-- 2) LESSONS
-- Lessons belong directly to a course (no modules yet)
------------------------------------------------------------

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  order_index int not null,
  content text,
  created_at timestamptz default now()
);

alter table public.lessons enable row level security;

-- Authenticated users may read lessons
create policy "Users can read lessons"
  on public.lessons
  for select
  using (auth.role() = 'authenticated');

-- Admins and mentors can manage lessons
create policy "Admins and mentors manage lessons"
  on public.lessons
  for all
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin','mentor')
  )
  with check (
    (select role from public.profiles where id = auth.uid()) in ('admin','mentor')
  );


------------------------------------------------------------
-- 3) ENROLLMENTS
-- Tracks user progress at the course level
------------------------------------------------------------

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status text not null default 'not_started'
    check (status in ('not_started','ongoing','completed','certified')),
  progress_percent int default 0,
  started_at timestamptz default now(),
  completed_at timestamptz,
  certified_at timestamptz,
  unique (user_id, course_id)
);

alter table public.enrollments enable row level security;

-- Users can view their own enrollments
create policy "Users can view own enrollments"
  on public.enrollments
  for select
  using (auth.uid() = user_id);

-- Users can enroll themselves
create policy "Users can enroll themselves"
  on public.enrollments
  for insert
  with check (auth.uid() = user_id);

-- Users can update their own enrollment data
create policy "Users can update own enrollment"
  on public.enrollments
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admin + mentor override
create policy "Admins and mentors manage all enrollments"
  on public.enrollments
  for all
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin','mentor')
  )
  with check (
    (select role from public.profiles where id = auth.uid()) in ('admin','mentor')
  );


------------------------------------------------------------
-- 4) LESSON PROGRESS
-- Tracks user progress on individual lessons
------------------------------------------------------------

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status text not null default 'not_started'
    check (status in ('not_started','completed')),
  completed_at timestamptz,
  unique (user_id, lesson_id)
);

alter table public.lesson_progress enable row level security;

-- User can view their own lesson progress
create policy "Users can view own lesson progress"
  on public.lesson_progress
  for select
  using (auth.uid() = user_id);

-- Users can create or update their own lesson progress
create policy "Users manage own lesson progress"
  on public.lesson_progress
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admins & mentors can manage all students' lesson progress
create policy "Admins and mentors manage all lesson progress"
  on public.lesson_progress
  for all
  using (
    (select role from public.profiles where id = auth.uid()) in ('admin','mentor')
  )
  with check (
    (select role from public.profiles where id = auth.uid()) in ('admin','mentor')
  );


------------------------------------------------------------
-- END OF MIGRATION 005
------------------------------------------------------------
