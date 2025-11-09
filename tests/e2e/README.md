# E2E Tests - Adopt-Me Application

Kompleksowe testy end-to-end dla aplikacji Adopt-Me, pokrywające główny flow adopcji psów.

## ⚠️ WAŻNE: Konfiguracja testowej bazy danych

Testy e2e używają **dedykowanej testowej bazy danych Supabase**, oddzielonej od środowiska produkcyjnego i deweloperskiego.

### Wymagana konfiguracja przed uruchomieniem testów

1. **Utwórz plik `.env.test`** (na podstawie `.env.test.example`):
   ```bash
   cp .env.test.example .env.test
   ```

2. **Wypełnij zmienne środowiskowe**:
   ```env
   # Test Database
   SUPABASE_URL=https://your-test-project.supabase.co
   SUPABASE_PUBLIC_KEY=your-test-anon-public-key

   # E2E Test User (musi już istnieć w bazie!)
   E2E_USERNAME_ID=00000000-0000-0000-0000-000000000000
   E2E_USERNAME=e2e-test-user@adoptme-test.pl
   E2E_PASSWORD=TestPassword123!
   ```

3. **Utwórz użytkownika testowego w Supabase**:
   - Przejdź do: Supabase Dashboard > Authentication > Users
   - Kliknij "Add user" > "Create new user"
   - Wprowadź email i hasło z `.env.test`
   - Potwierdź email użytkownika (toggle "Email confirmed")
   - Skopiuj UUID użytkownika do `E2E_USERNAME_ID`

4. **Upewnij się, że testowa baza ma dane**:
   - Testowa baza potrzebuje co najmniej kilku psów do adopcji
   - Załaduj przykładowe dane przez migracje lub ręcznie

### Dlaczego dedykowana baza testowa?

✅ **Izolacja** - Testy nie wpływają na dane produkcyjne
✅ **Szybkość** - Istniejący użytkownik testowy = szybsze testy
✅ **Czytelność** - Łatwiejsze debugowanie z konsystentnym użytkownikiem
✅ **Bezpieczeństwo** - Brak ryzyka uszkodzenia prawdziwych danych

## Struktura testów

```
tests/e2e/
├── pages/                          # Page Object Models
│   ├── AdoptionFormPage.ts        # Formularz adopcji (CORE)
│   ├── AuthPages.ts               # Rejestracja i logowanie
│   └── DogsPage.ts                # Katalog psów
├── helpers/                        # Funkcje pomocnicze
│   ├── AuthHelper.ts              # Zarządzanie autentykacją
│   └── test-data.ts               # Dane testowe
├── adoption-flow.spec.ts          # Główne testy adopcji (16 testów)
├── dogs.spec.ts                   # Testy katalogu psów
└── homepage.spec.ts               # Testy strony głównej
```

## Uruchomienie testów

### Wszystkie testy e2e
```bash
npm run test:e2e
```

### Tylko testy adoption flow
```bash
npx playwright test adoption-flow
```

### Testy w trybie UI (interactive)
```bash
npx playwright test --ui
```

### Testy w trybie debug
```bash
npx playwright test --debug
```

### Testy na konkretnym urządzeniu
```bash
npx playwright test --project=chromium
```

## Pokrycie testów

### 15 aktywnych testów adoption flow (1 skipped):

#### ✅ Happy Path (6 testów)
1. **Authenticated user submission** - Zalogowany użytkownik wysyła wniosek
2. **Contact preference selection** - Wybór metody kontaktu
3. **Optional additional notes** - Dodatkowe uwagi
4. **Complete registration flow** - Pełna rejestracja + adopcja
5. **Navigate from catalog** - Nawigacja z katalogu
6. **Catalog search** - Wyszukiwanie psów

#### ✅ Validation (3 testy)
7. **Required fields validation** - Walidacja wymaganych pól
8. **Minimum character length** - Minimalna liczba znaków
9. **Invalid login credentials** - Błędne dane logowania

#### ✅ Authentication (1 test)
10. **Unauthenticated user CTAs** - Przyciski dla niezalogowanych

