# Specyfikacja techniczna modułu autentykacji AdoptMe

## Kluczowe założenia architektury

### Strategia zarządzania stanem użytkownika
- **Server-side**: Middleware automatycznie wypełnia `Astro.locals.user` na podstawie cookie sesji
- **Client-side**: Dane użytkownika przekazywane jako props do komponentów React
- **Auth Store**: Inicjalizacja Zustand store na podstawie danych z serwera (bez dodatkowych zapytań API)
- **Brak endpointu `/me`**: Dane użytkownika dostępne bezpośrednio z middleware, nie ma potrzeby tworzenia osobnego API

### Liczba endpointów API
Specyfikacja definiuje **5 endpointów autentykacji**:
1. POST `/api/v1/auth/register` - rejestracja nowego użytkownika
2. POST `/api/v1/auth/login` - logowanie użytkownika
3. POST `/api/v1/auth/logout` - wylogowanie użytkownika
4. POST `/api/v1/auth/forgot-password` - inicjowanie odzyskiwania hasła
5. POST `/api/v1/auth/reset-password` - ustawienie nowego hasła

### Uproszczenia względem standardowego flow
- ❌ Brak osobnego endpointu do pobierania danych użytkownika (GET `/api/v1/auth/me`)
- ❌ Brak dodatkowej tabeli `profiles` - informacje użytkownika przechowywane w tabeli `users`
- ✅ Dane użytkownika dostępne natychmiast przy SSR (Server-Side Rendering)
- ✅ Pojedyncze źródło prawdy - middleware jako punkt zarządzania sesją

---

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1 Nowe strony i komponenty

#### 1.1.1 Strony Astro (Server-Side Rendered)

**`src/pages/auth/login.astro`**
- **Cel**: Strona logowania użytkownika
- **Renderowanie**: SSR (Server-Side Rendering) z `output: 'server'`
- **Zawartość**:
  - Formularz logowania z komponentem React `LoginForm`
  - Link do strony rejestracji
  - Link do strony odzyskiwania hasła
  - Komunikat o błędach przekazany z query params (np. po nieudanej próbie logowania)
- **Logika server-side**:
  - Sprawdzenie czy użytkownik jest już zalogowany (odczyt sesji z `context.locals.session`)
  - Jeśli zalogowany, redirect do strony głównej lub dashboardu
  - Obsługa query params dla komunikatów (success, error, message)
- **Meta**: Tytuł "Logowanie - AdoptMe", brak indeksowania (noindex)

**`src/pages/auth/register.astro`**
- **Cel**: Strona rejestracji nowego użytkownika
- **Renderowanie**: SSR
- **Zawartość**:
  - Formularz rejestracji z komponentem React `RegisterForm`
  - Checkbox zgody na przetwarzanie danych RODO (wymagany)
  - Link do strony logowania
  - Informacja o konieczności weryfikacji e-mail
- **Logika server-side**:
  - Sprawdzenie czy użytkownik jest już zalogowany
  - Jeśli zalogowany, redirect do strony głównej
- **Meta**: Tytuł "Rejestracja - AdoptMe", brak indeksowania

**`src/pages/auth/forgot-password.astro`**
- **Cel**: Strona do inicjowania procesu odzyskiwania hasła
- **Renderowanie**: SSR
- **Zawartość**:
  - Formularz z polem e-mail - komponent React `ForgotPasswordForm`
  - Instrukcje co zrobić po wysłaniu formularza
  - Link powrotu do strony logowania
- **Logika server-side**:
  - Brak potrzeby sprawdzania sesji (dostępne dla wszystkich)
- **Meta**: Tytuł "Odzyskiwanie hasła - AdoptMe"

**`src/pages/auth/reset-password.astro`**
- **Cel**: Strona do ustawiania nowego hasła po kliknięciu linku z e-maila
- **Renderowanie**: SSR
- **Zawartość**:
  - Formularz z nowymi hasłami - komponent React `ResetPasswordForm`
  - Walidacja tokena z URL
- **Logika server-side**:
  - Odczyt tokena z query params
  - Weryfikacja ważności tokena poprzez Supabase Auth
  - Jeśli token nieprawidłowy, wyświetlenie komunikatu błędu
- **Meta**: Tytuł "Ustaw nowe hasło - AdoptMe"

**`src/pages/auth/verify-email.astro`**
- **Cel**: Strona potwierdzenia e-maila (landing page po kliknięciu linku)
- **Renderowanie**: SSR
- **Zawartość**:
  - Komunikat o sukcesie/błędzie weryfikacji
  - Przycisk przekierowania do logowania
- **Logika server-side**:
  - Odczyt tokena weryfikacyjnego z URL
  - Wywołanie Supabase Auth do weryfikacji
  - Przekierowanie do logowania z odpowiednim komunikatem
- **Meta**: Tytuł "Weryfikacja e-mail - AdoptMe"

**`src/pages/auth/logout.astro`**
- **Cel**: Endpoint do wylogowania użytkownika
- **Renderowanie**: SSR
- **Zawartość**: Brak (redirect)
- **Logika server-side**:
  - Wywołanie `supabase.auth.signOut()`
  - Usunięcie cookie sesji
  - Redirect do strony głównej z komunikatem o wylogowaniu

#### 1.1.2 Komponenty React (Client-Side)

**`src/components/auth/LoginForm.tsx`**
- **Typ**: Client-side React component (interactive)
- **Props**:
  - `redirectTo?: string` - opcjonalny URL przekierowania po zalogowaniu
- **Stan lokalny**:
  - `email: string`
  - `password: string`
  - `isLoading: boolean`
  - `error: string | null`
- **Walidacja**:
  - E-mail: format e-mail (regex), wymagany
  - Hasło: minimum 8 znaków, wymagane
- **Akcje**:
  - Submit: POST do `/api/v1/auth/login`
  - Przy sukcesie: redirect do `redirectTo` lub `/`
  - Przy błędzie: wyświetlenie komunikatu (nieprawidłowe dane, konto niezweryfikowane)
- **Accessibility**:
  - Labels powiązane z inputami
  - Komunikaty błędów w `aria-live="polite"`
  - Focus management po błędzie

**`src/components/auth/RegisterForm.tsx`**
- **Typ**: Client-side React component
- **Props**: Brak
- **Stan lokalny**:
  - `email: string`
  - `password: string`
  - `confirmPassword: string`
  - `gdprConsent: boolean`
  - `isLoading: boolean`
  - `error: string | null`
  - `success: boolean`
- **Walidacja**:
  - E-mail: format e-mail, wymagany, unikalność (sprawdzana na backendzie)
  - Hasło: minimum 8 znaków, zawiera wielką literę, małą literę, cyfrę
  - Potwierdzenie hasła: musi być identyczne z hasłem
  - Zgoda RODO: wymagana (checkbox musi być zaznaczony)
