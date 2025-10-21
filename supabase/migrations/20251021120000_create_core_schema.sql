-- migration: create core schema for adoptme mvp
-- purpose: establish types, tables, constraints, triggers, indexes, and row-level security policies required by the mvp
-- affected objects: enum types, helper functions, tables (shelters, users, dogs, lifestyle_profiles, adoption_applications, ai_recommendations)
-- notes: all sql is lowercase to follow project conventions. each table enables rls and defines granular policies per supabase role.

begin;

-- ensure extensions needed for uuid generation and case-insensitive emails exist
create extension if not exists "pgcrypto";
create extension if not exists citext;

-- domain-specific enum types
create type public.user_role as enum ('adopter', 'shelter_staff', 'admin');
create type public.dog_size as enum ('small', 'medium', 'large');
create type public.dog_status as enum ('available', 'in_process', 'adopted');
create type public.application_status as enum ('new', 'in_progress', 'accepted', 'rejected');
create type public.dog_age_category as enum ('puppy', 'adult', 'senior');

-- helper function to maintain updated_at columns
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- helper function to derive age category from integer age
create or replace function public.sync_dog_age_category()
returns trigger
language plpgsql
as $$
begin
  if new.age_years < 1 then
    new.age_category := 'puppy';
  elsif new.age_years < 8 then
    new.age_category := 'adult';
  else
    new.age_category := 'senior';
  end if;
  return new;
end;
$$;

-- core tables ---------------------------------------------------------------

create table public.shelters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  contact_email citext not null,
  contact_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.shelters enable row level security;

