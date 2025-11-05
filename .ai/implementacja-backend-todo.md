# TODO: Implementacja Backend dla Autentykacji

## Status: 📋 Oczekuje na implementację

Kolejna faza implementacji modułu autentykacji - backend API, middleware, serwisy.

---

## Faza 1: Backend Core (2-3 dni)

### Middleware
- [ ] **src/middleware/index.ts** - Rozszerzenie middleware
  - [ ] Odczyt `sb-access-token` i `sb-refresh-token` z cookies
  - [ ] Wywołanie `supabase.auth.getUser(accessToken)`
  - [ ] Pobranie pełnych danych użytkownika z tabeli `users`
  - [ ] Wypełnienie `context.locals.user`
  - [ ] Obsługa wygaśnięcia tokena (refresh token flow)
  - [ ] Aktualizacja cookies po odświeżeniu
  - [ ] Error handling (kontynuacja bez użytkownika przy błędzie)

### TypeScript Types
- [ ] **src/env.d.ts** - Rozszerzenie typów Astro.locals
  ```typescript
  interface Locals {
    supabase: SupabaseClient;
    user?: DTO.UserResponse;
    session?: { accessToken: string; refreshToken: string };
  }
  ```

- [ ] **src/types.ts** - Dodanie typów Auth
  - [ ] `LoginCommand`
  - [ ] `RegisterCommand`
  - [ ] `AuthResponse`
  - [ ] `ForgotPasswordCommand`
  - [ ] `ResetPasswordCommand`

### Walidatory Zod
- [ ] **src/lib/validators/auth.validators.ts**
  - [ ] `emailSchema` - walidacja formatu e-mail
  - [ ] `passwordSchema` - min 8, wielka/mała litera, cyfra
  - [ ] `registerCommandSchema` - pełna walidacja rejestracji
  - [ ] `loginCommandSchema` - walidacja logowania
  - [ ] `forgotPasswordCommandSchema` - walidacja e-mail
  - [ ] `resetPasswordCommandSchema` - walidacja + token UUID

### Auth Service
- [ ] **src/lib/services/auth.service.ts**
  - [ ] `register(command)` - rejestracja + zapis do tabeli users
  - [ ] `login(command)` - logowanie + pobranie danych z users
  - [ ] `logout()` - wylogowanie przez Supabase Auth
  - [ ] `forgotPassword(email)` - reset hasła
  - [ ] `resetPassword(token, password)` - zmiana hasła
  - [ ] `verifyEmail(token)` - weryfikacja e-maila
  - [ ] `getCurrentUser(accessToken)` - pobranie użytkownika (internal)
  - [ ] `refreshSession(refreshToken)` - odświeżenie sesji

### Supabase Error Mapping
- [ ] **src/lib/utils/supabase-errors.ts**
  - [ ] Mapowanie błędów Supabase na user-friendly komunikaty
  - [ ] "Invalid login credentials" → "Nieprawidłowy e-mail lub hasło"
  - [ ] "Email not confirmed" → "E-mail niezweryfikowany"
  - [ ] "User already registered" → "E-mail już zajęty"

---

## Faza 2: API Endpoints (2-3 dni)

### Endpointy
- [ ] **src/pages/api/v1/auth/register.ts**
  - [ ] POST handler
  - [ ] Walidacja przez registerCommandSchema
  - [ ] Wywołanie AuthService.register()
  - [ ] Odpowiedź: 201 Created lub 400/500 błąd
  - [ ] `export const prerender = false`

- [ ] **src/pages/api/v1/auth/login.ts**
  - [ ] POST handler
  - [ ] Walidacja przez loginCommandSchema
  - [ ] Wywołanie AuthService.login()
  - [ ] Ustawienie HttpOnly cookies (access_token, refresh_token)
  - [ ] Odpowiedź: 200 OK z user + session lub 400/401/500 błąd
  - [ ] Cookie config: HttpOnly, Secure (prod), SameSite=Lax

- [ ] **src/pages/api/v1/auth/logout.ts**
  - [ ] POST handler
  - [ ] Wywołanie AuthService.logout()
  - [ ] Usunięcie cookies (maxAge = 0)
  - [ ] Odpowiedź: 200 OK

- [ ] **src/pages/api/v1/auth/forgot-password.ts**
  - [ ] POST handler
  - [ ] Walidacja przez forgotPasswordCommandSchema
  - [ ] Wywołanie AuthService.forgotPassword()
  - [ ] Odpowiedź: 200 OK (zawsze sukces dla security)

- [ ] **src/pages/api/v1/auth/reset-password.ts**
  - [ ] POST handler
  - [ ] Walidacja przez resetPasswordCommandSchema
  - [ ] Wywołanie AuthService.resetPassword()
  - [ ] Odpowiedź: 200 OK lub 400 (invalid token)