- **Akcje**:
  - Submit: POST do `/api/v1/auth/register`
  - Przy sukcesie: wyświetlenie komunikatu o wysłaniu e-maila weryfikacyjnego
  - Przy błędzie: wyświetlenie komunikatu (email zajęty, słabe hasło)
- **Accessibility**: Jak w LoginForm

**`src/components/auth/ForgotPasswordForm.tsx`**
- **Typ**: Client-side React component
- **Props**: Brak
- **Stan lokalny**:
  - `email: string`
  - `isLoading: boolean`
  - `error: string | null`
  - `success: boolean`
- **Walidacja**:
  - E-mail: format e-mail, wymagany
- **Akcje**:
  - Submit: POST do `/api/v1/auth/forgot-password`
  - Przy sukcesie: wyświetlenie komunikatu o wysłaniu linku do odzyskiwania
  - Przy błędzie: wyświetlenie ogólnego komunikatu (nie ujawniamy czy email istnieje)

**`src/components/auth/ResetPasswordForm.tsx`**
- **Typ**: Client-side React component
- **Props**:
  - `token: string` - token z URL
- **Stan lokalny**:
  - `password: string`
  - `confirmPassword: string`
  - `isLoading: boolean`
  - `error: string | null`
  - `success: boolean`
- **Walidacja**:
  - Hasło: jak w RegisterForm
  - Potwierdzenie: musi być identyczne
- **Akcje**:
  - Submit: POST do `/api/v1/auth/reset-password`
  - Przy sukcesie: redirect do logowania z komunikatem sukcesu
  - Przy błędzie: komunikat (token wygasł, błąd serwera)

**`src/components/layout/AuthButton.tsx`**
- **Typ**: Client-side React component (wyspowy - island)
- **Props**:
  - `user: UserResponse | null` - dane użytkownika z server-side
  - `variant?: 'header' | 'mobile'` - wariant wyświetlania
- **Stan lokalny**: Brak (pure component)
- **Wariant niezalogowany**:
  - Przycisk "Zaloguj się" → link do `/auth/login`
  - Opcjonalnie przycisk "Zarejestruj się" → link do `/auth/register`
- **Wariant zalogowany**:
  - Wyświetlenie imienia/emaila użytkownika
  - Dropdown menu z opcjami:
    - Link do profilu
    - Link do wniosków adopcyjnych (dla adopters)
    - Link do panelu schroniska (dla shelter_staff)
    - Przycisk wylogowania → POST do `/api/v1/auth/logout`
- **Umiejscowienie**: Prawy górny róg layoutu

**`src/components/layout/ProtectedRoute.tsx`**
- **Typ**: Wrapper component (HOC pattern)
- **Props**:
  - `children: React.ReactNode`
  - `requiredRole?: 'adopter' | 'shelter_staff' | 'admin'`
  - `fallback?: React.ReactNode`
- **Logika**:
  - Sprawdzenie czy użytkownik jest zalogowany (z context/props)
  - Sprawdzenie czy użytkownik ma odpowiednią rolę
  - Jeśli nie: wyświetlenie fallback lub redirect do logowania
- **Uwaga**: Główna logika zabezpieczenia jest server-side, to tylko UI helper

#### 1.1.3 Modyfikacja istniejących komponentów

**`src/layouts/Layout.astro`**
- **Rozszerzenie**:
  - Dodanie komponentu `<AuthButton>` w prawym górnym rogu
  - Przekazanie danych użytkownika z server-side: `Astro.locals.user`
  - Obsługa toast notifications dla komunikatów auth (sukces logowania, wylogowania)
- **Nowa struktura**:
```astro
---
const user = Astro.locals.user; // z middleware
const { title } = Astro.props;
---
<html>
  <head>...</head>
  <body>
    <header class="flex justify-between items-center p-4">
      <nav>...</nav>
      <AuthButton client:load user={user} />
    </header>
    <main>
      <slot />
    </main>
  </body>
</html>
```

**`src/pages/index.astro`**
- **Rozszerzenie**:
  - Wyświetlenie różnych wersji CTA w zależności od statusu logowania
  - Dla niezalogowanych: zachęta do rejestracji + przeglądania psów
  - Dla zalogowanych: powitanie użytkownika + szybki dostęp do akcji
  - Przekazanie danych zalogowanego użytkownika do głównej aplikacji React jako props:
    ```astro
    <MainApp client:load user={Astro.locals.user} />
    ```
  - Aplikacja React może zainicjalizować auth store na podstawie przekazanych danych

### 1.2 Scenariusze użytkownika

#### Scenariusz 1: Rejestracja nowego użytkownika
1. Użytkownik wchodzi na `/auth/register`
2. Wypełnia formularz (email, hasło, potwierdzenie, zgoda RODO)
3. Kliknięcie "Zarejestruj się" → walidacja client-side
4. POST do `/api/v1/auth/register`
5. Backend: walidacja danych, wywołanie `supabase.auth.signUp()`
6. Supabase wysyła e-mail weryfikacyjny
7. Wyświetlenie komunikatu: "Sprawdź swoją skrzynkę e-mail, aby dokończyć rejestrację"
8. Użytkownik klika link w e-mailu → przekierowanie do `/auth/verify-email?token=...`
9. Backend weryfikuje token, aktywuje konto
10. Przekierowanie do `/auth/login?verified=true`

#### Scenariusz 2: Logowanie
1. Użytkownik wchodzi na `/auth/login`
2. Wypełnia formularz (email, hasło)
3. Kliknięcie "Zaloguj się" → walidacja client-side
4. POST do `/api/v1/auth/login`
5. Backend: weryfikacja danych przez `supabase.auth.signInWithPassword()`
6. Przy sukcesie: ustawienie cookie sesji, zwrócenie danych użytkownika
7. Redirect do strony głównej lub `redirectTo` param
8. Layout wyświetla AuthButton z danymi użytkownika

#### Scenariusz 3: Wylogowanie
1. Użytkownik klika "Wyloguj się" w dropdown menu
2. POST do `/api/v1/auth/logout` (lub GET do `/auth/logout`)
3. Backend: wywołanie `supabase.auth.signOut()`, usunięcie cookie
4. Redirect do `/` z komunikatem "Zostałeś wylogowany"