create table public.users (
  id uuid primary key default auth.uid(),
  email citext not null unique,
  password_hash text not null,
  role public.user_role not null default 'adopter',
  shelter_id uuid references public.shelters(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_auth_fk foreign key (id) references auth.users (id) on delete cascade
);
alter table public.users enable row level security;

create table public.dogs (
  id uuid primary key default gen_random_uuid(),
  shelter_id uuid not null references public.shelters(id) on delete cascade,
  name text not null,
  age_years integer not null check (age_years >= 0),
  age_category public.dog_age_category not null default 'adult',
  size public.dog_size not null,
  temperament text not null,
  health text,
  adoption_status public.dog_status not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.dogs enable row level security;

create table public.lifestyle_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  housing_type text not null,
  household_size integer not null check (household_size >= 1),
  children_present boolean not null,
  dog_experience text not null,
  activity_level text not null,
  preferred_dog_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.lifestyle_profiles enable row level security;

create table public.adoption_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  dog_id uuid not null references public.dogs(id) on delete cascade,
  status public.application_status not null default 'new',
  motivation text not null,
  contact_preference text not null,
  extra_notes text,
  shelter_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.adoption_applications enable row level security;

create table public.ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  dog_id uuid references public.dogs(id) on delete set null,
  survey_answers jsonb not null,
  profile_snapshot jsonb,
  prompt text,
  response jsonb,
  created_at timestamptz not null default now()
);
alter table public.ai_recommendations enable row level security;

-- triggers -----------------------------------------------------------------

create trigger shelters_set_updated_at
  before update on public.shelters
  for each row execute function public.set_updated_at();

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger dogs_set_updated_at
  before update on public.dogs
  for each row execute function public.set_updated_at();

create trigger dogs_sync_age_category_trg
  before insert or update on public.dogs
  for each row execute function public.sync_dog_age_category();

create trigger lifestyle_profiles_set_updated_at
  before update on public.lifestyle_profiles
  for each row execute function public.set_updated_at();

create trigger adoption_applications_set_updated_at
  before update on public.adoption_applications
  for each row execute function public.set_updated_at();

-- indexes ------------------------------------------------------------------

create index idx_dogs_shelter on public.dogs (shelter_id);
create index idx_dogs_size on public.dogs (size);
create index idx_dogs_age_category on public.dogs (age_category);
create index idx_shelters_city on public.shelters (city);
create index idx_applications_user on public.adoption_applications (user_id);
create index idx_applications_dog_status on public.adoption_applications (dog_id, status);
create index idx_ai_recommendations_user on public.ai_recommendations (user_id);

-- row level security policies ----------------------------------------------

-- shelters policies: public read access, admin-only writes
create policy shelters_select_anon on public.shelters
  for select to anon
  using (true);

create policy shelters_select_authenticated on public.shelters
  for select to authenticated
  using (true);

create policy shelters_insert_authenticated on public.shelters
  for insert to authenticated
  with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

create policy shelters_insert_anon on public.shelters
  for insert to anon
  with check (false);

create policy shelters_update_authenticated on public.shelters
  for update to authenticated
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'))
  with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

create policy shelters_update_anon on public.shelters
  for update to anon
  using (false)
  with check (false);

create policy shelters_delete_authenticated on public.shelters
  for delete to authenticated
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

create policy shelters_delete_anon on public.shelters
  for delete to anon
  using (false);

-- users policies: users manage only their row; admins manage all
create policy users_select_anon on public.users
  for select to anon
  using (false);

create policy users_select_authenticated on public.users
  for select to authenticated
  using (
    auth.uid() = id
    or exists (select 1 from public.users admin where admin.id = auth.uid() and admin.role = 'admin')
  );

create policy users_insert_authenticated on public.users
  for insert to authenticated
  with check (auth.uid() = coalesce(id, auth.uid()));

create policy users_insert_anon on public.users
  for insert to anon
  with check (false);

create policy users_update_authenticated on public.users
  for update to authenticated
  using (
    auth.uid() = id
    or exists (select 1 from public.users admin where admin.id = auth.uid() and admin.role = 'admin')
  )
  with check (
    auth.uid() = id
    or exists (select 1 from public.users admin where admin.id = auth.uid() and admin.role = 'admin')
  );

create policy users_update_anon on public.users
  for update to anon
  using (false)
  with check (false);

create policy users_delete_authenticated on public.users
  for delete to authenticated
  using (exists (select 1 from public.users admin where admin.id = auth.uid() and admin.role = 'admin'));

create policy users_delete_anon on public.users
  for delete to anon
  using (false);

-- dogs policies: read for everyone, modifications limited to shelter staff/admin
create policy dogs_select_anon on public.dogs
  for select to anon
  using (true);

create policy dogs_select_authenticated on public.dogs
  for select to authenticated
  using (true);

create policy dogs_insert_authenticated on public.dogs
  for insert to authenticated
  with check (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role in ('shelter_staff', 'admin')
        and (u.role = 'admin' or u.shelter_id = shelter_id)
    )
  );

create policy dogs_insert_anon on public.dogs
  for insert to anon
  with check (false);

create policy dogs_update_authenticated on public.dogs
  for update to authenticated
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role in ('shelter_staff', 'admin')
        and (u.role = 'admin' or u.shelter_id = shelter_id)
    )
  )
  with check (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role in ('shelter_staff', 'admin')
        and (u.role = 'admin' or u.shelter_id = shelter_id)
    )
  );

create policy dogs_update_anon on public.dogs
  for update to anon
  using (false)
  with check (false);

create policy dogs_delete_authenticated on public.dogs
  for delete to authenticated
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role in ('shelter_staff', 'admin')
        and (u.role = 'admin' or u.shelter_id = shelter_id)
    )
  );

create policy dogs_delete_anon on public.dogs
  for delete to anon
  using (false);

-- lifestyle profile policies: adopters manage their profile; admins have oversight
create policy lifestyle_profiles_select_anon on public.lifestyle_profiles
  for select to anon
  using (false);

create policy lifestyle_profiles_select_authenticated on public.lifestyle_profiles
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.users admin where admin.id = auth.uid() and admin.role = 'admin')
  );

create policy lifestyle_profiles_insert_authenticated on public.lifestyle_profiles
  for insert to authenticated
  with check (user_id = auth.uid());

