# Diagram podróży użytkownika - AdoptMe

## Mapa podróży użytkownika przez system

Poniższy diagram przedstawia wszystkie możliwe ścieżki użytkownika w aplikacji AdoptMe,
od pierwszej wizyty przez rejestrację, logowanie, aż po składanie wniosków adopcyjnych.

```mermaid
stateDiagram-v2
    [*] --> StronaGlowna

    state "Strona Główna" as StronaGlowna {
        [*] --> PrzegladaniePubliczne
        PrzegladaniePubliczne: Katalog psów dostępny bez logowania
        note right of PrzegladaniePubliczne
            Użytkownik może przeglądać psy,
            filtrować i wyszukiwać
            bez konieczności logowania
        end note
    }

    StronaGlowna --> if_zalogowany
    state if_zalogowany <<choice>>
    if_zalogowany --> ProbaAdopcji: Kliknięcie Adoptuj
    if_zalogowany --> PrzyciskLogowania: Kliknięcie Zaloguj się
    if_zalogowany --> PrzyciskRejestracji: Kliknięcie Zarejestruj się

    PrzyciskRejestracji --> ProcesRejestracji
    PrzyciskLogowania --> ProcesLogowania
    ProbaAdopcji --> if_auth_adopcja

    state if_auth_adopcja <<choice>>
    if_auth_adopcja --> ProcesLogowania: Niezalogowany
    if_auth_adopcja --> FormularzAdopcyjny: Zalogowany

    state "Proces Rejestracji" as ProcesRejestracji {
        [*] --> FormularzRejestracji
        FormularzRejestracji: Email, hasło, zgoda RODO

        FormularzRejestracji --> WalidacjaRejestracji

        state if_walidacja_reg <<choice>>
        WalidacjaRejestracji --> if_walidacja_reg
        if_walidacja_reg --> BlokRejestracji: Dane niepoprawne
        BlokRejestracji --> FormularzRejestracji
        if_walidacja_reg --> WyslanieMailaWeryfikacyjnego: Dane poprawne

        WyslanieMailaWeryfikacyjnego --> OczekiwanieNaWeryfikacje
        OczekiwanieNaWeryfikacje: Sprawdź swoją skrzynkę e-mail
        note right of OczekiwanieNaWeryfikacje
            E-mail z linkiem weryfikacyjnym
            Link ważny przez 24 godziny
        end note

        OczekiwanieNaWeryfikacje --> KliktniecieLinkuWeryfikacyjnego
        KliktniecieLinkuWeryfikacyjnego --> WeryfikacjaTokena

        state if_token_weryfikacja <<choice>>
        WeryfikacjaTokena --> if_token_weryfikacja
        if_token_weryfikacja --> TokenWygasl: Token wygasły
        TokenWygasl --> PonownaWysylkaMaila
        PonownaWysylkaMaila --> OczekiwanieNaWeryfikacje
        if_token_weryfikacja --> KontoZweryfikowane: Token ważny

        KontoZweryfikowane --> [*]
    }

    ProcesRejestracji --> ProcesLogowania: Konto zweryfikowane

    state "Proces Logowania" as ProcesLogowania {
        [*] --> FormularzLogowania
        FormularzLogowania: Email i hasło

        FormularzLogowania --> LinkOdzyskiwaniaHasla: Zapomniałem hasła
        LinkOdzyskiwaniaHasla --> ProcesOdzyskiwaniaHasla

        FormularzLogowania --> WeryfikacjaCredentials

        state if_credentials <<choice>>
        WeryfikacjaCredentials --> if_credentials
        if_credentials --> BladLogowania: Niepoprawne dane
        BladLogowania --> FormularzLogowania

        if_credentials --> SprawdzenieWeryfikacjiEmail: Poprawne dane

        state if_email_verified <<choice>>
        SprawdzenieWeryfikacjiEmail --> if_email_verified
        if_email_verified --> BladNiezweryfikowanyEmail: Email niezweryfikowany
        BladNiezweryfikowanyEmail --> FormularzLogowania
        if_email_verified --> UtworzenieSesji: Email zweryfikowany

        UtworzenieSesji: Cookies ustawione
        note right of UtworzenieSesji
            Access token (1h)
            Refresh token (30d)
            HttpOnly, Secure cookies
        end note

        UtworzenieSesji --> [*]
    }

    state "Proces Odzyskiwania Hasła" as ProcesOdzyskiwaniaHasla {
        [*] --> FormularzEmailOdzyskiwania
        FormularzEmailOdzyskiwania: Podaj adres e-mail

        FormularzEmailOdzyskiwania --> WyslanieMailaRecovery
        WyslanieMailaRecovery: Link wysłany na e-mail
        note right of WyslanieMailaRecovery
            Link ważny przez 1 godzinę
            Ogólny komunikat sukcesu
            (nie ujawniamy czy email istnieje)
        end note

        WyslanieMailaRecovery --> KlikniecieLinku
        KlikniecieLinku --> WeryfikacjaTokenuRecovery

        state if_token_recovery <<choice>>
        WeryfikacjaTokenuRecovery --> if_token_recovery
        if_token_recovery --> TokenRecoveryWygasl: Token wygasły
        TokenRecoveryWygasl --> FormularzEmailOdzyskiwania
        if_token_recovery --> FormularzNowegoHasla: Token ważny

        FormularzNowegoHasla: Nowe hasło 2x
        FormularzNowegoHasla --> AktualizacjaHasla
        AktualizacjaHasla --> [*]
    }

    ProcesOdzyskiwaniaHasla --> ProcesLogowania: Hasło zmienione

    ProcesLogowania --> if_rola
    state if_rola <<choice>>
    if_rola --> DashboardAdopter: Rola: adopter
    if_rola --> PanelSchroniska: Rola: shelter_staff

    state "Dashboard Użytkownika Adopter" as DashboardAdopter {
        [*] --> StronaGlownaZalogowany

        StronaGlownaZalogowany --> PrzegladanieKatalogu
        PrzegladanieKatalogu: Filtrowanie i wyszukiwanie psów

        PrzegladanieKatalogu --> SzczegolyPsa
        SzczegolyPsa --> ProfilStyluZycia: Adoptuj tego psa

        state if_profil_istnieje <<choice>>
        ProfilStyluZycia --> if_profil_istnieje
        if_profil_istnieje --> FormularzProfiluStyluZycia: Brak profilu
        if_profil_istnieje --> FormularzAdopcyjnyZalogowany: Profil istnieje

        FormularzProfiluStyluZycia: Typ mieszkania, domownicy, doświadczenie
        note right of FormularzProfiluStyluZycia
            Wszystkie pola obowiązkowe
            Można edytować później
            Dostępny dla schroniska
        end note

        FormularzProfiluStyluZycia --> FormularzAdopcyjnyZalogowany

        FormularzAdopcyjnyZalogowany: Motywacja, kontakt, uwagi
        FormularzAdopcyjnyZalogowany --> ZlozonyWniosek

        ZlozonyWniosek: Status: nowy
        note right of ZlozonyWniosek
            Wniosek nie podlega edycji
            Użytkownik czeka na decyzję schroniska
        end note

        StronaGlownaZalogowany --> MojeWnioski
        MojeWnioski: Lista złożonych wniosków
        MojeWnioski --> SzczegolyWniosku
        SzczegolyWniosku: Status i komentarz schroniska

        StronaGlownaZalogowany --> RekomendacjeAI
        RekomendacjeAI: Ankieta 3-5 pytań
        RekomendacjeAI --> WynikRekomendacji
        WynikRekomendacji --> SzczegolyPsa: Kliknięcie rekomendowanego psa

        StronaGlownaZalogowany --> MojProfil
        MojProfil: Edycja profilu stylu życia

        StronaGlownaZalogowany --> Wylogowanie
        Wylogowanie --> [*]
    }

    state "Panel Schroniska" as PanelSchroniska {
        [*] --> MenuGlowneSchroniska

        MenuGlowneSchroniska --> ZarzadzanieKatalogiem
        ZarzadzanieKatalogiem: Lista psów w schronisku

        ZarzadzanieKatalogiem --> DodawaniePsa
        DodawaniePsa: Formularz nowego psa
        note right of DodawaniePsa
            Imię, wiek, wielkość
            Temperament, zdrowie
            Status adopcyjny
        end note

        ZarzadzanieKatalogiem --> EdycjaPsa
        EdycjaPsa: Aktualizacja danych psa

        MenuGlowneSchroniska --> ListaWnioskow
        ListaWnioskow: Wnioski dla psów ze schroniska
        note right of ListaWnioskow
            Sortowanie po dacie
            Filtrowanie po statusie
            Widoczny profil stylu życia
        end note

        ListaWnioskow --> SzczegolyWnioskuSchronisko
        SzczegolyWnioskuSchronisko --> AktualizacjaStatusu

        AktualizacjaStatusu: w trakcie, zaakceptowany, odrzucony
        note right of AktualizacjaStatusu
            Opcjonalny komentarz
            Użytkownik widzi zmianę statusu
        end note

        MenuGlowneSchroniska --> WylogowanieSchronisko
        WylogowanieSchronisko --> [*]
    }

    DashboardAdopter --> StronaGlowna: Wylogowanie
    PanelSchroniska --> StronaGlowna: Wylogowanie

    state "Obsługa Sesji" as ObslugaSesji {
        note right of ObslugaSesji
            Middleware automatycznie:
            - Sprawdza cookies sesji
            - Odświeża wygasłe tokeny
            - Przekazuje user do Astro.locals
            - Inicjalizuje React auth store
        end note
    }
```

