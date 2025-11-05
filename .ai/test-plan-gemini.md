# Plan Testów - AdoptMe MVP v0.1.0

## 1. Wprowadzenie i Cele Testowania

**Cel główny:** Zapewnienie niezawodności i bezpieczeństwa aplikacji AdoptMe podczas MVP fazy, ze szczególnym naciskiem na krytyczne funkcjonalności: autentykację, katalog psów oraz aplikacje do adopcji.

**Cele szczegółowe:**
- Weryfikacja poprawności flow autentykacji (rejestracja, logowanie, wylogowanie)
- Zabezpieczenie danych użytkownika poprzez testowanie RLS policies
- Zapewnienie dostępności katalogów psów i funkcjonalności filtrowania
- Walidacja formularzy aplikacji do adopcji
- Potwierdzenie responsywności UI na różnych urządzeniach
- Identyfikacja i dokumentacja krytycznych błędów przed deploymentem

---

## 2. Zakres Testów

### Będą testowane:
- ✅ Wszystkie endpointy API (`/api/v1/*`)
- ✅ Systemy autentykacji (register, login, logout, middleware)
- ✅ Operacje bazodanowe (CRUD dla dogs, applications, users)
- ✅ RLS policies i autoryzacja
- ✅ React komponenty (AuthButton, LoginForm, SignupForm, AdoptionForm)
- ✅ Strony Astro (dog details, verify-email)
- ✅ Dark mode i responsywność
- ✅ Integracja z Supabase Auth

### Nie będą testowane (scope MVP):
- ❌ AI recommendations
- ❌ Shelter dashboard
- ❌ Email notifications (poza verification)
- ❌ Performance optimization
- ❌ Load testing

---

## 3. Typy Testów do Przeprowadzenia

### 3.1 Testy Jednostkowe
- **Komponenty React:** LoginForm, SignupForm, AuthButton, AdoptionForm
- **Walidatory:** `auth.validators.ts`, `application.ts`
- **Utility functions:** `getEnv()`, mappers

**Narzędzie:** Vitest + React Testing Library

### 3.2 Testy Integracyjne
- **Endpointy API z Supabase:**
  - POST `/api/v1/auth/register`
  - POST `/api/v1/auth/login`
  - POST `/api/v1/auth/logout`
  - GET `/api/v1/dogs` (z filtrami)
  - GET `/api/v1/cities`
  - GET `/api/v1/shelters`
  - POST `/api/applications`

- **Middleware + Route Handler integration**
- **Database trigger execution** (`handle_new_user`)

**Narzędzie:** Supertest + Vitest

### 3.3 Testy E2E
- Kompletne scenariusze użytkownika (registration → adoption application)
- Nawigacja i routing
- Sesja persistence i logout
- Dark mode toggle
- Responsywność UI

**Narzędzie:** Playwright lub Cypress

### 3.4 Testy Bezpieczeństwa
- RLS policies (`users_select_authenticated`, etc.)
- CSRF protection
- XSS vulnerabilities
- SQL injection prevention (ORM protection)
- Authentication token validation

**Narzędzie:** Manual security review + automated checks

### 3.5 Testy Regresyjne
- Ciągle rosnący test suite
- CI/CD pipeline integration

---

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

### Scenariusz 1: Rejestracja i Logowanie
```
1. Użytkownik przechodzi do /auth/signup
2. Wpisuje email, hasło, potwierdza hasło, zaznacza GDPR
3. Kliknięcie "Załóż konto" → POST /api/v1/auth/register
4. Sprawdzenie:
   - ✓ Email verification email wysłany
   - ✓ Rekord w auth.users utworzony
   - ✓ Rekord w public.users utworzony (trigger)
   - ✓ Redirect do /auth/login
5. Użytkownik loguje się
6. Sprawdzenie:
   - ✓ Cookies ustawione (sb-*-auth-token)
   - ✓ Middleware poprawnie czyta sesję
   - ✓ UI zmienia się na "Wyloguj się"
7. Użytkownik klika "Wyloguj się"
8. Sprawdzenie:
   - ✓ Cookies usunięte
   - ✓ UI wraca do "Zaloguj się" i "Załóż konto"
```

### Scenariusz 2: Katalog Psów i Filtrowanie
```
1. Użytkownik otwiera /
2. Sprawdzenie:
   - ✓ GET /api/v1/dogs zwraca listę psów
   - ✓ GET /api/v1/shelters zwraca schroniska
   - ✓ GET /api/v1/cities zwraca miasta
   - ✓ UI wyświetla karty psów
3. Użytkownik filtruje: size=small, age_category=puppy
4. Sprawdzenie:
   - ✓ API query poprawnie filtruje
   - ✓ UI wyświetla tylko małe szczeniaki
5. Użytkownik klika na psa
6. Sprawdzenie:
   - ✓ Routing do /dogs/[id] działa
   - ✓ GET /api/v1/dogs?id=X zwraca dane psa
   - ✓ UI wyświetla szczegóły psa
```

### Scenariusz 3: Aplikacja do Adopcji
```
1. Zalogowany użytkownik klika "Aplikuj" na stronie psa
2. Wypełnia formularz aplikacji (habitat, experience, contact)
3. POST /api/applications z valideymi danymi
4. Sprawdzenie:
   - ✓ Rekord w adoption_applications utworzony
   - ✓ Użytkownik ID poprawnie przypisany
   - ✓ Dog ID poprawnie przypisany
   - ✓ Status = 'new'
5. Użytkownik jest zalogowany
6. Sprawdzenie:
   - ✓ Middleware ustawiło context.locals.user
   - ✓ Autoryzacja przeszła
   - ✓ Application został przyjęty
```