#### Scenariusz 4: Odzyskiwanie hasła
1. Użytkownik wchodzi na `/auth/forgot-password`
2. Wpisuje adres e-mail
3. POST do `/api/v1/auth/forgot-password`
4. Backend: wywołanie `supabase.auth.resetPasswordForEmail()`
5. Supabase wysyła e-mail z linkiem do resetowania
6. Wyświetlenie komunikatu o wysłaniu e-maila
7. Użytkownik klika link → `/auth/reset-password?token=...`
8. Wpisuje nowe hasło (2x)
9. POST do `/api/v1/auth/reset-password`
10. Backend: aktualizacja hasła przez Supabase Auth
11. Redirect do logowania z komunikatem sukcesu

#### Scenariusz 5: Próba dostępu do chronionego zasobu (niezalogowany)
1. Użytkownik próbuje wejść na `/dogs/:id/adopt` (formularz adopcyjny)
2. Middleware sprawdza sesję → brak sesji
3. Redirect do `/auth/login?redirectTo=/dogs/:id/adopt`
4. Po zalogowaniu → automatyczny redirect do formularza adopcyjnego

### 1.3 Walidacja i komunikaty błędów

#### Walidacja client-side (React forms)
- **E-mail**:
  - Pusty: "Adres e-mail jest wymagany"
  - Nieprawidłowy format: "Podaj prawidłowy adres e-mail"
- **Hasło**:
  - Puste: "Hasło jest wymagane"
  - Za krótkie: "Hasło musi mieć minimum 8 znaków"
  - Za słabe: "Hasło musi zawierać wielką literę, małą literę i cyfrę"
- **Potwierdzenie hasła**:
  - Puste: "Potwierdź hasło"
  - Niezgodne: "Hasła nie są identyczne"
- **Zgoda RODO**:
  - Niezaznaczone: "Musisz zaakceptować przetwarzanie danych osobowych"

#### Komunikaty błędów z API
- **400 Bad Request**:
  - `"Email already exists"` → "Ten adres e-mail jest już zarejestrowany"
  - `"Invalid email or password"` → "Nieprawidłowy e-mail lub hasło"
  - `"Email not verified"` → "Potwierdź swój adres e-mail przed zalogowaniem"
  - `"Token expired"` → "Link wygasł. Wygeneruj nowy link do resetowania hasła"
- **401 Unauthorized**:
  - `"Session expired"` → "Twoja sesja wygasła. Zaloguj się ponownie"
- **500 Internal Server Error**:
  - Ogólny: "Wystąpił błąd serwera. Spróbuj ponownie później"

#### Komunikaty sukcesu
- Rejestracja: "Konto zostało utworzone! Sprawdź swoją skrzynkę e-mail"
- Logowanie: "Witaj z powrotem!"
- Wylogowanie: "Do zobaczenia!"
- Reset hasła: "Link do resetowania hasła został wysłany"
- Nowe hasło: "Hasło zostało zmienione. Możesz się teraz zalogować"

---

## 2. LOGIKA BACKENDOWA

### 2.1 Endpointy API

**Uwaga**: Wszystkie endpointy używają `export const prerender = false` zgodnie z konfiguracją `output: 'server'`

#### POST `/api/v1/auth/register`

**Cel**: Rejestracja nowego użytkownika

**Request body** (JSON):
```typescript
{
  email: string;
  password: string;
  confirmPassword: string;
  gdprConsent: boolean;
}
```

**Walidacja** (Zod schema `RegisterCommandSchema`):
- Email: format e-mail, max 255 znaków
- Password: min 8 znaków, zawiera wielką literę, małą literę, cyfrę
- confirmPassword: musi być identyczne z password
- gdprConsent: musi być `true`

**Proces**:
1. Walidacja danych wejściowych za pomocą Zod
2. Sprawdzenie czy e-mail nie istnieje (query do Supabase Auth)
3. Wywołanie `supabase.auth.signUp({ email, password })`
4. Supabase automatycznie wysyła e-mail weryfikacyjny
5. Stworzenie rekordu w tabeli `users` z domyślną rolą `adopter`
6. Zwrócenie odpowiedzi sukcesu (bez automatycznego logowania)

**Responses**:
- `201 Created`: `{ message: "User registered. Please verify your email." }`
- `400 Bad Request`: `{ error: "Email already exists" | "Validation error", details: {...} }`
- `500 Internal Server Error`: `{ error: "Registration failed" }`

**Plik**: `src/pages/api/v1/auth/register.ts`

---

#### POST `/api/v1/auth/login`

**Cel**: Logowanie użytkownika

**Request body**:
```typescript
{
  email: string;
  password: string;
}
```

**Walidacja** (Zod schema `LoginCommandSchema`):
- Email: wymagany, format e-mail
- Password: wymagany, min 8 znaków

**Proces**:
1. Walidacja danych za pomocą Zod
2. Wywołanie `supabase.auth.signInWithPassword({ email, password })`
3. Sprawdzenie czy e-mail został zweryfikowany (`email_confirmed_at`)
4. Jeśli sukces:
   - Pobranie danych użytkownika z tabeli `users` (rola, shelter_id)
   - Ustawienie cookie sesji (access_token, refresh_token)
   - Zwrócenie danych użytkownika
5. Jeśli błąd: zwrócenie odpowiedniego komunikatu

**Responses**:
- `200 OK`: `{ user: UserResponse, session: { access_token, refresh_token } }`
- `400 Bad Request`: `{ error: "Invalid email or password" }`
- `401 Unauthorized`: `{ error: "Email not verified" }`
- `500 Internal Server Error`: `{ error: "Login failed" }`

**Cookie management**:
- Nazwa: `sb-access-token`, `sb-refresh-token`
- HttpOnly: true
- Secure: true (production)
- SameSite: Lax
- Max-Age: zgodnie z konfiguracją Supabase (domyślnie 3600s dla access, 30 dni dla refresh)

**Plik**: `src/pages/api/v1/auth/login.ts`

---

#### POST `/api/v1/auth/logout`

**Cel**: Wylogowanie użytkownika

**Request**: Brak body (wymaga cookie sesji)

**Proces**:
1. Odczyt access_token z cookie
2. Wywołanie `supabase.auth.signOut()`
3. Usunięcie cookies sesji (`sb-access-token`, `sb-refresh-token`)
4. Zwrócenie odpowiedzi sukcesu

**Responses**:
- `200 OK`: `{ message: "Logged out successfully" }`
- `500 Internal Server Error`: `{ error: "Logout failed" }`

**Alternatywa**: Może być też zrealizowane jako `GET /auth/logout` w Astro z bezpośrednim redirectem

**Plik**: `src/pages/api/v1/auth/logout.ts`

---

#### POST `/api/v1/auth/forgot-password`

**Cel**: Inicjowanie procesu resetowania hasła

**Request body**:
```typescript
{
  email: string;
}
```

**Walidacja**:
- Email: wymagany, format e-mail