## Kluczowe ścieżki biznesowe

### 1. Ścieżka szybkiej adopcji (Happy Path - Adopter)
Strona główna → Rejestracja → Weryfikacja e-mail → Logowanie →
Przeglądanie katalogu → Szczegóły psa → Profil stylu życia →
Wniosek adopcyjny → Oczekiwanie na decyzję

**Czas:** ~10-15 minut (bez oczekiwania na decyzję)

### 2. Ścieżka zarządzania przez schronisko (Happy Path - Shelter)
Logowanie → Panel schroniska → Dodanie psa do katalogu →
Przeglądanie wniosków → Aktualizacja statusu → Dodanie komentarza

**Czas:** ~5-10 minut na obsłużenie wniosku

### 3. Ścieżka anonimowa (Bez rejestracji)
Strona główna → Przeglądanie katalogu → Filtrowanie →
Szczegóły psa → Zachęta do rejestracji

**Czas:** Dowolny, bez limitu

### 4. Ścieżka odzyskiwania dostępu
Logowanie → Zapomniałem hasła → Formularz e-mail →
Link w e-mailu → Nowe hasło → Logowanie

**Czas:** ~3-5 minut (+ czas na otrzymanie e-maila)

## Punkty decyzyjne i alternatywne ścieżki

### Decyzja 1: Czy użytkownik zalogowany?
- **NIE**: Przekierowanie do logowania z parametrem redirectTo
- **TAK**: Dostęp do chronionych zasobów