#### ⏭️ Error Handling (2 testy + 1 skipped)
11. **~~Duplicate application~~** - ⏭️ SKIPPED (wymaga cleanup mechanizmu)
12. **Network error** - Błąd sieci
13. **Unavailable dog** - Niedostępny pies

#### ✅ Loading States (1 test)
14. **Form submission loading** - Stan ładowania

#### ✅ Responsive Design (2 testy)
15. **Mobile adoption form** - Formularz na mobile
16. **Tablet adoption form** - Formularz na tablet

**Notatka**: Test "Duplicate application" jest obecnie pominięty (`.skip()`), ponieważ wymagałby mechanizmu czyszczenia bazy testowej lub tworzenia tymczasowych użytkowników. To funkcjonalność powinna być testowana na poziomie API/integracji.

## Page Object Models

### AdoptionFormPage
Główny komponent testów - formularz adopcji:
```typescript
const adoptionForm = new AdoptionFormPage(page);
await adoptionForm.goto(dogId);
await adoptionForm.submitCompleteForm({
  motivation: 'Tekst motywacyjny...',
  contactPreference: 'email',
  extraNotes: 'Dodatkowe uwagi...'
});
await adoptionForm.expectSuccess();
```

### AuthPages (SignupPage, LoginPage)
Rejestracja i logowanie:
```typescript
const signupPage = new SignupPage(page);
await signupPage.goto();
await signupPage.signup({ email, password });
await signupPage.expectSuccess();

const loginPage = new LoginPage(page);
await loginPage.goto();
await loginPage.login(email, password);
await loginPage.waitForSuccessfulLogin();
```

### DogsPage
Katalog psów z filtrowaniem:
```typescript
const dogsPage = new DogsPage(page);
await dogsPage.goto();
await dogsPage.search('Labrador');
await dogsPage.filterBySize('large');
await dogsPage.clickViewDetails(0);
```

## Helpers

### AuthHelper
Uproszczone zarządzanie autentykacją:

```typescript
// Szybkie logowanie jako E2E test user (ZALECANE)
// Używa istniejącego użytkownika z .env.test
const testUser = await AuthHelper.quickLogin(page);

// Lub bardziej explicitnie:
const testUser = await AuthHelper.quickLoginAsE2EUser(page);

// Pobranie danych E2E użytkownika
const e2eUser = AuthHelper.getE2ETestUser();

// Tworzenie NOWEGO użytkownika (tylko dla testów rejestracji!)
const newUser = await AuthHelper.createAndLoginTestUser(page);

// Wylogowanie
await AuthHelper.logout(page);
```

**⚠️ WAŻNE**: Większość testów powinna używać `quickLogin()` lub `quickLoginAsE2EUser()`, które używają dedykowanego użytkownika testowego z `.env.test`. Tworzenie nowych użytkowników powinno być ograniczone tylko do testów funkcjonalności rejestracji.

### Test Data
Gotowe dane testowe:
```typescript
import { validAdoptionData, invalidAdoptionData } from './helpers/test-data';

// Prawidłowe dane
await adoptionForm.submitCompleteForm(validAdoptionData.short);

// Nieprawidłowe dane (do testów walidacji)
await adoptionForm.fillMotivation(invalidAdoptionData.tooShort.motivation);
```

## Data Test IDs

Wszystkie kluczowe elementy mają atrybuty `data-test-id` dla stabilnych selektorów:

### AdoptionForm
- `adoption-form-container` - kontener formularza
- `adoption-form-motivation` - pole motywacji
- `adoption-form-contact-preference` - wybór kontaktu
- `adoption-form-consent-checkbox` - zgoda GDPR
- `adoption-form-submit-button` - przycisk wysyłania
- `adoption-form-success` - komunikat sukcesu
- `adoption-form-global-error` - komunikat błędu

### SignupForm
- `signup-form-email` - pole email
- `signup-form-password` - pole hasła
- `signup-form-gdpr-checkbox` - zgoda GDPR
- `signup-form-submit-button` - przycisk rejestracji
- `signup-form-success` - komunikat sukcesu