**Proces**:
1. Walidacja danych
2. Wywołanie `supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://adoptme.pl/auth/reset-password' })`
3. Supabase wysyła e-mail z linkiem zawierającym token
4. Zwrócenie odpowiedzi sukcesu (nawet jeśli email nie istnieje - security best practice)

**Responses**:
- `200 OK`: `{ message: "If the email exists, a reset link has been sent." }`
- `400 Bad Request`: `{ error: "Invalid email format" }`
- `500 Internal Server Error`: `{ error: "Failed to send reset email" }`

**Plik**: `src/pages/api/v1/auth/forgot-password.ts`

---

#### POST `/api/v1/auth/reset-password`

**Cel**: Ustawienie nowego hasła za pomocą tokena

**Request body**:
```typescript
{
  token: string;
  password: string;
  confirmPassword: string;
}
```

**Walidacja**:
- Token: wymagany, format UUID
- Password: jak przy rejestracji
- confirmPassword: identyczne z password

**Proces**:
1. Walidacja danych
2. Weryfikacja tokena poprzez `supabase.auth.verifyOtp({ token_hash: token, type: 'recovery' })`
3. Jeśli token prawidłowy: `supabase.auth.updateUser({ password })`
4. Zwrócenie odpowiedzi sukcesu

**Responses**:
- `200 OK`: `{ message: "Password updated successfully" }`
- `400 Bad Request`: `{ error: "Invalid or expired token" | "Passwords do not match" }`
- `500 Internal Server Error`: `{ error: "Failed to reset password" }`

**Plik**: `src/pages/api/v1/auth/reset-password.ts`

**Uwaga**: Dane zalogowanego użytkownika są automatycznie dostępne w `Astro.locals.user` dzięki middleware. Nie ma potrzeby tworzenia osobnego endpointu do pobierania danych użytkownika - dane te są przekazywane jako props do komponentów React bezpośrednio ze stron Astro.

---

### 2.2 Serwisy

#### `src/lib/services/auth.service.ts`

**Cel**: Enkapsulacja logiki autentykacji

**Metody**:

```typescript
export class AuthService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Rejestracja użytkownika
   * @throws Error jeśli email już istnieje lub rejestracja się nie powiodła
   */
  async register(command: RegisterCommand): Promise<void> {
    // 1. Wywołanie supabase.auth.signUp()
    // 2. Obsługa błędów (email exists, weak password)
    // 3. Stworzenie rekordu w tabeli users
  }

  /**
   * Logowanie użytkownika
   * @returns Sesja i dane użytkownika
   * @throws Error jeśli dane nieprawidłowe lub email niezweryfikowany
   */
  async login(command: LoginCommand): Promise<{ session: Session; user: DTO.UserResponse }> {
    // 1. Wywołanie supabase.auth.signInWithPassword()
    // 2. Sprawdzenie email_confirmed_at
    // 3. Pobranie danych użytkownika z tabeli users
    // 4. Zwrócenie sesji i danych
  }

  /**
   * Wylogowanie użytkownika
   */
  async logout(): Promise<void> {
    // Wywołanie supabase.auth.signOut()
  }

  /**
   * Inicjowanie resetowania hasła
   */
  async forgotPassword(email: string): Promise<void> {
    // Wywołanie supabase.auth.resetPasswordForEmail()
  }

  /**
   * Resetowanie hasła z tokenem
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // 1. Weryfikacja tokena
    // 2. Aktualizacja hasła
  }

  /**
   * Weryfikacja e-maila z tokenem
   */
  async verifyEmail(token: string): Promise<void> {
    // Wywołanie supabase.auth.verifyOtp()
  }

  /**
   * Pobranie zalogowanego użytkownika (używane wewnętrznie przez middleware)
   * @internal Nie wywoływać bezpośrednio - użytkownik dostępny w Astro.locals.user
   */
  async getCurrentUser(accessToken: string): Promise<DTO.UserResponse | null> {
    // 1. Wywołanie supabase.auth.getUser()
    // 2. Pobranie danych z tabeli users
    // Metoda używana tylko przez middleware do wypełnienia Astro.locals.user
  }

  /**
   * Odświeżenie tokena sesji
   */
  async refreshSession(refreshToken: string): Promise<Session> {
    // Wywołanie supabase.auth.refreshSession()
  }
}
```

---

### 2.3 Walidatory (Zod schemas)

#### `src/lib/validators/auth.validators.ts`

```typescript
import { z } from 'zod';

// Walidacja hasła
const passwordSchema = z.string()
  .min(8, "Hasło musi mieć minimum 8 znaków")
  .regex(/[A-Z]/, "Hasło musi zawierać wielką literę")
  .regex(/[a-z]/, "Hasło musi zawierać małą literę")
  .regex(/[0-9]/, "Hasło musi zawierać cyfrę");

// Walidacja e-mail
const emailSchema = z.string()
  .email("Nieprawidłowy format adresu e-mail")
  .max(255, "Adres e-mail jest za długi");

// Schema rejestracji
export const registerCommandSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  gdprConsent: z.literal(true, {
    errorMap: () => ({ message: "Musisz zaakceptować przetwarzanie danych" })
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"]
});

export type RegisterCommand = z.infer<typeof registerCommandSchema>;

// Schema logowania
export const loginCommandSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Hasło jest wymagane")
});

export type LoginCommand = z.infer<typeof loginCommandSchema>;

// Schema odzyskiwania hasła
export const forgotPasswordCommandSchema = z.object({
  email: emailSchema
});

export type ForgotPasswordCommand = z.infer<typeof forgotPasswordCommandSchema>;

// Schema resetowania hasła
export const resetPasswordCommandSchema = z.object({
  token: z.string().uuid("Nieprawidłowy token"),
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"]
});

export type ResetPasswordCommand = z.infer<typeof resetPasswordCommandSchema>;
```

---

### 2.4 Typy (DTOs)

#### Rozszerzenie `src/types.ts`

```typescript
export namespace DTO {
  // ... istniejące typy ...

  // ---------------- Auth ----------------
  export interface LoginCommand {
    email: string;
    password: string;
  }

  export interface RegisterCommand {
    email: string;
    password: string;
    confirmPassword: string;
    gdprConsent: boolean;
  }

  export interface AuthResponse {
    user: UserResponse;
    session: {
      access_token: string;
      refresh_token: string;
      expires_at: number;
    };
  }

  export interface ForgotPasswordCommand {
    email: string;
  }

  export interface ResetPasswordCommand {
    token: string;
    password: string;
    confirmPassword: string;
  }
}
```

---

### 2.5 Middleware - aktualizacja

#### `src/middleware/index.ts`

**Cel**: Automatyczne odczytywanie sesji i użytkownika dla każdego requesta

**Rozszerzenie**:

