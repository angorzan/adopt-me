# Plan implementacji widoku Strona Główna (Katalog Psów)

## 1. Przegląd
Widok Strony Głównej (`/`) jest głównym punktem wejścia dla niezalogowanych użytkowników. Jego celem jest prezentacja katalogu psów dostępnych do adopcji oraz umożliwienie ich filtrowania i wyszukiwania. Widok ten ma zachęcić użytkowników do przeglądania profili psów i w konsekwencji do rozpoczęcia procesu adopcyjnego.

## 2. Routing widoku
- **Ścieżka**: `/`
- **Dostępność**: Publiczna, nie wymaga uwierzytelnienia.

## 3. Struktura komponentów
Komponenty zostaną zorganizowane w hierarchię, gdzie `DogCatalogView` będzie głównym kontenerem (wyspą React) renderowanym wewnątrz strony Astro.

```
- /src/pages/index.astro
  - <Layout>
    - <Header />
    - <main>
      - <HeroSection />  // statyczny komponent Astro/HTML
      - <DogCatalogView client:load />  // React Island
        - <DogFilters />
        - <DogGrid>
          - (isLoading ? <DogCardSkeleton />[] : <DogCard />[])
        </DogGrid>
    - </main>
    - <Footer />
  </Layout>
```

## 4. Szczegóły komponentów

### `DogCatalogView.tsx` (Kontener)
- **Opis**: Główny komponent zarządzający stanem katalogu psów. Odpowiada za pobieranie danych z API na podstawie filtrów, zarządzanie stanem ładowania/błędu i przekazywanie danych do komponentów podrzędnych.
- **Główne elementy**: Komponenty `DogFilters` i `DogGrid`.
- **Obsługiwane interakcje**: Reaguje na zmiany filtrów z `DogFilters` i inicjuje ponowne pobranie danych.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `DogFiltersViewModel`, `DTO.DogResponse[]`.
- **Propsy**: Brak.

### `DogFilters.tsx`
- **Opis**: Zestaw kontrolek (pola select, input) do filtrowania i wyszukiwania psów w katalogu.
- **Główne elementy**: `<select>` dla rozmiaru, `<select>` dla kategorii wiekowej, `<input type="search">` dla wyszukiwania tekstowego. Użyje komponentów `Select` i `Input` z biblioteki `shadcn/ui`.
- **Obsługiwane interakcje**: `onChange` na polach formularza.
- **Obsługiwana walidacja**: Brak (komponent dostarcza predefiniowane, poprawne opcje).
- **Typy**: `DogFiltersViewModel`.
- **Propsy**:
  - `filters: DogFiltersViewModel`
  - `onFiltersChange: (filters: DogFiltersViewModel) => void`
  - `isLoading: boolean` (do blokowania pól podczas ładowania)

### `DogGrid.tsx`
- **Opis**: Komponent wyświetlający siatkę z kartami psów lub szkieletami ładowania. Obsługuje również stan, gdy nie znaleziono żadnych psów.
- **Główne elementy**: Siatka CSS (np. `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`), wewnątrz której mapowane są komponenty `DogCard` lub `DogCardSkeleton`.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `DTO.DogResponse[]`.
- **Propsy**:
  - `dogs: DTO.DogResponse[]`
  - `isLoading: boolean`

### `DogCard.tsx`
- **Opis**: Karta prezentująca kluczowe informacje o pojedynczym psie. Jest linkiem do strony szczegółów psa.
- **Główne elementy**: Komponent `Card` z `shadcn/ui`. Zawiera `h3` na imię, `p` na wiek, rozmiar, temperament. Przycisk "Adoptuj" (`AdoptButton`). Całość opakowana w tag `<a>` lub z nawigacją programistyczną.
- **Obsługiwane interakcje**: Kliknięcie karty przenosi do `/dogs/:id`.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `DTO.DogResponse`.
- **Propsy**:
  - `dog: DTO.DogResponse`

### `DogCardSkeleton.tsx`
- **Opis**: Komponent "szkieletu" (placeholder) dla `DogCard`, wyświetlany podczas ładowania danych.
- **Główne elementy**: Komponenty `Skeleton` z `shadcn/ui` ułożone w strukturę odpowiadającą `DogCard`.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**: Brak.

## 5. Typy

### `DTO.DogResponse` (istniejący)
Pochodzi z `src/types.ts` i `src/db/database.types.ts`. Reprezentuje obiekt psa zwracany przez API.

### `DogFiltersViewModel` (nowy)
Reprezentuje stan formularza filtrów w UI.
```typescript
import type { Enums } from '~/db/database.types';

export interface DogFiltersViewModel {
  size: Enums<'dog_size'> | 'all';
  age_category: Enums<'dog_age_category'> | 'all';
  q: string; // dla wyszukiwania po nazwie lub mieście
}
```

## 6. Zarządzanie stanem
- **Stan filtrów**: Lokalny stan w komponencie `DogCatalogView` zarządzany przez `useState<DogFiltersViewModel>`.
- **Stan danych z API**: Zarządzany globalnie przez **React Query**. Zostanie stworzony customowy hook `useDogs`.
  - **`useDogs(filters: DogFiltersViewModel)`**:
    - Używa `useQuery` z React Query.
    - Klucz zapytania będzie dynamiczny i zależny od obiektu `filters`, np. `['dogs', filters]`. Zapewni to automatyczne ponowne pobieranie danych przy zmianie filtrów.
    - Hook będzie odpowiedzialny za wywołanie funkcji pobierającej dane z API.
    - Zwraca `{ data, isLoading, isError, error }`.
