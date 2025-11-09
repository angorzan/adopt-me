# ADOPT-ME APPLICATION - E2E Component Tree

Dokument zawiera drzewo komponentów ASCII dla testów e2e aplikacji Adopt-Me.

Wygenerowano: 2025-11-09

---

## Najważniejszy komponent

**AdoptionForm** (`src/components/applications/AdoptionForm.tsx`)

To rdzeń funkcjonalności aplikacji - formularz zgłoszenia adopcji psa.

**Kluczowe funkcje:**
- Zbiera motywację użytkownika do adopcji (minimum 20 znaków)
- Preferowany sposób kontaktu (email lub telefon)
- Opcjonalne dodatkowe uwagi (max 500 znaków)
- Wymaga zgody GDPR na przetwarzanie danych
- Walidacja client-side + server-side
- Obsługa stanów: success/error/loading
- Wymaga uwierzytelnienia

---

## 1. GŁÓWNY FLOW ADOPCJI (Critical Path)

```
/dogs/[id].astro (Strona szczegółów psa)
│
├── Dog Information Section (static)
│   ├── Dog name, age, breed
│   ├── Description
│   └── Photos
│
└── AdoptionForm.tsx ⭐ CORE COMPONENT
    │
    ├── Authentication Check
    │   ├── If NOT authenticated
    │   │   └── [CTA Buttons]
    │   │       ├── <Button> "Zaloguj się"
    │   │       └── <Button> "Załóż konto"
    │   │
    │   └── If authenticated
    │       └── [Form Container]
    │
    ├── Form Fields
    │   │
    │   ├── <Textarea> motivation
    │   │   ├── Label: "Dlaczego chcesz adoptować tego psa?"
    │   │   ├── Required: true
    │   │   ├── MinLength: 20 chars
    │   │   ├── Placeholder text
    │   │   └── Error message (if < 20 chars)
    │   │
    │   ├── <Select> preferredContact
    │   │   ├── Label: "Preferowany sposób kontaktu"
    │   │   ├── Options:
    │   │   │   ├── "email" → "E-mail"
    │   │   │   └── "phone" → "Telefon"
    │   │   └── Default: "email"
    │   │
    │   ├── <Textarea> additionalNotes (optional)
    │   │   ├── Label: "Dodatkowe uwagi"
    │   │   ├── MaxLength: 500 chars
    │   │   └── Placeholder text
    │   │
    │   └── <Checkbox> gdprConsent
    │       ├── Label: "Wyrażam zgodę na przetwarzanie danych..."
    │       ├── Required: true
    │       └── Error message (if not checked)
    │
    ├── Form Actions
    │   └── <Button type="submit"> "Wyślij zgłoszenie"
    │       ├── Loading state: <Loader2 /> "Wysyłanie..."
    │       └── Default state: "Wyślij zgłoszenie"
    │
    └── Status Messages
        ├── Success Alert (green)
        │   └── "Twoje zgłoszenie zostało wysłane!"
        │
        └── Error Alerts (red)
            ├── "Pies jest już niedostępny"
            ├── "Już wysłałeś zgłoszenie dla tego psa"
            ├── "Musisz być zalogowany"
            └── "Wystąpił błąd. Spróbuj ponownie."
```

---

## 2. SUPPORTING FLOWS (dla kompletnych testów e2e)

### A) REJESTRACJA

```
/auth/signup.astro
└── SignupForm.tsx
    ├── <Input> firstName
    ├── <Input> lastName
    ├── <Input> email
    ├── <Input> password
    ├── <Input> passwordConfirm
    ├── <Checkbox> terms
    └── <Button> "Zarejestruj się"
```

### B) LOGOWANIE

```
/auth/login.astro
└── LoginForm.tsx
    ├── <Input> email
    ├── <Input> password
    └── <Button> "Zaloguj się"
```

### C) KATALOG PSÓW

```
/index.astro
└── DogCatalogContainer.tsx
    └── DogCatalogView.tsx
        ├── DogFilters.tsx
        │   ├── <Input> Search
        │   ├── <Select> Age
        │   ├── <Select> Size
        │   └── <Select> Gender
        │
        └── DogGrid.tsx
            └── DogCard.tsx (x N)
                ├── Image
                ├── Name, Age, Breed
                ├── Short description
                └── <Link> to /dogs/[id]
```

---

## 3. PEŁNA HIERARCHIA KOMPONENTÓW

