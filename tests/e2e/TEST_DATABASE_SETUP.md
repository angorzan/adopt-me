# Test Database Setup Guide

Przewodnik konfiguracji dedykowanej testowej bazy danych Supabase dla testów e2e.

## Krok 1: Utwórz nowy projekt Supabase dla testów

1. Zaloguj się do [Supabase Dashboard](https://app.supabase.com)
2. Kliknij "New project"
3. Nadaj nazwę: `adopt-me-test` (lub podobną)
4. Wybierz region (najlepiej ten sam co produkcyjny)
5. Wygeneruj silne hasło dla bazy danych
6. Kliknij "Create new project"
7. **Poczekaj** aż projekt się zainicjalizuje (2-3 minuty)

## Krok 2: Skopiuj credentials do .env.test

1. W Supabase Dashboard, przejdź do: **Settings** > **API**
2. Skopiuj **Project URL** → to będzie `SUPABASE_URL`
3. Skopiuj **anon/public key** → to będzie `SUPABASE_PUBLIC_KEY`

4. Utwórz plik `.env.test` w głównym katalogu projektu:
   ```bash
   cp .env.test.example .env.test
   ```

5. Wypełnij `.env.test`:
   ```env
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_PUBLIC_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # Te wartości wypełnisz w kolejnych krokach
   E2E_USERNAME_ID=
   E2E_USERNAME=
   E2E_PASSWORD=
   ```

## Krok 3: Zastosuj migracje bazy danych

Testowa baza potrzebuje tej samej struktury co baza produkcyjna.

### Opcja A: Użyj Supabase CLI (zalecane)

```bash
# Link do testowego projektu
supabase link --project-ref your-test-project-ref

# Zastosuj migracje
supabase db push

# Lub jeśli masz seed data:
supabase db reset
```

### Opcja B: Ręcznie przez SQL Editor

1. W Supabase Dashboard, przejdź do: **SQL Editor**
2. Skopiuj SQL z plików migracji z `supabase/migrations/`
3. Wykonaj każdą migrację po kolei
4. Upewnij się, że wszystkie tabele są utworzone

## Krok 4: Utwórz użytkownika E2E testowego

### Przez Supabase Dashboard (najprostsze):

1. Przejdź do: **Authentication** > **Users**
2. Kliknij **"Add user"** > **"Create new user"**
3. Wprowadź dane:
   - **Email**: `e2e-test-user@adoptme-test.pl`
   - **Password**: `TestPassword123!` (lub inne silne hasło)
   - **Auto Confirm User**: ✅ TAK (WAŻNE!)
4. Kliknij **"Create user"**
5. Skopiuj **User UID** (UUID) użytkownika

### Przez SQL (alternatywnie):

```sql
-- W SQL Editor wykonaj:
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'e2e-test-user@adoptme-test.pl',
  crypt('TestPassword123!', gen_salt('bf')),
  now(),
  now(),
  now()
) RETURNING id;

-- Skopiuj zwrócone ID
```

## Krok 5: Zaktualizuj .env.test z danymi użytkownika

Otwórz `.env.test` i wypełnij brakujące wartości:

```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_PUBLIC_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Dane użytkownika E2E (z kroku 4)
E2E_USERNAME_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890  # UUID z kroku 4
E2E_USERNAME=e2e-test-user@adoptme-test.pl
E2E_PASSWORD=TestPassword123!
```

## Krok 6: Dodaj przykładowe dane (psy do adopcji)

Testowa baza potrzebuje kilku psów, żeby testy mogły działać.

### Opcja A: Seed script

Jeśli masz seed script w `supabase/seed.sql`:
```bash
supabase db reset  # To zaaplikuje seed
```

### Opcja B: Ręcznie przez SQL

```sql
-- Przykładowe schronisko
INSERT INTO shelters (id, name, city, address, phone, email)
VALUES
  (gen_random_uuid(), 'Testowe Schronisko', 'Warszawa', 'ul. Testowa 1', '123456789', 'test@shelter.pl');

-- Przykładowe psy
INSERT INTO dogs (name, breed, age_years, size, gender, temperament, shelter_id, available)
SELECT
  'Rex', 'Labrador', 3, 'large', 'male', 'Przyjazny i energiczny', id, true
FROM shelters WHERE name = 'Testowe Schronisko'
UNION ALL
SELECT
  'Luna', 'Golden Retriever', 2, 'medium', 'female', 'Spokojna i łagodna', id, true
FROM shelters WHERE name = 'Testowe Schronisko'
UNION ALL
SELECT
  'Max', 'Owczarek niemiecki', 4, 'large', 'male', 'Lojalny i mądry', id, true
FROM shelters WHERE name = 'Testowe Schronisko';
```

## Krok 7: Weryfikacja konfiguracji

Sprawdź czy wszystko działa:

```bash
# Test połączenia z bazą
npm run test:e2e -- --grep "unauthenticated user"

# Powinien przejść test pokazujący CTA dla niezalogowanych
```

Jeśli test przechodzi, konfiguracja jest poprawna! 🎉

## Krok 8: (Opcjonalnie) Skonfiguruj RLS

Jeśli Twoja produkcyjna baza używa Row Level Security (RLS), upewnij się, że testowa baza ma te same polityki.

```sql
-- Sprawdź czy RLS jest włączony
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Włącz RLS jeśli potrzeba
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Skopiuj polityki z produkcyjnej bazy
```

## Troubleshooting

### Nie mogę się połączyć z bazą

**Problem**: Testy nie łączą się z Supabase

**Rozwiązanie**:
1. Sprawdź czy `SUPABASE_URL` jest poprawny (bez trailing slash)
2. Sprawdź czy `SUPABASE_PUBLIC_KEY` to klucz `anon` (NIE `service_role`)
3. Sprawdź czy projekt Supabase jest aktywny (nie wstrzymany)

### Użytkownik nie może się zalogować

**Problem**: `Quick login failed: 401`

**Rozwiązanie**:
1. Upewnij się, że user ma **Email confirmed** = ✅ w Dashboard
2. Sprawdź czy hasło w `.env.test` się zgadza
3. Sprawdź czy `E2E_USERNAME_ID` to prawidłowy UUID użytkownika

### Brak psów w testach

**Problem**: `Test skipped: No dogs available in catalog`

**Rozwiązanie**:
1. Dodaj przykładowe psy (krok 6)
2. Upewnij się, że psy mają `available = true`
3. Sprawdź czy schronisko istnieje dla psów

## Dobre praktyki

✅ **DO**:
- Używaj oddzielnego projektu Supabase dla testów
- Regularnie resetuj testową bazę do czystego stanu
- Używaj silnych haseł nawet dla testów
- Dokumentuj jakie dane testowe powinny istnieć

❌ **DON'T**:
- NIE commituj `.env.test` do Git
- NIE używaj produkcyjnej bazy do testów
- NIE używaj prawdziwych adresów email w testach
- NIE zostawiaj testowej bazy bez zabezpieczeń

## Utrzymanie

### Resetowanie bazy testowej

Jeśli testowa baza się "zaśmieci":

```bash
# Opcja 1: Reset przez CLI
supabase db reset

# Opcja 2: Ręcznie przez Dashboard
# Settings > Database > Reset Database
```

### Aktualizacja struktury bazy

Gdy dodajesz nowe migracje:

```bash
# Zaaplikuj nowe migracje do testowej bazy
supabase db push
```

## Następne kroki

Po zakończeniu konfiguracji:

1. Uruchom wszystkie testy: `npm run test:e2e`
2. Sprawdź raport w `playwright-report/index.html`
3. Przeczytaj `tests/e2e/README.md` dla dalszych instrukcji

---

**Pytania?** Otwórz issue w repo lub skontaktuj się z zespołem.