- **Wyszukiwanie**: Stan `q` z `DogFiltersViewModel` będzie aktualizowany z opóźnieniem (debounce ~300ms), aby uniknąć nadmiernych zapytań do API podczas pisania.

## 7. Integracja API
- **Endpoint**: `GET /api/v1/dogs`
- **Metoda**: `GET`
- **Parametry zapytania**: `size`, `age_category`, `q`. Wartość `'all'` dla filtrów select nie będzie wysyłana do API.
- **Funkcja pobierająca**:
  ```typescript
  async function fetchDogs(filters: DogFiltersViewModel): Promise<DTO.DogResponse[]> {
    const params = new URLSearchParams();
    if (filters.size !== 'all') params.append('size', filters.size);
    if (filters.age_category !== 'all') params.append('age_category', filters.age_category);
    if (filters.q) params.append('q', filters.q);

    const response = await fetch(`/api/v1/dogs?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch dogs');
    }
    return response.json();
  }
  ```
- **Typ żądania**: Brak (parametry w URL).
- **Typ odpowiedzi**: `Promise<DTO.DogResponse[]>`

## 8. Interakcje użytkownika
- **Ładowanie strony**: Użytkownik widzi szkielety (`DogCardSkeleton`), podczas gdy `useDogs` wykonuje pierwsze zapytanie. Po załadowaniu danych wyświetla się siatka psów.
- **Zmiana filtra (Select)**: Użytkownik wybiera opcję w `DogFilters`. Wywoływana jest funkcja `onFiltersChange`, która aktualizuje stan `filters` w `DogCatalogView`. Zmiana klucza w `useQuery` powoduje automatyczne ponowne zapytanie z nowymi parametrami. UI ponownie pokazuje szkielety na czas ładowania.
- **Wpisywanie w polu wyszukiwania**: Użytkownik pisze w `DogFilters`. Wartość jest przechowywana w stanie lokalnym i po upływie 300ms bezczynności aktualizowany jest główny stan `filters`, co inicjuje zapytanie do API.
- **Kliknięcie w kartę psa**: Użytkownik jest przenoszony na stronę `/dogs/{dog.id}`.

## 9. Warunki i walidacja
- Interfejs nie wymaga walidacji sensu stricto, ponieważ dostarcza użytkownikowi z góry zdefiniowane, poprawne opcje filtrów (np. wartości `enum` dla `dog_size`).
- Pole wyszukiwania jest typu tekstowego i nie wymaga walidacji po stronie frontendu.

## 10. Obsługa błędów
- **Błąd API (np. 500)**: Hook `useDogs` zwróci `isError: true`. `DogCatalogView` wykryje ten stan i zamiast `DogGrid` wyświetli komponent `ErrorMessage` z komunikatem "Nie udało się pobrać danych. Spróbuj ponownie." i przyciskiem do ponowienia próby (wywołującym `refetch` z React Query).
- **Brak wyników**: Hook `useDogs` zwróci `data: []`. Komponent `DogGrid` po sprawdzeniu `!isLoading && dogs.length === 0` wyświetli komunikat "Nie znaleziono psów spełniających podane kryteria."

## 11. Kroki implementacji
1. **Utworzenie plików**: Stwórz pliki dla komponentów: `/src/components/dogs/DogCatalogView.tsx`, `DogFilters.tsx`, `DogGrid.tsx`, `DogCard.tsx`, `DogCardSkeleton.tsx`.
2. **Strona Astro**: W `/src/pages/index.astro` zaimportuj i umieść `<DogCatalogView client:load />` w odpowiednim miejscu layoutu.
3. **Zdefiniowanie typów**: W nowym pliku `/src/viewModels.ts` (lub podobnym) zdefiniuj `DogFiltersViewModel`.
4. **Implementacja komponentów szkieletu i karty**: Zakoduj `DogCardSkeleton` i `DogCard` na podstawie `DTO.DogResponse`, używając komponentów `shadcn/ui`.
5. **Implementacja `DogGrid`**: Stwórz komponent `DogGrid`, który warunkowo renderuje siatkę szkieletów, siatkę kart psów lub komunikat o braku wyników.
6. **Implementacja `DogFilters`**: Stwórz formularz filtrów, który przyjmuje stan i emituje zmiany poprzez `onFiltersChange`.
7. **Implementacja hooka `useDogs`**: Stwórz hook, który hermetyzuje logikę `useQuery` do pobierania danych z `/api/v1/dogs` na podstawie przekazanych filtrów.
8. **Implementacja `DogCatalogView`**: Zintegruj wszystkie części. Użyj `useState` do zarządzania filtrami, przekaż je do `useDogs`. Wyniki z hooka (`data`, `isLoading`) przekaż jako propsy do `DogGrid` i `DogFilters`. Zaimplementuj logikę debounce dla pola wyszukiwania.
9. **Styling**: Użyj Tailwind CSS do ostylowania wszystkich komponentów zgodnie z architekturą (siatka responsywna itp.).
10. **Testowanie manualne**: Przetestuj wszystkie interakcje: ładowanie strony, filtrowanie, wyszukiwanie, obsługę błędów i brak wyników.