```typescript
import { defineMiddleware } from 'astro:middleware';
import { supabaseClient } from '../db/supabase.client';

export const onRequest = defineMiddleware(async (context, next) => {
  // Istniejące: dodanie klienta Supabase do locals
  context.locals.supabase = supabaseClient;

  // NOWE: Odczyt tokena z cookie
  const accessToken = context.cookies.get('sb-access-token')?.value;
  const refreshToken = context.cookies.get('sb-refresh-token')?.value;

  if (accessToken) {
    try {
      // Pobranie użytkownika z Supabase Auth
      const { data: { user: authUser }, error } = await supabaseClient.auth.getUser(accessToken);

      if (authUser && !error) {
        // Pobranie pełnych danych użytkownika z tabeli users
        const { data: userData } = await supabaseClient
          .from('users')
          .select('id, email, role, shelter_id, created_at, updated_at')
          .eq('id', authUser.id)
          .single();

        if (userData) {
          context.locals.user = userData;
          context.locals.session = { accessToken, refreshToken };
        }
      } else if (error && refreshToken) {
        // Token wygasł, próba odświeżenia
        const { data, error: refreshError } = await supabaseClient.auth.refreshSession({
          refresh_token: refreshToken
        });

        if (data.session && !refreshError) {
          // Aktualizacja cookies
          context.cookies.set('sb-access-token', data.session.access_token, {
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'lax',
            maxAge: 3600,
            path: '/'
          });
          context.cookies.set('sb-refresh-token', data.session.refresh_token, {
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
            path: '/'
          });

          // Rekursywne wywołanie - ponowne pobranie użytkownika
          return onRequest(context, next);
        }
      }
    } catch (error) {
      console.error('Middleware auth error:', error);
      // Kontynuacja bez użytkownika (błąd nie blokuje requesta)
    }
  }

  // Jeśli brak sesji lub błąd, user pozostaje undefined
  return next();
});
```

**Rozszerzenie typów Astro**:

`src/env.d.ts`:
```typescript
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    supabase: import('./db/supabase.client').SupabaseClient;
    user?: import('./types').DTO.UserResponse;
    session?: {
      accessToken: string;
      refreshToken: string;
    };
  }
}
```

---

### 2.6 Helper do zabezpieczania stron

#### `src/lib/utils/auth-guards.ts`

**Cel**: Funkcje pomocnicze do zabezpieczania stron server-side

```typescript
import type { APIContext } from 'astro';
import type { DTO } from '@/types';

/**
 * Sprawdza czy użytkownik jest zalogowany.
 * Jeśli nie, przekierowuje do logowania.
 */
export function requireAuth(context: APIContext): DTO.UserResponse {
  const user = context.locals.user;

  if (!user) {
    const redirectTo = encodeURIComponent(context.url.pathname);
    return context.redirect(`/auth/login?redirectTo=${redirectTo}`);
  }

  return user;
}

/**
 * Sprawdza czy użytkownik ma odpowiednią rolę.
 * Jeśli nie, przekierowuje do 403 lub strony głównej.
 */
export function requireRole(
  context: APIContext,
  allowedRoles: Array<'adopter' | 'shelter_staff' | 'admin'>
): DTO.UserResponse {
  const user = requireAuth(context);

  if (!allowedRoles.includes(user.role)) {
    return context.redirect('/403'); // lub inna strona błędu
  }

  return user;
}

/**
 * Sprawdza czy użytkownik jest już zalogowany.
 * Jeśli tak, przekierowuje do strony głównej (dla stron login/register).
 */
export function redirectIfAuthenticated(context: APIContext): void {
  if (context.locals.user) {
    return context.redirect('/');
  }
}
```

**Użycie w stronie Astro**:

```astro
---
// src/pages/dogs/[id]/adopt.astro
import { requireAuth } from '@/lib/utils/auth-guards';

const user = requireAuth(Astro); // Automatyczny redirect jeśli niezalogowany
---
<Layout>
  <h1>Formularz adopcyjny</h1>
  <!-- Formularz dostępny tylko dla zalogowanych -->
</Layout>
```

---

### 2.7 Obsługa błędów

#### Strategia obsługi błędów w API endpoints

**Try-catch pattern**:

```typescript
// Przykład w src/pages/api/v1/auth/login.ts
import type { APIRoute } from 'astro';
import { loginCommandSchema } from '@/lib/validators/auth.validators';
import { AuthService } from '@/lib/services/auth.service';

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  try {
    // 1. Parsowanie i walidacja
    const body = await request.json();
    const command = loginCommandSchema.parse(body);

    // 2. Wywołanie serwisu
    const authService = new AuthService(locals.supabase);
    const { session, user } = await authService.login(command);

    // 3. Ustawienie cookies
    cookies.set('sb-access-token', session.access_token, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 3600,
      path: '/'
    });
    cookies.set('sb-refresh-token', session.refresh_token, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/'
    });

    // 4. Odpowiedź sukcesu
    return new Response(JSON.stringify({ user, session }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    // Obsługa błędów Zod (walidacja)
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({
        error: 'Validation error',
        details: error.flatten()
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Obsługa błędów biznesowych (z serwisu)
    if (error instanceof Error) {
      const status = getErrorStatus(error.message);
      return new Response(JSON.stringify({
        error: error.message
      }), {
        status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Błędy nieznane
    console.error('Login error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Helper do mapowania błędów na status codes
function getErrorStatus(message: string): number {
  if (message.includes('Invalid email or password')) return 400;
  if (message.includes('Email not verified')) return 401;
  if (message.includes('Email already exists')) return 400;
  return 500;
}
```

#### Mapowanie błędów Supabase

**Helper `src/lib/utils/supabase-errors.ts`**:

```typescript
import type { AuthError } from '@supabase/supabase-js';

export function mapSupabaseAuthError(error: AuthError): string {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Invalid email or password';
    case 'Email not confirmed':
      return 'Email not verified';
    case 'User already registered':
      return 'Email already exists';
    default:
      return 'Authentication error';
  }
}
```

---

## 3. SYSTEM AUTENTYKACJI

### 3.1 Konfiguracja Supabase Auth

#### 3.1.1 Zmienne środowiskowe

**`.env`**:
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret

