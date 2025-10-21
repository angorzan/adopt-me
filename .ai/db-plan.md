1. Lista tabel


This table is managed by Supabase Auth.

### users
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `email CITEXT NOT NULL UNIQUE`
- `password_hash TEXT NOT NULL`
- `role user_role NOT NULL DEFAULT 'adopter'`
- `shelter_id UUID REFERENCES shelters(id)`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

### shelters
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `name TEXT NOT NULL`
- `city TEXT NOT NULL`
- `contact_email CITEXT NOT NULL`
- `contact_phone TEXT`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

### dogs
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `shelter_id UUID NOT NULL REFERENCES shelters(id)`
- `name TEXT NOT NULL`
- `age_years INTEGER NOT NULL CHECK (age_years >= 0)`
- `age_category dog_age_category NOT NULL`
- `size dog_size NOT NULL`
- `temperament TEXT NOT NULL`
- `health TEXT`
- `adoption_status dog_status NOT NULL DEFAULT 'available'`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

### lifestyle_profiles
- `user_id UUID PRIMARY KEY REFERENCES users(id)`
- `housing_type TEXT NOT NULL`
- `household_size INTEGER NOT NULL CHECK (household_size >= 1)`
- `children_present BOOLEAN NOT NULL`
- `dog_experience TEXT NOT NULL`
- `activity_level TEXT NOT NULL`
- `preferred_dog_type TEXT NOT NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

### adoption_applications
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `user_id UUID NOT NULL REFERENCES users(id)`
- `dog_id UUID NOT NULL REFERENCES dogs(id)`
- `status application_status NOT NULL DEFAULT 'new'`
- `motivation TEXT NOT NULL`
- `contact_preference TEXT NOT NULL`
- `extra_notes TEXT`
- `shelter_comment TEXT`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`

### ai_recommendations
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `user_id UUID NOT NULL REFERENCES users(id)`
- `dog_id UUID REFERENCES dogs(id)`
- `survey_answers JSONB NOT NULL`
- `profile_snapshot JSONB`
- `prompt TEXT`
- `response JSONB`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`

### Enum/typy pomocnicze
- `CREATE TYPE user_role AS ENUM ('adopter','shelter_staff','admin');`
- `CREATE TYPE dog_size AS ENUM ('small','medium','large');`
- `CREATE TYPE dog_status AS ENUM ('available','in_process','adopted');`
- `CREATE TYPE application_status AS ENUM ('new','in_progress','accepted','rejected');`
- `CREATE TYPE dog_age_category AS ENUM ('puppy','adult','senior');`

2. Relacje między tabelami
- Jeden użytkownik (`users`) może mieć maksymalnie jeden profil (`lifestyle_profiles`) – relacja 1:1.
- Schronisko (`shelters`) posiada wielu pracowników (`users` z rolą `shelter_staff`) – relacja 1:N.
- Schronisko (`shelters`) posiada wiele psów (`dogs`) – relacja 1:N.
- Użytkownik (`users`) składa wiele wniosków (`adoption_applications`) – relacja 1:N.
- Pies (`dogs`) może mieć wiele wniosków (`adoption_applications`) – relacja 1:N.
- Użytkownik (`users`) otrzymuje wiele rekomendacji (`ai_recommendations`) – relacja 1:N.
- Pies (`dogs`) może być rekomendowany wielu użytkownikom (`ai_recommendations`) – relacja 1:N.

3. Indeksy
- `CREATE INDEX idx_dogs_shelter ON dogs(shelter_id);`
- `CREATE INDEX idx_dogs_size ON dogs(size);`
- `CREATE INDEX idx_dogs_age_category ON dogs(age_category);`
- `CREATE INDEX idx_shelters_city ON shelters(city);`
- `CREATE INDEX idx_applications_user ON adoption_applications(user_id);`
- `CREATE INDEX idx_applications_dog_status ON adoption_applications(dog_id, status);`
- `CREATE INDEX idx_ai_recommendations_user ON ai_recommendations(user_id);`

4. Zasady PostgreSQL (RLS)
```sql
ALTER TABLE adoption_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

-- Adopterzy widzą tylko własne wnioski
declare policy adoption_applications_adopter_select
  on adoption_applications
  for select using (user_id = current_setting('app.current_user_id')::uuid);

declare policy adoption_applications_adopter_modify
  on adoption_applications
  for update using (role = 'admin');

-- Personel schroniska widzi wnioski dotyczące ich psów
declare policy adoption_applications_staff_select
  on adoption_applications
  for select using (
    exists (
      select 1 from dogs d
      join users u on u.id = current_setting('app.current_user_id')::uuid
      where d.id = adoption_applications.dog_id
        and u.role in ('shelter_staff','admin')
        and d.shelter_id = u.shelter_id
    )
  );

-- Rekomendacje widoczne tylko dla właściciela i administratora
declare policy ai_recommendations_user_select
  on ai_recommendations
  for select using (
    user_id = current_setting('app.current_user_id')::uuid
    or exists (
      select 1 from users u
      where u.id = current_setting('app.current_user_id')::uuid
        and u.role = 'admin'
    )
  );
```
*Wymaga ustawiania `app.current_user_id` w sesji (np. przez Supabase).*

5. Dodatkowe uwagi
- Wymagane rozszerzenia: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` oraz `CREATE EXTENSION IF NOT EXISTS citext;` (lub `pgcrypto` dla `gen_random_uuid`).
- Aktualizację kolumn `updated_at` obsłuż przez trigger `BEFORE UPDATE` ustawiający `NEW.updated_at = now()`.
- `age_category` można aktualizować triggerem na podstawie `age_years` (np. `CASE WHEN <1 THEN 'puppy' ...`).
- Dane w `survey_answers` i `profile_snapshot` przechowują zrzut odpowiedzi; pytania są zakodowane po stronie aplikacji.
