-- 004_add_role_constraint_and_set_admin.sql

-- Add check constraint to limit role values to: student, admin, mentor
alter table public.profiles
add constraint profiles_role_check
check (role in ('student', 'admin', 'mentor'));

-- Set mbakajoe26@gmail.com as admin
update public.profiles
set role = 'admin'
where email = 'mbakajoe26@gmail.com';

