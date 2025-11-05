# STRUKTURA KOMPONENTÓW ADOPT-ME

```
src/components/
│
├── QueryProvider.tsx
│   └── Wrapper dla React Query
│
├── ThemeToggle.tsx
│   └── Toggle widoku jasny/ciemny
│
├── auth/
│   ├── index.ts
│   ├── AuthButton.tsx
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   ├── ForgotPasswordForm.tsx
│   ├── ResetPasswordForm.tsx
│   └── ProtectedRoute.tsx (guards)
│
├── dogs/
│   ├── DogCard.tsx
│   │   └── Pojedyncza karta psa
│   ├── DogCardSkeleton.tsx
│   │   └── Loader dla DogCard
│   ├── DogGrid.tsx
│   │   └── Grid z DogCard (wielokrotne)
│   ├── DogFilters.tsx
│   │   └── Filtry wyszukiwania
│   ├── DogCatalogView.tsx
│   │   └── Widok + DogGrid + DogFilters
│   └── DogCatalogContainer.tsx
│       └── Smart component (hooki, dane)
│           ├── useDogs() - pobieranie psów
│           └── DogCatalogView
│
├── applications/
│   └── AdoptionForm.tsx
│       ├── Formularz aplikacji
│       └── adoptionService.create()
│
└── ui/ (ShadCN UI components)
    ├── button.tsx
    ├── card.tsx
    ├── checkbox.tsx
    ├── input.tsx
    ├── label.tsx
    ├── select.tsx
    ├── skeleton.tsx
    └── textarea.tsx
```

## PRZEPŁYW DANYCH

```
DogCatalogContainer (Smart)
  ↓
  ├─→ useDogs() → src/lib/hooks/useDogs.ts
  │     ↓
  │     src/pages/api/v1/dogs.ts (API endpoint)
  │
  └─→ DogCatalogView (Dumb)
        ├─→ DogFilters.tsx
        │     └─→ select, checkbox (UI)
        │
        └─→ DogGrid.tsx
              └─→ DogCard.tsx (×N)
                    └─→ button, card (UI)
```

## ZALEŻNOŚCI USŁUG

```
src/lib/services/
├── auth.service.ts
│   └── Logowanie, rejestracja, reset hasła
│
├── adoptionService.ts
│   └── Tworzenie aplikacji adopcji
│
└── openrouter.service.ts
    └── Integracja AI
```

## WALIDATORY

```
src/lib/validators/
├── auth.validators.ts
├── application.ts
└── Zod schemas
```

## BAZY DANYCH

```
src/db/
├── supabase.client.ts
└── database.types.ts
```

## LISTA WSZYSTKICH PLIKÓW

- src/components/QueryProvider.tsx
- src/components/ThemeToggle.tsx
- src/components/applications/AdoptionForm.tsx
- src/components/auth/AuthButton.tsx
- src/components/auth/ForgotPasswordForm.tsx
- src/components/auth/LoginForm.tsx
- src/components/auth/ProtectedRoute.tsx
- src/components/auth/ResetPasswordForm.tsx
- src/components/auth/SignupForm.tsx
- src/components/auth/index.ts
- src/components/dogs/DogCard.tsx
- src/components/dogs/DogCardSkeleton.tsx
- src/components/dogs/DogCatalogContainer.tsx
- src/components/dogs/DogCatalogView.tsx
- src/components/dogs/DogFilters.tsx
- src/components/dogs/DogGrid.tsx
- src/components/ui/button.tsx
- src/components/ui/card.tsx
- src/components/ui/checkbox.tsx
- src/components/ui/input.tsx
- src/components/ui/label.tsx
- src/components/ui/select.tsx
- src/components/ui/skeleton.tsx
- src/components/ui/textarea.tsx