# Opcjonalne dla rozwoju lokalnego
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# URL aplikacji (dla redirectów w e-mailach)
PUBLIC_APP_URL=http://localhost:4321
```

#### 3.1.2 Konfiguracja Supabase Dashboard

**Authentication → Email Templates**:

1. **Confirm signup** (weryfikacja e-maila):
```html
<h2>Potwierdź swój adres e-mail</h2>
<p>Dziękujemy za rejestrację w AdoptMe!</p>
<p>Kliknij poniższy link, aby aktywować swoje konto:</p>
<p><a href="{{ .ConfirmationURL }}">Potwierdź adres e-mail</a></p>
<p>Link wygaśnie za 24 godziny.</p>
```

URL: `{{ .SiteURL }}/auth/verify-email?token={{ .Token }}`

2. **Reset password** (odzyskiwanie hasła):
```html
<h2>Zresetuj swoje hasło</h2>
<p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta AdoptMe.</p>
<p>Kliknij poniższy link, aby ustawić nowe hasło:</p>
<p><a href="{{ .ConfirmationURL }}">Ustaw nowe hasło</a></p>
<p>Link wygaśnie za 1 godzinę.</p>
<p>Jeśli nie prosiłeś o reset hasła, zignoruj ten e-mail.</p>
```

URL: `{{ .SiteURL }}/auth/reset-password?token={{ .Token }}`

**Authentication → URL Configuration**:
- Site URL: `https://adoptme.pl` (production) lub `http://localhost:4321` (development)
- Redirect URLs:
  - `https://adoptme.pl/auth/**`
  - `http://localhost:4321/auth/**`

**Authentication → Settings**:
- Enable Email Confirmations: **Włączone**
- Email Confirmation Method: **Magic Link** lub **OTP**
- Double Confirm Email Changes: **Włączone**
- Minimum Password Length: **8**
- Secure Password Requirements: **Włączone**

#### 3.1.3 Row Level Security (RLS)

**Polityki dla tabeli `users`**:

```sql
-- Użytkownik może odczytać tylko swoje dane
CREATE POLICY "Users can read own data"
ON users FOR SELECT
TO authenticated
USING (auth.uid()::text = id);

-- Użytkownik może aktualizować tylko swoje dane (z wyjątkiem roli)
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
TO authenticated
USING (auth.uid()::text = id)
WITH CHECK (
  auth.uid()::text = id
  AND role = (SELECT role FROM users WHERE id = auth.uid()::text)
);

-- Tylko serwis może tworzyć użytkowników (podczas rejestracji)
CREATE POLICY "Service can create users"
ON users FOR INSERT
TO service_role
WITH CHECK (true);

-- Admin może odczytać wszystkich użytkowników
CREATE POLICY "Admin can read all users"
ON users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()::text
    AND role = 'admin'
  )
);
```

**Polityki dla tabeli `adoption_applications`**:

```sql
-- Użytkownik może odczytać swoje wnioski
CREATE POLICY "Users can read own applications"
ON adoption_applications FOR SELECT
TO authenticated
USING (user_id = auth.uid()::text);

-- Pracownicy schroniska mogą odczytać wnioski dla swoich psów
CREATE POLICY "Shelter staff can read applications for their dogs"
ON adoption_applications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN dogs d ON d.shelter_id = u.shelter_id
    WHERE u.id = auth.uid()::text
    AND u.role = 'shelter_staff'
    AND d.id = adoption_applications.dog_id
  )
);

-- Użytkownik może tworzyć wnioski (tylko dla siebie)
CREATE POLICY "Users can create own applications"
ON adoption_applications FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid()::text);

-- Pracownicy schroniska mogą aktualizować statusy wniosków
CREATE POLICY "Shelter staff can update application status"
ON adoption_applications FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN dogs d ON d.shelter_id = u.shelter_id
    WHERE u.id = auth.uid()::text
    AND u.role = 'shelter_staff'
    AND d.id = adoption_applications.dog_id
  )
)
WITH CHECK (
  -- Można aktualizować tylko status i komentarz
  user_id = adoption_applications.user_id
  AND dog_id = adoption_applications.dog_id
);
```

**Polityki dla tabeli `lifestyle_profiles`**:

```sql
-- Użytkownik może odczytać tylko swój profil
CREATE POLICY "Users can read own profile"
ON lifestyle_profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid()::text);

-- Użytkownik może tworzyć/aktualizować tylko swój profil
CREATE POLICY "Users can upsert own profile"
ON lifestyle_profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own profile"
ON lifestyle_profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid()::text)
WITH CHECK (user_id = auth.uid()::text);

-- Pracownicy schroniska mogą odczytać profile z wnioskami
CREATE POLICY "Shelter staff can read profiles with applications"
ON lifestyle_profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM adoption_applications aa
    JOIN dogs d ON d.id = aa.dog_id
    JOIN users u ON u.id = auth.uid()::text
    WHERE aa.user_id = lifestyle_profiles.user_id
    AND d.shelter_id = u.shelter_id
    AND u.role = 'shelter_staff'
  )
);
```

#### 3.1.4 Triggery bazy danych

**Automatyczne utworzenie użytkownika w tabeli `users` po rejestracji w Auth**:

```sql
-- Funkcja triggera
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role, password_hash)
  VALUES (
    new.id,
    new.email,
    'adopter', -- domyślna rola
    '' -- placeholder, hasło jest w auth.users
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Aktualizacja `updated_at` przy każdej zmianie**:

```sql
-- Dla każdej tabeli z updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### 3.2 Integracja Supabase Auth z Astro

#### 3.2.1 Klient Supabase - aktualizacja

**`src/db/supabase.client.ts`** (rozszerzenie):

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_KEY in your .env file.'
  );
}

// Usunięcie tymczasowej stałej DEFAULT_USER_ID po wdrożeniu auth
// export const DEFAULT_USER_ID = crypto.createHash('md5').update('default_adopter').digest('hex');

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false, // Sesja zarządzana przez cookies, nie localStorage
    detectSessionInUrl: true, // Dla magic links
    flowType: 'pkce' // Zwiększone bezpieczeństwo
  }
});

export type SupabaseClient = typeof supabaseClient;

/**
 * Tworzy klienta Supabase z kontekstem użytkownika (dla server-side)
 */
export function createServerSupabaseClient(accessToken: string) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
}
```

#### 3.2.2 Przekazywanie użytkownika do aplikacji React

**Strategia**: Dane zalogowanego użytkownika są przekazywane bezpośrednio jako props do komponentów React ze stron Astro. Middleware automatycznie wypełnia `Astro.locals.user`, więc nie ma potrzeby tworzenia dedykowanego endpointu API.

**Przykład w `src/pages/index.astro`**:

```astro
---
import Layout from '@/layouts/Layout.astro';
import MainApp from '@/components/MainApp';

const user = Astro.locals.user; // Automatycznie dostępne z middleware
---
<Layout title="AdoptMe - Adopcja psów">
  <MainApp client:load user={user} />
</Layout>
```

**`src/components/MainApp.tsx`** (przykład głównej aplikacji React):

```typescript
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';
import type { DTO } from '@/types';

interface MainAppProps {
  user: DTO.UserResponse | null;
}