### Error Handling w Endpoints
- [ ] Try-catch pattern we wszystkich endpointach
- [ ] Obsługa ZodError (400 z details)
- [ ] Obsługa błędów biznesowych (status codes per error type)
- [ ] Logi błędów (console.error)
- [ ] Zwracanie JSON z { error, details? }

---

## Faza 3: Supabase Configuration (1 dzień)

### Zmienne środowiskowe
- [ ] **.env** - Dodanie brakujących zmiennych
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_KEY`
  - [ ] `SUPABASE_JWT_SECRET`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (opcjonalnie)
  - [ ] `PUBLIC_APP_URL` (dla redirectów w emailach)

### Supabase Dashboard
- [ ] **Authentication → Email Templates**
  - [ ] Szablon "Confirm signup" (weryfikacja e-mail)
  - [ ] Szablon "Reset password" (odzyskiwanie hasła)
  - [ ] Konfiguracja URL redirectów

- [ ] **Authentication → URL Configuration**
  - [ ] Site URL: `https://adoptme.pl` lub `http://localhost:4323`
  - [ ] Redirect URLs: `/auth/**`

- [ ] **Authentication → Settings**
  - [ ] Enable Email Confirmations: ✅
  - [ ] Email Confirmation Method: Magic Link lub OTP
  - [ ] Double Confirm Email Changes: ✅
  - [ ] Minimum Password Length: 8
  - [ ] Secure Password Requirements: ✅

### Row Level Security (RLS)
- [ ] **Polityki dla tabeli `users`**
  - [ ] "Users can read own data" - SELECT dla auth.uid()
  - [ ] "Users can update own data" - UPDATE dla auth.uid() (bez zmiany role)
  - [ ] "Service can create users" - INSERT dla service_role
  - [ ] "Admin can read all users" - SELECT dla admin role

- [ ] **Polityki dla tabeli `adoption_applications`**
  - [ ] "Users can read own applications"
  - [ ] "Shelter staff can read applications for their dogs"
  - [ ] "Users can create own applications"
  - [ ] "Shelter staff can update application status"

- [ ] **Polityki dla tabeli `lifestyle_profiles`**
  - [ ] "Users can read own profile"
  - [ ] "Users can upsert own profile"
  - [ ] "Shelter staff can read profiles with applications"

### Database Triggers
- [ ] **Trigger: handle_new_user**
  - [ ] Funkcja SQL do tworzenia użytkownika w tabeli `users` po rejestracji
  - [ ] Trigger: AFTER INSERT ON auth.users
  - [ ] Domyślna rola: `adopter`

- [ ] **Trigger: update_updated_at**
  - [ ] Funkcja SQL do aktualizacji `updated_at`
  - [ ] Trigger dla wszystkich tabel z `updated_at`

### Supabase Client
- [ ] **src/db/supabase.client.ts** - Aktualizacja
  - [ ] Usunięcie `DEFAULT_USER_ID` constant
  - [ ] Konfiguracja auth options:
    - [ ] `autoRefreshToken: true`
    - [ ] `persistSession: false` (zarządzane przez cookies)
    - [ ] `detectSessionInUrl: true` (dla magic links)
    - [ ] `flowType: 'pkce'` (bezpieczeństwo)
  - [ ] Funkcja `createServerSupabaseClient(accessToken)`

---

## Faza 4: Auth Guards i Security (1-2 dni)

### Auth Guards (Server-side)
- [ ] **src/lib/utils/auth-guards.ts**
  - [ ] `requireAuth(context)` - sprawdza czy zalogowany, jeśli nie → redirect
  - [ ] `requireRole(context, allowedRoles)` - sprawdza rolę, jeśli nie pasuje → 403
  - [ ] `redirectIfAuthenticated(context)` - dla stron login/register

### Zabezpieczenie stron
- [ ] **src/pages/dogs/[id]/adopt.astro**
  - [ ] Użycie `requireAuth()` lub `requireRole(['adopter'])`

- [ ] **src/pages/shelter/dashboard.astro** (przyszłość)
  - [ ] Użycie `requireRole(['shelter_staff', 'admin'])`

- [ ] **src/pages/profile.astro** (przyszłość)
  - [ ] Użycie `requireAuth()`

### CSRF Protection
- [ ] **src/middleware/index.ts** - Rozszerzenie
  - [ ] Sprawdzenie origin header dla POST/PUT/DELETE
  - [ ] Allowed origins: localhost:4323, adoptme.pl
  - [ ] Return 403 jeśli origin nieprawidłowy

### Rate Limiting (opcjonalne dla MVP)
- [ ] **src/lib/utils/rate-limit.ts**
  - [ ] In-memory rate limiter (Map)
  - [ ] `checkRateLimit(identifier, maxRequests, windowMs)`

- [ ] Użycie w endpointach login/register:
  - [ ] Login: 5 prób na 15 minut per IP
  - [ ] Register: 3 próby na godzinę per IP

### Secure Headers
- [ ] **astro.config.mjs** - Dodanie headers
  - [ ] `X-Frame-Options: DENY`
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `Referrer-Policy: strict-origin-when-cross-origin`
  - [ ] `Permissions-Policy` (geolocation, microphone, camera)

