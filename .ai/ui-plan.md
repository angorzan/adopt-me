# Architektura UI dla AdoptMe

## 1. Przegląd struktury UI

AdoptMe to aplikacja webowa z trzema głównymi obszarami:

1. **Strefa publiczna** – katalog psów oraz szczegóły psa dostępne bez logowania.
2. **Strefa adoptera** – profil stylu życia, lista własnych wniosków adopcyjnych oraz możliwość składania wniosków.
3. **Strefa pracownika schroniska** – panel do przeglądania i obsługi wniosków dotyczących psów należących do jego schroniska.

UI jest zorganizowany wokół prostego paska nawigacji (Header) z kondycją zalogowania oraz hamburgerem na mobile. Layout strony wykorzystuje siatkę Tailwind (`grid-cols-12`) i komponenty shadcn/ui.

## 2. Lista widoków

### 2.1 Strefa publiczna

| Widok | Ścieżka | Cel | Kluczowe informacje | Kluczowe komponenty | UX / A11Y / Bezpieczeństwo |
|-------|---------|-----|---------------------|---------------------|----------------------------|
| Strona główna | `/` | Szybki przegląd katalogu psów i CTA do rejestracji | Lista kart psów z filtrem rozmiaru, wieku, miasta; hero z opisem misji | `Header`, `DogFilters`, `DogGrid`, `DogCard`, `Footer` | Lazy-load listy, skeleton loader, aria-labels na filtrach |
| Szczegóły psa | `/dogs/:id` | Szczegółowe dane jednego psa | Imię, wiek, wielkość, temperament, zdrowie, schronisko, przycisk „Adoptuj” | `DogDetail`, `AdoptButton`, `BackLink` | Blokada przycisku dla niezalogowanych; alt dla placeholdera zdjęcia |
| Błąd 404 | `*` | Informacja o nieistniejącej stronie | Komunikat + link do `/` | `ErrorPage` | Zgłasza status 404, aria-live polite |

### 2.2 Strefa adoptera (wymaga roli `adopter`)

| Widok | Ścieżka | Cel | Kluczowe informacje | Kluczowe komponenty | UX / A11Y / Bezpieczeństwo |
|-------|---------|-----|---------------------|---------------------|----------------------------|
| Logowanie / Rejestracja | `/login` | Uzyskanie sesji Supabase | Formularz e-mail/hasło, checkbox RODO | `AuthForm`, `Header`, `Footer` | Validacja Zod, aria-invalid, blokada do czasu weryfikacji e-mail |
| Profil stylu życia | `/profile` | Wypełnienie/edycja krótkiego profilu | Pola housing_type, household_size, etc. | `LifestyleForm`, `SaveButton` | Walidacja natychmiastowa; role="form"; token CSRF w cookie |
| Lista wniosków | `/applications` | Przegląd własnych wniosków | Tabela: Pies, schronisko, status, data | `ApplicationCard` (mobile) / `ApplicationTable` (desktop) | Kolory statusów, filtrowanie lokalne, aria-sort |
| Szczegóły wniosku | `/applications/:id` | Podgląd konkretnego wniosku | Dog summary, motivation, status, comment | `ApplicationDetail`, `StatusBadge` | 403 gdy brak dostępu; focus trap przy modalach |
| Modal wniosku | (otwierany z `/dogs/:id`) | Złożenie wniosku adopcyjnego | Pola motivation, contact_preference, extra_notes | `ApplicationFormModal` | Esc zamyka modal, aria-modal, disable onSubmit |

### 2.3 Strefa pracownika schroniska (rozwidlenie na role `shelter_staff`, `admin`)

| Widok | Ścieżka | Cel | Kluczowe informacje | Kluczowe komponenty | UX / A11Y / Bezpieczeństwo |
|-------|---------|-----|---------------------|---------------------|----------------------------|
| Dashboard (redirect) | `/shelter` | Wejście do modułu schroniska | Redirect do listy wniosków | – | Middleware sprawdza rolę |
| Lista wniosków schroniska | `/shelter/applications` | Zarządzanie wnioskami | Tabela: Adopter, Pies, Data, Status | `ShelterApplicationsTable`, `StatusSelect` | Server filters (status), rola w JWT, aria-busy podczas ładowania |
| Szczegóły wniosku schroniska | `/shelter/applications/:id` | Przegląd i aktualizacja statusu | Lifestyle profile adoptującego, komentarz, dropdown statusu | `ShelterApplicationReview`, `CommentBox`, `SaveButton` | Walidacja przejść statusów, optimistic UI, toast |

