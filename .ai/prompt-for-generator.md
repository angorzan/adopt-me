# Prompt dla generatora PoC - AdoptMe

  ## Cel
  Stwórz proof of concept aplikacji AdoptMe do weryfikacji podstawowej
  funkcjonalności:
  przeglądania katalogu psów z filtrowaniem oraz składania formularza
  adopcyjnego.

  ## Zakres PoC (MINIMAL)

  ### 1. Katalog psów
  - Wyświetl listę psów z pliku `data/dogs.json`
  - Pokaż dla każdego psa: imię, wiek, rozmiar, temperament, zdrowie,
  lokalizację schroniska
  - Implementuj filtrowanie po:
    - Wielkości (mała, średnia, duża)
    - Wieku (szczeniak <2, dorosły 2-7, senior >7)
    - Mieście
  - Dodaj proste wyszukiwanie po imieniu psa

  ### 2. Formularz adopcyjny
  - Formularz zawiera:
    - Wybór psa (pre-selected z katalogu)
    - Podstawowe dane kontaktowe (imię, email, telefon)
    - Uproszczony profil stylu życia (3-5 pól: typ mieszkania, doświadczenie
  z psami, poziom aktywności)
    - Powód adopcji (textarea)
    - Checkbox zgody na przetwarzanie danych
  - Po wysłaniu: wyświetl podsumowanie w konsoli + prosty komunikat sukcesu

  ## Tech Stack
  - **Frontend**: Astro 5 + React 19 (wyspowe komponenty)
  - **Styling**: Tailwind CSS + shadcn/ui
  - **Dane**: statyczne z `data/dogs.json` (bez bazy danych)

  ## WYŁĄCZ z PoC
  - ❌ Rejestrację i logowanie użytkowników
  - ❌ Weryfikację email
  - ❌ Zapisywanie do bazy danych (Supabase)
  - ❌ Panel schroniska
  - ❌ Statusy wniosków i zarządzanie nimi
  - ❌ System powiadomień
  - ❌ RODO compliance (tylko podstawowy checkbox w formularzu)
  - ❌ Responsywność mobilną (desktop-first wystarczy)

  ## Wymagania
  1. **PRZED rozpoczęciem kodowania**: przedstaw plan architektury i
  struktury projektu, poczekaj na moją akceptację
  2. Użyj gotowych komponentów shadcn/ui dla formularzy i UI
  3. Kod ma być czytelny i dobrze skomentowany
  4. PoC ma działać lokalnie po `npm install && npm run dev`

  ## Struktura danych
  Użyj istniejącego pliku `data/dogs.json` - zawiera 5 psów z polami:
  id, name, age, size, temperament, health, shelter (name, city,
  contactEmail), adoptionStatus

  ## Rezultat
  Działająca aplikacja pozwalająca:
  1. Przeglądać psy z filtrowaniem
  2. Otworzyć formularz adopcyjny dla wybranego psa
  3. Wypełnić formularz i "wysłać" (log do konsoli)

  **WAŻNE**: Rozplanuj pracę i przedstaw mi plan implementacji do akceptacji
  przed rozpoczęciem kodowania.

> zaktualizowałam prd.md, więc zaktualizuj twoją poprzednią odpowiedź w
oparciu o nowe dae. Ten wygenerowany prompt ma być po angielsku

● # Prompt for PoC Generator - AdoptMe

  ## Objective
  Create a proof of concept for AdoptMe application to verify core
  functionality:
  browsing dog catalog with filtering, filling out adoption form, and simple
  AI-powered dog recommendation.

  ## PoC Scope (MINIMAL)

  ### 1. Dog Catalog
  - Display list of dogs from `data/dogs.json`
  - Show for each dog: name, age, size, temperament, health info, shelter
  location
  - Implement filtering by:
    - Size (mała/small, średnia/medium, duża/large)
    - Age (puppy <2, adult 2-7, senior >7)
    - City
  - Add simple search by dog name

  ### 2. AI Recommendation (Simple)
  - Short questionnaire with 3-5 closed questions:
    - Preferred dog size
    - Activity level
    - Experience with dogs
    - Housing type
    - Presence of children
  - After submission: send prompt to AI service (OpenRouter) with:
    - User's answers
    - List of available dogs from `data/dogs.json`
  - Display AI-recommended dog (one) with explanation
  - If AI fails: show fallback message directing user to browse catalog
  manually

  ### 3. Adoption Form
  - Form contains:
    - Dog selection (pre-selected from catalog or AI recommendation)
    - Basic contact info (name, email, phone)
    - Simplified lifestyle profile (3-5 fields: housing type, dog experience,
   activity level)
    - Reason for adoption (textarea)
    - Data processing consent checkbox
  - After submission: log to console + simple success message

  ## Tech Stack
  - **Frontend**: Astro 5 + React 19 (island components)
  - **Styling**: Tailwind CSS + shadcn/ui
  - **Data**: Static from `data/dogs.json` (no database)
  - **AI**: OpenRouter API (simple prompt, one recommendation)

  ## EXCLUDE from PoC
  - ❌ User registration and login
  - ❌ Email verification
  - ❌ Database persistence (Supabase)
  - ❌ Shelter dashboard
  - ❌ Application status management
  - ❌ Notification system
  - ❌ Full GDPR compliance (basic consent checkbox only)
  - ❌ Mobile responsiveness (desktop-first is sufficient)
  - ❌ Advanced AI features (multi-criteria matching, feedback loops)

  ## Requirements
  1. **BEFORE starting to code**: present architecture plan and project
  structure, wait for my approval
  2. Use shadcn/ui components for forms and UI
  3. Code must be clean and well-commented
  4. PoC must run locally after `npm install && npm run dev`
  5. OpenRouter API key should be configurable via `.env` file

  ## Data Structure
  Use existing `data/dogs.json` file - contains 5 dogs with fields:
  id, name, age, size, temperament, health, shelter (name, city,
  contactEmail), adoptionStatus

  ## Expected Result
  Working application allowing users to:
  1. Browse dogs with filtering
  2. Fill out short AI questionnaire and receive one recommended dog
  3. Open adoption form for selected/recommended dog
  4. Fill and "submit" form (log to console)

  ## AI Integration Notes
  - Keep prompt simple (e.g., "Based on user preferences: {answers},
  recommend ONE dog from: {dogs}. Return dog ID and short reason.")
  - Handle API errors gracefully (show fallback message)
  - No need for complex RAG or embeddings - direct prompt with full context

  **IMPORTANT**: Plan your work and present an implementation plan for my
  approval before starting to code.