---

## Faza 5: Migracja i czyszczenie (1 dzień)

### Usunięcie DEFAULT_USER_ID
- [ ] **src/db/supabase.client.ts** - Usunięcie stałej
- [ ] **src/pages/api/v1/applications.ts** (lub inne) - Zamiana na `context.locals.user.id`
- [ ] Przeszukanie codebase grep'em: `grep -r "DEFAULT_USER_ID" src/`

### Aktualizacja istniejących API
- [ ] Dodanie sprawdzenia autentykacji w endpointach wymagających użytkownika
- [ ] Użycie `context.locals.user` zamiast DEFAULT_USER_ID
- [ ] Dodanie obsługi błędu 401 Unauthorized

---

## Faza 6: Testing (1-2 dni)

### Testy manualne
- [ ] Rejestracja → weryfikacja e-mail → logowanie (pełny flow)
- [ ] Logowanie z prawidłowymi danymi
- [ ] Logowanie z błędnymi danymi
- [ ] Logowanie z niezweryfikowanym e-mailem
- [ ] Odzyskiwanie hasła → kliknięcie linku → reset hasła
- [ ] Wylogowanie
- [ ] Próba dostępu do chronionej strony (niezalogowany)
- [ ] Próba dostępu do chronionej strony (zła rola)
- [ ] Refresh token flow (pozostawienie sesji na kilka godzin)
- [ ] AuthButton dropdown menu (różne role)

### Testy Postman/Insomnia
- [ ] POST /api/v1/auth/register - prawidłowe dane
- [ ] POST /api/v1/auth/register - email już zajęty
- [ ] POST /api/v1/auth/register - słabe hasło
- [ ] POST /api/v1/auth/login - prawidłowe dane
- [ ] POST /api/v1/auth/login - błędne dane
- [ ] POST /api/v1/auth/logout
- [ ] POST /api/v1/auth/forgot-password
- [ ] POST /api/v1/auth/reset-password

### Testy security
- [ ] Próba CSRF attack (request z innego origin)
- [ ] Próba brute-force logowania (rate limiting)
- [ ] Próba dostępu do cudzych danych (RLS)
- [ ] SQL injection w inputach (Supabase chroni)
- [ ] XSS w formularzach (React chroni)

### Testy accessibility
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader (ARIA labels, live regions)
- [ ] Focus management (po błędzie, po submit)

### Testy responsywności
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1024px+)
- [ ] Dark mode

---

## Faza 7: Dokumentacja (1 dzień)

### README
- [ ] Sekcja "Authentication" w głównym README
- [ ] Instrukcja setup (zmienne środowiskowe)
- [ ] Przykłady użycia auth guards
- [ ] Flow rejestracji i logowania

### Komentarze w kodzie
- [ ] JSDoc dla wszystkich publicznych metod AuthService
- [ ] Komentarze dla skomplikowanych części middleware
- [ ] TODO dla feature'ów post-MVP (2FA, social login)

### API Documentation (opcjonalnie)
- [ ] Swagger/OpenAPI spec dla endpointów auth
- [ ] Przykłady request/response
- [ ] Status codes i error messages

---

## Metryki sukcesu

Po zakończeniu implementacji backend:

- [ ] ✅ Wszystkie scenariusze z specyfikacji działają poprawnie
- [ ] ✅ Brak błędów w console (browser i server)
- [ ] ✅ Wszystkie endpointy zwracają odpowiednie status codes
- [ ] ✅ RLS policies działają (nie można odczytać cudzych danych)
- [ ] ✅ Weryfikacja e-mail działa
- [ ] ✅ Odzyskiwanie hasła działa
- [ ] ✅ Refresh token automatycznie odświeża sesję
- [ ] ✅ AuthButton wyświetla się poprawnie dla różnych ról
- [ ] ✅ Chronione strony przekierowują do logowania
- [ ] ✅ Czas logowania < 1s
- [ ] ✅ Czas rejestracji < 3s (bez wysyłki e-mail)

---

## Priorytet

1. **MUST HAVE (MVP)**
   - Middleware (odczyt sesji)
   - Endpointy: register, login, logout
   - AuthService (podstawowe metody)
   - Walidatory Zod
   - Supabase Auth config
   - RLS policies
   - Usunięcie DEFAULT_USER_ID

2. **SHOULD HAVE (MVP)**
   - Endpointy: forgot-password, reset-password
   - Weryfikacja e-mail
   - Auth guards (requireAuth, requireRole)
   - Error handling i mapping

3. **NICE TO HAVE (post-MVP)**
   - Rate limiting
   - CSRF protection (oprócz SameSite cookies)
   - Audit log
   - 2FA
   - Social login

---

## Przewidywany czas: 6-8 dni roboczych

**Uwaga**: Implementacja UI jest zakończona. Wszystkie formularze i strony są gotowe i czekają na integrację z backendem.