export default function MainApp({ user }: MainAppProps) {
  const initializeAuth = useAuthStore(state => state.initialize);

  // Inicjalizacja auth store na podstawie danych z serwera
  useEffect(() => {
    initializeAuth(user);
  }, [user, initializeAuth]);

  return (
    <div>
      {/* Główna aplikacja */}
    </div>
  );
}
```

**`src/lib/stores/auth.store.ts`** (przykład Zustand store):

```typescript
import { create } from 'zustand';
import type { DTO } from '@/types';

interface AuthState {
  user: DTO.UserResponse | null;
  isAuthenticated: boolean;
  initialize: (user: DTO.UserResponse | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  initialize: (user) => set({
    user,
    isAuthenticated: !!user
  }),

  logout: async () => {
    // Wywołanie API logout
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    set({ user: null, isAuthenticated: false });
    window.location.href = '/';
  }
}));
```

**Zalety tego podejścia**:
- ✅ Brak dodatkowych zapytań API do pobrania użytkownika
- ✅ Dane użytkownika dostępne natychmiast przy pierwszym renderze
- ✅ Server-side rendering z pełnymi danymi użytkownika
- ✅ Jeden źródło prawdy (middleware) dla stanu autentykacji
- ✅ Łatwiejsza synchronizacja między stronami Astro a komponentami React

---

### 3.3 Bezpieczeństwo

#### 3.3.1 CSRF Protection

**Strategia**: Wykorzystanie `SameSite=Lax` w cookies oraz weryfikacja origin w middleware

**`src/middleware/index.ts`** (dodatkowe sprawdzenie):

```typescript
// Dla wrażliwych operacji (POST, PUT, DELETE)
if (['POST', 'PUT', 'DELETE'].includes(context.request.method)) {
  const origin = context.request.headers.get('origin');
  const allowedOrigins = [
    'http://localhost:4321',
    'https://adoptme.pl'
  ];

  if (origin && !allowedOrigins.includes(origin)) {
    return new Response('Forbidden', { status: 403 });
  }
}
```

#### 3.3.2 Rate Limiting

**Zalecenie**: Implementacja rate limiting na poziomie Supabase lub reverse proxy (Nginx, Cloudflare)

**Dla development** (opcjonalna implementacja w Astro):

```typescript
// src/lib/utils/rate-limit.ts
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || now > record.resetAt) {
    requestCounts.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}
```

**Użycie w endpoint**:

```typescript
// W api/v1/auth/login.ts
const ip = context.clientAddress;
if (!checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000)) { // 5 prób na 15 minut
  return new Response(JSON.stringify({
    error: 'Too many login attempts. Please try again later.'
  }), { status: 429 });
}
```

#### 3.3.3 Secure Headers

**`astro.config.mjs`** (middleware dla headers):

```javascript
export default defineConfig({
  // ... existing config
  vite: {
    server: {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
      }
    }
  }
});
```

#### 3.3.4 Password Security

- **Hashing**: Automatycznie obsługiwane przez Supabase Auth (bcrypt)
- **Siła hasła**: Walidacja po stronie klienta i serwera (min 8 znaków, wielka/mała litera, cyfra)
- **Polityka wygasania**: Po MVP - możliwość wymuszenia zmiany hasła co 90 dni

#### 3.3.5 Session Management

- **Token expiration**: Access token - 1 godzina, Refresh token - 30 dni
- **Automatyczne odświeżanie**: W middleware (jeśli access token wygasł, użyj refresh token)
- **Wylogowanie na wszystkich urządzeniach**: Możliwość wywołania `supabase.auth.signOut({ scope: 'global' })`

---

### 3.4 Migracja istniejących funkcji

#### 3.4.1 Usunięcie DEFAULT_USER_ID

**Lokalizacje do aktualizacji**:

1. `src/db/supabase.client.ts` - usunięcie stałej
2. `src/pages/api/v1/dogs.ts` (lub inne API używające DEFAULT_USER_ID) - zamiana na `context.locals.user.id`
3. Dodanie middleware sprawdzającego autentykację przed operacjami wymagającymi użytkownika

**Przykład before/after**:

**Before**:
```typescript
// src/pages/api/v1/applications.ts
import { DEFAULT_USER_ID } from '@/db/supabase.client';

const { data } = await supabase
  .from('adoption_applications')
  .insert({ user_id: DEFAULT_USER_ID, dog_id, ... });
```

**After**:
```typescript
// src/pages/api/v1/applications.ts
import { requireAuth } from '@/lib/utils/auth-guards';

export const POST: APIRoute = async (context) => {
  const user = requireAuth(context);

  const { data } = await context.locals.supabase
    .from('adoption_applications')
    .insert({ user_id: user.id, dog_id, ... });
};
```

#### 3.4.2 Aktualizacja istniejących stron

**Lista stron do zabezpieczenia**:

1. **Formularz adopcyjny** (`/dogs/[id]/adopt`) - wymaga logowania (adopter)
2. **Panel schroniska** (`/shelter/dashboard`) - wymaga logowania (shelter_staff)
3. **Profil użytkownika** (`/profile`) - wymaga logowania (dowolna rola)
4. **Rekomendacje AI** (`/recommendations`) - wymaga logowania (adopter)

**Przykład**:

```astro
---
// src/pages/dogs/[id]/adopt.astro
import { requireRole } from '@/lib/utils/auth-guards';

const user = requireRole(Astro, ['adopter', 'admin']);
const dogId = Astro.params.id;
---
<Layout>
  <h1>Wniosek adopcyjny</h1>
  <AdoptionForm client:load dogId={dogId} userId={user.id} />
