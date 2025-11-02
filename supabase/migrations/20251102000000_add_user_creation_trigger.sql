-- migration: add trigger to automatically create user record on auth signup
-- purpose: ensure that when a user signs up via supabase auth, a corresponding record is created in public.users table

begin;

-- helper function to create user record when auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'adopter')
  on conflict (id) do nothing;
  return new;
end;
$$;

-- trigger on auth.users to call handle_new_user when new user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

commit;