### Decyzja 2: Czy e-mail zweryfikowany?
- **NIE**: Błąd logowania, zachęta do sprawdzenia e-maila
- **TAK**: Utworzenie sesji i przekierowanie do dashboardu

### Decyzja 3: Czy profil stylu życia wypełniony?
- **NIE**: Formularz profilu przed wnioskiem adopcyjnym
- **TAK**: Bezpośredni dostęp do formularza wniosku

### Decyzja 4: Jaka rola użytkownika?
- **adopter**: Dashboard z katalogiem i wnioskami
- **shelter_staff**: Panel zarządzania schroniskiem
- **admin**: Dostęp do wszystkich funkcji

## Optymalizacje UX

### Automatyzacja
- Automatyczne odświeżanie tokenów (bez wylogowania)
- Zapisywanie redirectTo przy próbie dostępu do chronionego zasobu
- Inicjalizacja auth store na podstawie danych z serwera (SSR)

### Feedback użytkownika
- Komunikaty sukcesu po każdej akcji
- Jasne komunikaty błędów z sugestiami rozwiązania
- Walidacja formularzy w czasie rzeczywistym

### Bezpieczeństwo UX
- Ogólne komunikaty przy odzyskiwaniu hasła (nie ujawniamy czy email istnieje)
- Sesje automatycznie wygasają po okresie nieaktywności
- Wylogowanie usuwa wszystkie dane sesji