</Layout>
```

---

## 4. PLAN WDROŻENIA

### 4.1 Faza 1: Backend (2-3 dni)

1. ✅ Aktualizacja middleware - odczyt sesji z cookies
2. ✅ Implementacja AuthService
3. ✅ Implementacja walidatorów Zod
4. ✅ Utworzenie endpointów API:
   - POST /api/v1/auth/register
   - POST /api/v1/auth/login
   - POST /api/v1/auth/logout
   - POST /api/v1/auth/forgot-password
   - POST /api/v1/auth/reset-password
5. ✅ Konfiguracja Supabase Auth (email templates, URLs)
6. ✅ Dodanie RLS policies
7. ✅ Dodanie triggerów bazy danych
8. ✅ Testy endpointów (Postman/Insomnia)

### 4.2 Faza 2: Frontend (2-3 dni)

1. ✅ Utworzenie komponentów React:
   - LoginForm
   - RegisterForm
   - ForgotPasswordForm
   - ResetPasswordForm
   - AuthButton
2. ✅ Utworzenie stron Astro:
   - /auth/login
   - /auth/register
   - /auth/forgot-password
   - /auth/reset-password
   - /auth/verify-email
3. ✅ Aktualizacja Layout.astro (dodanie AuthButton)
4. ✅ Stylowanie komponentów (Tailwind + shadcn/ui)
5. ✅ Testy UI (flow rejestracji, logowania)

### 4.3 Faza 3: Integracja i zabezpieczanie (1-2 dni)

1. ✅ Usunięcie DEFAULT_USER_ID
2. ✅ Aktualizacja istniejących endpointów (wymaganie autentykacji)
3. ✅ Zabezpieczenie stron Astro (requireAuth, requireRole)
4. ✅ Testy end-to-end:
   - Rejestracja → weryfikacja → logowanie
   - Odzyskiwanie hasła
   - Wylogowanie
   - Dostęp do chronionych zasobów
5. ✅ Implementacja rate limiting (opcjonalnie)

### 4.4 Faza 4: Testing i dokumentacja (1 dzień)

1. ✅ Testy bezpieczeństwa (próby obejścia autentykacji)
2. ✅ Testy dostępności (ARIA, keyboard navigation)
3. ✅ Dokumentacja dla developerów (README, komentarze w kodzie)
4. ✅ Przygotowanie danych testowych (konta użytkowników)

---

## 5. METRYKI SUKCESU

### 5.1 Kryteria akceptacji MVP

✅ Użytkownik może zarejestrować konto z weryfikacją e-mail
✅ Użytkownik może zalogować się na zweryfikowane konto
✅ Użytkownik może wylogować się z systemu
✅ Użytkownik może zainicjować proces odzyskiwania hasła
✅ Użytkownik może ustawić nowe hasło przy użyciu linku z e-maila
✅ Niezalogowany użytkownik może przeglądać katalog psów
✅ Zalogowany użytkownik (adopter) może złożyć wniosek adopcyjny
✅ Zalogowany użytkownik (shelter_staff) może zarządzać katalogiem psów
✅ Zalogowany użytkownik (shelter_staff) może obsługiwać wnioski adopcyjne
✅ Sesja użytkownika jest automatycznie odświeżana
✅ Wszystkie hasła są bezpiecznie hashowane
✅ RLS zapewnia izolację danych użytkowników
✅ Interfejs jest dostępny (ARIA, keyboard navigation)
✅ Dane użytkownika przekazywane jako props do aplikacji React (bez dodatkowych API calls)
✅ Auth store inicjalizowany na podstawie danych z serwera

### 5.2 Wskaźniki wydajności

- Czas rejestracji: < 3s (bez wysyłki e-maila)
- Czas logowania: < 1s
- Czas weryfikacji sesji w middleware: < 100ms
- Wszystkie operacje auth zabezpieczone HTTPS w produkcji

### 5.3 Zgodność z RODO

✅ Zgoda RODO wymagana podczas rejestracji
✅ Możliwość usunięcia konta (do implementacji w kolejnej fazie)
✅ Dane osobowe szyfrowane w transporcie (HTTPS)
✅ Hasła hashowane (bcrypt przez Supabase)
✅ Audyt dostępu do danych (RLS, logi Supabase)

---

## 6. ZALECENIA I UWAGI

### 6.1 Best Practices

1. **Nigdy nie loguj haseł** - nawet w trybie development
2. **Używaj HTTPS w produkcji** - obligatoryjne dla cookies
3. **Regularnie aktualizuj zależności** - szczególnie @supabase/supabase-js
4. **Monitoruj logi Supabase** - nietypowe aktywności (próby brute-force)
5. **Testuj flow na różnych urządzeniach** - desktop, mobile, różne przeglądarki
6. **Przekazuj user jako props ze stron Astro** - wykorzystuj SSR do wypełnienia stanu początkowego aplikacji React
7. **Unikaj duplikacji logiki auth** - middleware jest jedynym źródłem prawdy dla sesji użytkownika

### 6.2 Optymalizacje post-MVP

1. **2FA (Two-Factor Authentication)** - dla pracowników schronisk
2. **Social login** - opcjonalnie Google/Facebook OAuth
3. **Magic links** - logowanie bez hasła (opcja Supabase)
4. **Session replay** - monitoring sesji użytkowników (np. LogRocket)
5. **Advanced rate limiting** - per IP, per user, per endpoint
6. **Audit log UI** - panel administracyjny z historią operacji

### 6.3 Znane ograniczenia MVP

- Brak możliwości zmiany e-maila przez użytkownika (wymaga weryfikacji nowego adresu)
- Brak historii logowań użytkownika
- Brak możliwości wylogowania na wszystkich urządzeniach (przycisk w UI)
- Brak zaawansowanej polityki haseł (wymuszenie zmiany co X dni)
- Brak powiadomień o niezwykłych logowaniach (nowe IP, lokalizacja)

---

## 7. CHECKLIST IMPLEMENTACJI

### Backend
- [ ] Middleware - odczyt i odświeżanie sesji
- [ ] AuthService - wszystkie metody
- [ ] Walidatory Zod - schemas dla auth
- [ ] Endpointy API - register, login, logout, forgot, reset
- [ ] Helper functions - requireAuth, requireRole, redirectIfAuthenticated
- [ ] Supabase config - email templates, URLs, RLS, triggers
- [ ] Usunięcie DEFAULT_USER_ID z codebase

### Frontend
- [ ] LoginForm component
- [ ] RegisterForm component
- [ ] ForgotPasswordForm component
- [ ] ResetPasswordForm component
- [ ] AuthButton component
- [ ] Auth store (Zustand) - inicjalizacja z danych serwera
- [ ] Login page
- [ ] Register page
- [ ] Forgot password page
- [ ] Reset password page
- [ ] Verify email page
- [ ] Layout update - AuthButton w header
- [ ] Przekazywanie user jako props do aplikacji React (index.astro → MainApp)
- [ ] Zabezpieczenie chronionych stron

### Testing
- [ ] Testy jednostkowe AuthService
- [ ] Testy integracyjne endpointów
- [ ] Testy E2E - pełny flow rejestracji i logowania
- [ ] Testy bezpieczeństwa - próby obejścia autentykacji
- [ ] Testy dostępności - ARIA, keyboard navigation
- [ ] Testy na różnych urządzeniach i przeglądarkach

### Dokumentacja
- [ ] README - instrukcje uruchomienia auth
- [ ] Komentarze w kodzie
- [ ] Dokumentacja API (opcjonalnie Swagger/OpenAPI)
- [ ] Przewodnik dla użytkowników (help center)

---

**Koniec specyfikacji**

Data: 2025-10-31
Wersja: 1.0
Status: Gotowe do implementacji