### LoginForm
- `login-form-email` - pole email
- `login-form-password` - pole hasła
- `login-form-submit-button` - przycisk logowania
- `login-form-error` - komunikat błędu

### DogCard & Catalog
- `dog-card` - karta psa
- `dog-card-name` - nazwa psa
- `dog-card-view-details-button` - przycisk szczegółów
- `dog-filters-search` - wyszukiwarka
- `dog-filters-size` - filtr rozmiaru
- `dog-filters-age` - filtr wieku

## Best Practices

1. **Używaj Page Objects** - Nigdy nie używaj selektorów bezpośrednio w testach
2. **Używaj AuthHelper.quickLogin()** - Dla testów nie testujących logowania
3. **Czekaj na stany** - Używaj `waitForSuccess()` zamiast `waitForTimeout()`
4. **Cleanup** - Każdy test powinien być niezależny
5. **Data test IDs** - Zawsze preferuj `data-test-id` nad CSS selektorami

## Debugowanie

### Tryb headed (z przeglądarką)
```bash
npx playwright test --headed
```

### Slow motion (wolniejsze wykonanie)
```bash
npx playwright test --headed --slow-mo=1000
```

### Zrzuty ekranu przy błędach
Automatycznie tworzone w `test-results/`

### Playwright Inspector
```bash
npx playwright test --debug
```

### Trace viewer
```bash
npx playwright show-trace test-results/.../trace.zip
```

## CI/CD

Testy są skonfigurowane do uruchomienia w CI:
- Automatyczne retries: 2x
- Screenshots: tylko przy błędach
- Video: tylko przy błędach
- Trace: przy pierwszym retry

## Troubleshooting

### ❌ Błąd: "E2E test user credentials not found"
```
Error: E2E test user credentials not found in environment variables.
Please ensure E2E_USERNAME and E2E_PASSWORD are set in .env.test
```

**Rozwiązanie**:
1. Upewnij się, że plik `.env.test` istnieje
2. Sprawdź, czy wszystkie wymagane zmienne są wypełnione
3. Zrestartuj terminal/IDE aby załadować nowe zmienne

### ❌ Błąd: "Quick login failed: 401"
```
Quick login failed: 401
User: e2e-test-user@adoptme-test.pl
Response: Invalid credentials
```

**Możliwe przyczyny**:
1. Użytkownik nie istnieje w testowej bazie danych
2. Nieprawidłowe hasło w `.env.test`
3. Email użytkownika nie został potwierdzony w Supabase
4. Aplikacja łączy się z niewłaściwą bazą danych

**Rozwiązanie**:
1. Sprawdź czy użytkownik istnieje w Supabase Dashboard > Authentication
2. Upewnij się, że email jest potwierdzony (Email confirmed = ✅)
3. Sprawdź czy hasło w `.env.test` zgadza się z hasłem w bazie
4. Zweryfikuj `SUPABASE_URL` i `SUPABASE_PUBLIC_KEY`

### ⚠️ Brak psów w katalogu
Testy automatycznie się pomijają gdy brak psów:
```
Test skipped: No dogs available in catalog
```

**Rozwiązanie**: Dodaj przykładowe dane psów do testowej bazy danych.

### ⏱️ Błędy timeout
Zwiększ timeout w `playwright.config.ts`:
```typescript
timeout: 60 * 1000, // 60s
```

### 🗄️ Błędy połączenia z bazą danych
**Symptomy**: Testy nie mogą się połączyć z Supabase

**Rozwiązanie**:
1. Sprawdź czy `SUPABASE_URL` jest poprawny
2. Sprawdź czy `SUPABASE_PUBLIC_KEY` jest poprawny (anon key, nie service_role)
3. Sprawdź czy testowa baza Supabase jest aktywna
4. Zweryfikuj połączenie sieciowe

## Dodawanie nowych testów

1. Utwórz nowy Page Object jeśli potrzebny
2. Dodaj data-test-id do komponentów
3. Napisz test używając Page Objects
4. Dodaj dane testowe do `test-data.ts` jeśli potrzebne

## Kontakt

Pytania? Issues? https://github.com/your-repo/adopt-me/issues