```
Layout.astro (Root page wrapper with navigation)
├── Header (Navigation + Auth button)
├── Page content (Astro pages)
│   ├── index.astro (Home page - dog catalog)
│   ├── /dogs/[id].astro (Individual dog detail page)
│   ├── /auth/signup.astro (Registration)
│   └── /auth/login.astro (Login)
└── Includes various theme toggles

Main Components:

1. DOG DISCOVERY FLOW:
   DogCatalogContainer (React)
   └── DogCatalogView (React)
       ├── DogFilters (React) - Search/filter dogs
       └── DogGrid (React)
           └── DogCard (React) x N - Individual dog cards

2. DOG DETAIL PAGE:
   /dogs/[id].astro
   ├── Dog information display (Astro/static)
   ├── AdoptionForm (React) - THE CORE COMPONENT
   └── Contact shelter section

3. AUTHENTICATION FLOW:
   /auth/signup.astro
   └── SignupForm (React)

   /auth/login.astro
   └── LoginForm (React)

   /auth/forgot-password.astro
   └── ForgotPasswordForm (React)

4. UI COMPONENTS (Reusable):
   Button, Card, Input, Select, Textarea,
   Checkbox, Label, Skeleton (loading state)
```

---

## 4. API ENDPOINTS (Backend dla testów)

```
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/dogs
GET  /api/v1/dogs/[id] (implied)
POST /api/applications ⭐ CRITICAL
```

---

## 5. DATA FLOW

```
1. Dog Discovery
   User views catalog on `/`
   → DogCatalogView fetches dogs via useDogs hook
   → Displays DogGrid

2. Dog Selection
   User clicks on dog card
   → Routes to `/dogs/[id]`

3. Adoption Application
   ├── Server fetches dog details from Supabase
   ├── Renders AdoptionForm with dog info
   ├── User fills form
   ├── Form validates
   ├── POSTs to `/api/applications`
   ├── Backend validates and creates application record
   └── User sees success/error confirmation
```

---

## 6. REKOMENDOWANE SCENARIUSZE E2E

### Test 1: Happy Path - Kompletna adopcja
```
├── 1. Zarejestruj użytkownika
├── 2. Zaloguj się
├── 3. Przejdź do katalogu psów
├── 4. Kliknij na kartę psa
├── 5. Wypełnij formularz AdoptionForm
├── 6. Wyślij zgłoszenie
└── 7. Sprawdź success message
```

### Test 2: Walidacja formularza
```
├── 1. Przejdź do /dogs/[id] (zalogowany)
├── 2. Próba wysłania pustego formularza
├── 3. Wprowadź <20 znaków w motivation
├── 4. Nie zaznacz GDPR consent
└── 5. Sprawdź error messages
```

### Test 3: Unauthenticated user
```
├── 1. Wyloguj się
├── 2. Przejdź do /dogs/[id]
├── 3. Sprawdź CTA buttons (Zaloguj/Zarejestruj)
└── 4. Kliknij "Zaloguj się" → redirect
```

### Test 4: Duplicate application
```
├── 1. Wyślij aplikację dla psa X
├── 2. Próba wysłania drugiej aplikacji dla psa X
└── 3. Sprawdź error: "Już wysłałeś zgłoszenie"
```

### Test 5: Unavailable dog
```
└── Test przypadku gdy pies jest niedostępny
```

---

## 7. KEY FILES SUMMARY

### Core Application Form
- `/src/components/applications/AdoptionForm.tsx` - Main adoption form component

### Registration/Authentication Forms
- `/src/components/auth/SignupForm.tsx` - User registration form
- `/src/components/auth/LoginForm.tsx` - User login form
- `/src/pages/auth/signup.astro` - Registration page wrapper
- `/src/pages/api/v1/auth/register.ts` - API endpoint for registration

### Dog Browsing Components
- `/src/components/dogs/DogCatalogContainer.tsx` - Query provider wrapper
- `/src/components/dogs/DogCatalogView.tsx` - Main catalog view with search/filter
- `/src/components/dogs/DogCard.tsx` - Individual dog card display
- `/src/components/dogs/DogFilters.tsx` - Search and filtering UI
- `/src/components/dogs/DogGrid.tsx` - Grid layout for dog cards

### API Endpoints
- `/src/pages/api/applications.ts` - Submission handler for adoption applications
- `/src/pages/api/v1/auth/register.ts` - User registration endpoint
- `/src/pages/api/v1/dogs.ts` - Fetch dogs data
- `/src/pages/api/v1/auth/login.ts` - Login endpoint

### Services
- `/src/lib/services/adoptionService.ts` - Business logic for creating applications
- `/src/lib/services/auth.service.ts` - Authentication service

---

## 8. TECHNOLOGY STACK

- **Framework**: Astro 5.x with React 19.x for interactive components
- **Styling**: Tailwind CSS 4.x with Radix UI components
- **Backend**: Astro API routes
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Query (TanStack Query)
- **Testing**: Vitest (unit) + Playwright (E2E)

---

## 9. KEY ROUTES

| Route | File | Purpose |
|-------|------|---------|
| `/` | `src/pages/index.astro` | Home page with dog catalog |
| `/dogs/[id]` | `src/pages/dogs/[id].astro` | Dog detail page with AdoptionForm |
| `/auth/signup` | `src/pages/auth/signup.astro` | User registration |
| `/auth/login` | `src/pages/auth/login.astro` | User login |
| `/api/applications` | `src/pages/api/applications.ts` | POST endpoint for submitting adoption applications |
