-- migration: fix users table schema
-- purpose: remove password_hash field which is managed by supabase auth, not the users table

begin;

-- drop the password_hash column since supabase auth manages passwords
alter table public.users drop column if exists password_hash;

commit;
