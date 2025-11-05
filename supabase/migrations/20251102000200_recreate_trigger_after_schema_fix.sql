-- migration: recreate trigger after schema fix
-- purpose: ensure trigger is recreated after password_hash column is removed
-- note: the original trigger (20251102000000) was created before password_hash was dropped,
-- causing "Database error saving new user" when registering

begin;

-- drop the old trigger that was created before schema fix
drop trigger if exists on_auth_user_created on auth.users;

-- recreate the function with error handling
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  begin
    insert into public.users (id, email, role)
    values (new.id, new.email, 'adopter')
    on conflict (id) do nothing;
  exception when others then
    -- log the error and continue - auth.users was still created
    raise notice 'Error creating user record: %', sqlerrm;
  end;
  return new;
end;
$$;

-- recreate trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

commit;