## 3. Mapa podróży użytkownika

### Adopter – główny happy path

1. Wejście na `/` → oglądanie kart psów.
2. Klik „Adoptuj” → przekierowanie do `/login` jeżeli brak sesji.
3. Po rejestracji/logowaniu → automatyczny redirect do `/profile` (jeśli profil pusty).
4. Submit profilu → toast success → redirect `/`.
5. Ponowne klik „Adoptuj” → modal `ApplicationFormModal`.
6. Submit → toast success → redirect `/applications`.
7. Przegląd statusów; odświeżenie automatyczne po wejściu na stronę.

### Shelter Staff – obsługa wniosków

1. Login → JWT zawiera `role=shelter_staff`.
2. Redirect `/shelter/applications`.
3. Filtrowanie tabeli (status=new).
4. Klik w wiersz → `/shelter/applications/:id`.
5. Zmiana statusu, opcjonalny komentarz → zapisz.
6. Toast success → back link do listy.

## 4. Układ i struktura nawigacji

```
<Header>
  <Logo />
  <NavLinks>
    / (Home)           – zawsze
    /applications      – gdy role=adopter
    /profile           – gdy zalogowany adopter
    /shelter/applications – gdy role=shelter_staff
  </NavLinks>
  <AuthSection>
    Login / AvatarMenu (logout)
  </AuthSection>
</Header>

<Outlet />   # React Router / Astro island
<Footer />
```

- Mobile: `Header` z hamburgerem (`MobileMenu`) zawiera te same linki.
- ProtectedRoute komponuje się wokół tras wymagających roli.

## 5. Kluczowe komponenty wielokrotnego użytku

| Komponent | Opis | Widoki użycia |
|-----------|------|---------------|
| `Header` | Pasek nawigacji + stan auth | Wszystkie |
| `Footer` | Informacje statyczne | Wszystkie |
| `DogCard` | Karta psa w siatce | `/` |
| `DogGrid` | Kontener siatki z filtrami | `/` |
| `DogFilters` | Select/checkbox do filtrowania | `/` |
| `AdoptButton` | Wywołuje modal wniosku | `DogCard`, `DogDetail` |
| `ApplicationFormModal` | Formularz POST `/applications` | Modal (adopter) |
| `StatusBadge` | Kolorowy znacznik statusu | listy aplikacji |
| `StatusSelect` | Dropdown zmiany statusu | schronisko review |
| `Toast` | Powiadomienia | global |
| `ProtectedRoute` | Wrapper do kontroli roli | profile, applications, shelter |
| `LoadingSpinner` / `Skeleton` | Stany ładowania | global |
| `ErrorMessage` | Komunikat błędu formularza | formularze |

---

**Mapowanie historyjek użytkownika → widoki**

- US-001 Rejestracja → `/login` (AuthForm)
- US-002 Profil → `/profile` (LifestyleForm)
- US-003 Katalog → `/`, `/dogs/:id` (DogGrid, DogDetail)
- US-004 Wniosek → Modal `ApplicationFormModal`, `/applications`, `/applications/:id`
- US-005 Obsługa wniosków → `/shelter/applications`, `/shelter/applications/:id`

**Edge cases i stany błędów**
- Brak psów (pusta lista) → placeholder "Brak dostępnych psów"
- 401 przy API → redirect `/login` + toast
- 404 pies/wniosek → ErrorPage 404
- 409 duplikat wniosku → toast "Już złożyłeś wniosek"
- Network error → toast + retry button

**Zgodność z planem API**
- Wszystkie operacje UI odwzorowują endpointy `/dogs`, `/applications`, `/lifestyle-profile` itd.
- Brak wymagań paginacji, UI pobiera pełne listy zgodnie z decyzją MVP.

---

Plan stanowi podstawę do implementacji komponentów i tras w Astro + React.