create policy lifestyle_profiles_insert_anon on public.lifestyle_profiles
  for insert to anon
  with check (false);

create policy lifestyle_profiles_update_authenticated on public.lifestyle_profiles
  for update to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.users admin where admin.id = auth.uid() and admin.role = 'admin')
  )
  with check (
    user_id = auth.uid()
    or exists (select 1 from public.users admin where admin.id = auth.uid() and admin.role = 'admin')
  );

create policy lifestyle_profiles_update_anon on public.lifestyle_profiles
  for update to anon
  using (false)
  with check (false);

create policy lifestyle_profiles_delete_authenticated on public.lifestyle_profiles
  for delete to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.users admin where admin.id = auth.uid() and admin.role = 'admin')
  );

create policy lifestyle_profiles_delete_anon on public.lifestyle_profiles
  for delete to anon
  using (false);

-- adoption application policies: adopters view own records; staff for their shelter; admin all
create policy adoption_applications_select_anon on public.adoption_applications
  for select to anon
  using (false);

create policy adoption_applications_select_authenticated on public.adoption_applications
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.users staff
      join public.dogs d on d.id = public.adoption_applications.dog_id
      where staff.id = auth.uid()
        and staff.role in ('shelter_staff', 'admin')
        and (staff.role = 'admin' or staff.shelter_id = d.shelter_id)
    )
  );

create policy adoption_applications_insert_authenticated on public.adoption_applications
  for insert to authenticated
  with check (user_id = auth.uid());

create policy adoption_applications_insert_anon on public.adoption_applications
  for insert to anon
  with check (false);

create policy adoption_applications_update_authenticated on public.adoption_applications
  for update to authenticated
  using (
    exists (
      select 1
      from public.users staff
      join public.dogs d on d.id = public.adoption_applications.dog_id
      where staff.id = auth.uid()
        and staff.role in ('shelter_staff', 'admin')
        and (staff.role = 'admin' or staff.shelter_id = d.shelter_id)
    )
  )
  with check (
    exists (
      select 1
      from public.users staff
      join public.dogs d on d.id = public.adoption_applications.dog_id
      where staff.id = auth.uid()
        and staff.role in ('shelter_staff', 'admin')
        and (staff.role = 'admin' or staff.shelter_id = d.shelter_id)
    )
  );

create policy adoption_applications_update_anon on public.adoption_applications
  for update to anon
  using (false)
  with check (false);

create policy adoption_applications_delete_authenticated on public.adoption_applications
  for delete to authenticated
  using (exists (select 1 from public.users admin where admin.id = auth.uid() and admin.role = 'admin'));

create policy adoption_applications_delete_anon on public.adoption_applications
  for delete to anon
  using (false);

-- ai recommendation policies: visible to owner and administrators only
create policy ai_recommendations_select_anon on public.ai_recommendations
  for select to anon
  using (false);

create policy ai_recommendations_select_authenticated on public.ai_recommendations
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.users admin where admin.id = auth.uid() and admin.role = 'admin')
  );

create policy ai_recommendations_insert_authenticated on public.ai_recommendations
  for insert to authenticated
  with check (user_id = auth.uid());

create policy ai_recommendations_insert_anon on public.ai_recommendations
  for insert to anon
  with check (false);

create policy ai_recommendations_update_authenticated on public.ai_recommendations
  for update to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.users admin where admin.id = auth.uid() and admin.role = 'admin')
  )
  with check (
    user_id = auth.uid()
    or exists (select 1 from public.users admin where admin.id = auth.uid() and admin.role = 'admin')
  );

create policy ai_recommendations_update_anon on public.ai_recommendations
  for update to anon
  using (false)
  with check (false);

create policy ai_recommendations_delete_authenticated on public.ai_recommendations
  for delete to authenticated
  using (exists (select 1 from public.users admin where admin.id = auth.uid() and admin.role = 'admin'));

create policy ai_recommendations_delete_anon on public.ai_recommendations
  for delete to anon
  using (false);

commit;