### Scenariusz 4: RLS Policies
```
1. User A jest zalogowany
2. User A wysyła GET /api/v1/users/USER_B_ID
3. Sprawdzenie:
   - ✓ RLS policy uniemożliwia dostęp
   - ✓ Brak nieskończonej rekursji w policy
4. User A wysyła GET /api/v1/users/USER_A_ID
5. Sprawdzenie:
   - ✓ RLS policy zezwala
   - ✓ Dane się ładują
```

---

## 5. Środowisko Testowe

| Komponent | Konfiguracja |
|-----------|-------------|
| **Node.js** | 22.14.0+ |
| **npm** | 10+ |
| **Dev Server** | Astro dev (port 4323) |
| **Baza Danych** | Supabase project (production dla integration tests) |
| **Environment** | `.env.test` z test credentials |
| **Browser** | Chrome/Firefox/Edge (dla E2E) |

### Zmienne Środowiskowe Testowe
```bash
SUPABASE_URL=https://[test-project].supabase.co
SUPABASE_KEY=[test-anon-key]
PUBLIC_APP_URL=http://localhost:4323
NODE_ENV=test
```

---

## 6. Narzędzia do Testowania

| Typ Testu | Narzędzie | Konfiguracja |
|-----------|----------|-------------|
| **Unit/Integration** | Vitest | `vitest.config.ts` |
| **React Components** | React Testing Library | `npm install --save-dev @testing-library/react` |
| **API Routes** | Supertest | `npm install --save-dev supertest` |
| **E2E** | Playwright | `npm install --save-dev @playwright/test` |
| **Type Checking** | TypeScript | `tsc --noEmit` |
| **Linting** | ESLint | `npm run lint` |
| **Code Coverage** | c8 / Vitest coverage | Wbudowane w Vitest |

---

## 7. Harmonogram Testów

### Sprint 1 (Week 1)
- **Dni 1-2:** Konfiguracja frameworków testowych
- **Dni 3-4:** Testy jednostkowe komponenti React (LoginForm, SignupForm, AuthButton)
- **Dni 5:** Testy integracyjne API endpoints

### Sprint 2 (Week 2)
- **Dni 1-2:** Testy E2E (Playwright) - complete user flows
- **Dni 3-4:** Testy bezpieczeństwa (RLS, CSRF, XSS)
- **Dni 5:** Refactoring testów, documentation

### Continuous (Każdy sprint)
- Pre-commit hooks (ESLint, TypeScript check)
- CI/CD pipeline (GitHub Actions)
- Code coverage reports (minimum 70%)

---

## 8. Kryteria Akceptacji Testów

### Kryteria Dla Kodu
- ✅ Minimum **70% code coverage** dla endpoints
- ✅ Minimum **80% coverage** dla auth service
- ✅ **Zero TypeScript errors** (`tsc --noEmit`)
- ✅ **Zero ESLint errors** (`npm run lint`)
- ✅ **Wszystkie E2E scenariusze zielone**

### Kryteria Dla Funkcjonalności
- ✅ Register endpoint: **wszystkie 5 test cases zielone**
- ✅ Login endpoint: **wszystkie 4 test cases zielone**
- ✅ Dog catalog: **all filtering combinations work**
- ✅ RLS policies: **no infinite recursion, proper authorization**
- ✅ Adoption form: **validation + submission working**

### Kryteria Dla Bezpieczeństwa
- ✅ Brak ujawnienia sensytywnych danych w response
- ✅ RLS policies chronią dane użytkowników
- ✅ Brak SQL injection vulnerabilities
- ✅ Auth tokens są szyfrowane w cookies

---

## 9. Role i Odpowiedzialności

| Rola | Odpowiedzialność | Osoba |
|------|------------------|-------|
| **QA Lead** | Planowanie testów, dokumentacja, raportowanie | TBD |
| **Frontend QA** | Testy E2E, komponenty React, UI/UX | TBD |
| **Backend QA** | Testy API, integracja, bezpieczeństwo | TBD |
| **Dev Lead** | Code review, zatwierdzenie testów | TBD |
| **DevOps** | CI/CD setup, test automation | TBD |

---

## 10. Procedury Raportowania Błędów

### Format Raportu Błędu
```markdown
**Title:** [Component/Feature] - Brief description

**Severity:** Critical | High | Medium | Low

**Environment:**
- OS: Windows/Mac/Linux
- Browser: Chrome/Firefox
- Version: v0.1.0

**Reproduction Steps:**
1. Step 1
2. Step 2
3. ...

**Expected Result:**
What should happen?

**Actual Result:**
What actually happened?

**Screenshots/Logs:**
[Attach evidence]

**Related Files:**
- src/pages/api/v1/...
- src/components/...
```

### Bug Triage Process
1. **Report** → QA Engineer tworzy issue w GitHub
2. **Triage** → Dev Lead ocenia severity i priority
3. **Assignment** → Bug przydzielony developerowi
4. **Fix** → Developer fixes i pisze tests
5. **Verification** → QA Engineer weryfikuje fix
6. **Close** → Issue zamknięty jeśli fix OK

### Escalation Path
- **Critical (P0):** Immediate notification, team standup
- **High (P1):** Daily checkins, max 24h fix window
- **Medium (P2):** Regular checkins, max 3 days
- **Low (P3):** Backlog, plan na następny sprint

---

## Dodatek: GitHub Actions CI/CD Configuration

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'

      - run: npm install
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

**Dokument zaktualizowany:** 2025-11-05
**Status:** Ready for implementation
**Następne kroki:** Setup test infrastructure, hire QA team
