# Dokument wymagań produktu (PRD) - AdoptMe
## 1. Przegląd produktu
AdoptMe to aplikacja webowa wspierająca adopcję psów w Polsce. Użytkownicy rejestrują konto, opisują swój styl życia i składają wnioski adopcyjne. Schroniska zarządzają katalogiem psów, przeglądają napływające wnioski oraz potwierdzają adopcje. System dba o transparentność procesu, wspiera komunikację i edukuje w temacie odpowiedzialnej adopcji. Aplikacja jest zgodna z RODO, obsługuje użytkowników końcowych i pracowników schronisk oraz gromadzi dane do raportów.

## 2. Problem użytkownika
Osoby chcące adoptować psa mają problem ze znalezieniem zwierzęcia do swojego stylu życia, brakuje im kompletnych informacji o psach i ich potrzebach. Schroniska toną w wnioskach przesyłanych różnymi kanałami, odpowiadają po długim czasie lub gubią zgłoszenia. Przygotowanie użytkownika do adopcji i zbudowanie relacji z konkretnym schroniskiem jest czasochłonne. AdoptMe rozwiązuje te problemy, dostarczając sprawny katalog, ustrukturyzowany formularz wniosków i moduł edukacyjny.

## 3. Wymagania funkcjonalne
### 3.1 Zakres MVP (2 tygodnie)
1. Rejestracja i logowanie użytkowników z akceptacją zgód RODO oraz weryfikacją e-mail.
2. Skrócony profil stylu życia z polami: typ mieszkania, liczba domowników (z uwzględnieniem dzieci), doświadczenie z psami, poziom aktywności, preferowany typ psa.
3. Katalog psów oparty o wbudowany zestaw danych (bez uploadu zdjęć), prezentujący imię, wiek, wielkość, temperament, informacje zdrowotne oraz lokalizację schroniska.
4. Filtrowanie psów po co najmniej wielkości i wieku; wyszukiwanie po nazwie lub mieście.
5. Formularz wniosku adopcyjnego zapisujący dane użytkownika, wybranego psa, powód adopcji, preferowany kontakt i uwagi dodatkowe. Wniosek nie podlega edycji po wysłaniu.
6. Panel schroniska z listą wniosków, możliwością ustawienia statusu (nowy, w trakcie, zaakceptowany, odrzucony) oraz dodaniem krótkiego komentarza.
7. Prosty moduł rekomendacji AI: po wypełnieniu ankiety z 3–5 pytaniami zamkniętymi system wywołuje usługę AI (np. prompt do modelu przez OpenRouter) i otrzymuje propozycję jednego psa z dostępnych rekordów.
8. Udostępniony plik `data/dogs.json` (oraz opcjonalnie tabela w Supabase) jako źródło danych dla katalogu i modułu AI.

### 3.2 Funkcje planowane po MVP
- Rozbudowany profil stylu życia (więcej pól, wersjonowanie danych).
- Edycja lub anulowanie wniosku przez użytkownika i historia zmian.
- System powiadomień e-mail/in-app z logowaniem doręczeń i przypomnieniami.
- Mechanizmy kontroli jakości danych psów (alerty, ukrywanie kart, zadania dla schronisk).
- Tygodniowe raporty dla schronisk oraz automatyczna ankieta po 30 dniach od adopcji.
- Rozszerzone testy dostępności, 2FA, importy danych i zaawansowany moduł AI (np. wielokryterialne dopasowanie, feedback loop).

## 4. Granice produktu
### 4.1 Zakres wykluczony w MVP
- Moduł rekomendacji AI analizujący dane stylu życia użytkownika i proponujący psy.
- Automatyczne importy danych ze schronisk (API, CSV) oraz integracje z zewnętrznymi rejestrami.
- Funkcje społecznościowe (udział społeczności, opinie publiczne, współdzielenie profili psów).
- Powiadomienia SMS/push i natywna aplikacja mobilna.
- Rozszerzenie adopcji na inne gatunki zwierząt oraz dodatkowe procesy (domy tymczasowe, wolontariat).

### 4.2 Założenia i ograniczenia
- Brak modułu płatności i darowizn.
- Brak wsparcia dla adopcji innych zwierząt w MVP.
- Brak automatycznych integracji z zewnętrznymi bazami danych schronisk (import planowany w kolejnej iteracji).
- Moduł AI do rekomendacji psów dostępny dopiero po MVP.
- Brak natywnej aplikacji mobilnej; responsywność webu jest wymagana.
- Brak obsługi czatu na żywo pomiędzy użytkownikami a schroniskami (tylko notyfikacje i statusy).
- Brak rozliczeń za usługi; adopcje traktowane są jako proces społeczny.

## 5. Historyjki użytkowników
### 5.1 Zakres MVP (2 tygodnie)
### US-001 Rejestracja konta
Opis: Jako osoba chcąca adoptować psa chcę założyć konto i zaakceptować zgody, aby móc korzystać z systemu.
Kryteria akceptacji:
A. Formularz rejestracji zbiera e-mail, hasło, imię i nazwisko, zgody RODO.
B. Email weryfikacyjny wysyłany automatycznie, konto aktywne po potwierdzeniu.
C. Błędne dane wyświetlają komunikat walidacyjny.
D. Login wymaga wcześniejszej weryfikacji e-mail.

### US-002 Skrócony profil stylu życia
Opis: Jako użytkownik chcę krótko opisać mój styl życia, aby schronisko mogło ocenić dopasowanie psa.
Kryteria akceptacji:
A. Formularz zawiera pola: typ mieszkania, liczba domowników (z uwzględnieniem dzieci), doświadczenie z psami, poziom aktywności, preferowany typ psa.
B. Wszystkie pola są obowiązkowe; przy braku danych system wyświetla komunikat.
C. Dane można edytować w dowolnym momencie, zapisując nową wersję (bez historii zmian).
D. Profil jest dostępny w panelu schroniska przy każdym wniosku.

### US-003 Przeglądanie katalogu psów
Opis: Jako użytkownik chcę zobaczyć listę psów dostępnych do adopcji i znaleźć interesujące mnie przypadki.
Kryteria akceptacji:
A. Lista psów prezentuje imię, wiek, wielkość, temperament, informacje zdrowotne i lokalizację schroniska.
B. Użytkownik może filtrować psy po wielkości oraz wieku (kategorie np. szczeniak/dorosły/senior).
C. Wyszukiwanie po nazwie psa lub mieście zwraca dopasowane rekordy.
D. Dane psów wczytywane są z pliku `data/dogs.json` lub z tabeli Supabase wypełnionej na bazie tego pliku.

### US-004 Złożenie wniosku adopcyjnego
Opis: Jako użytkownik chcę złożyć wniosek adopcyjny dla wybranego psa.
Kryteria akceptacji:
A. Formularz przypisuje wniosek do zalogowanego użytkownika oraz identyfikatora psa.
B. Wymagane pola: powód adopcji, preferowany kanał kontaktu, zgoda na przetwarzanie danych, pole na dodatkowe uwagi.
C. Po wysłaniu wniosku użytkownik otrzymuje informację o zapisaniu zgłoszenia (bez powiadomienia e-mail).
D. Wniosek nie może być edytowany ani anulowany; status domyślny „nowy”.

### US-005 Obsługa wniosków przez schronisko
Opis: Jako pracownik schroniska chcę widzieć listę wniosków i zmieniać ich status.
Kryteria akceptacji:
A. Panel prezentuje listę wniosków z informacją o użytkowniku, psie i dacie zgłoszenia.
B. Pracownik może ustawić status: „w trakcie”, „zaakceptowany”, „odrzucony”.
C. Zmiana statusu może zawierać krótki komentarz (opcjonalny).
D. Panel sortuje listę domyślnie po dacie zgłoszenia (najnowsze na górze).

### US-006 Rekomendacja psa przez AI
Opis: Jako użytkownik chcę otrzymać propozycję psa dopasowanego do moich odpowiedzi na krótką ankietę.
Kryteria akceptacji:
A. Ankieta zawiera 3–5 pytań zamkniętych (np. wielkość psa, poziom energii, relacja z dziećmi).
B. Po wypełnieniu ankiety aplikacja tworzy prompt i przekazuje go do usługi AI (np. model przez OpenRouter) wraz z listą dostępnych psów.
C. Model zwraca identyfikator lub opis jednego psa rekomendowanego użytkownikowi; wynik jest prezentowany obok katalogu.
D. Jeśli model nie zwróci rekomendacji, użytkownik otrzymuje komunikat z sugestią ręcznego przeglądania katalogu.

### 5.2 Funkcje po MVP
### US-007 Edycja lub anulowanie wniosku przez użytkownika
Opis: Jako użytkownik chcę móc edytować lub anulować wniosek, jeśli sytuacja ulegnie zmianie.
Kryteria akceptacji:
A. Dostępne tylko, gdy status wniosku to „nowy” lub „w trakcie”.
B. Historia zmian przechowywana i widoczna dla schroniska.
C. Anulowanie generuje powiadomienie dla schroniska.
D. Przy zmianie statusu przez schronisko opcja edycji jest blokowana.

### US-008 System powiadomień transakcyjnych
Opis: Jako użytkownik lub pracownik schroniska chcę otrzymywać powiadomienia o kluczowych zdarzeniach.
Kryteria akceptacji:
A. System wysyła e-mail i notyfikację w aplikacji po rejestracji, złożeniu wniosku, zmianie statusu.
B. Log powiadomień przechowuje datę, kanał oraz status doręczenia.
C. Nieudane wysyłki są ponawiane automatycznie do trzech razy.
D. Użytkownik może zarządzać zgodami na kanały komunikacji.

### US-009 Moderacja profili psów
Opis: Jako administrator chcę ukrywać profile psów z brakującymi danymi i przypisywać zadania schronisku.
Kryteria akceptacji:
A. Administrator widzi listę profili z flagą „brak danych”.
B. Ukrycie profilu generuje zadanie dla schroniska oraz powiadomienie e-mail.
C. System loguje datę ukrycia i informację o uzupełnieniu.
D. Profil wraca do katalogu po zatwierdzeniu zmian.

### US-010 Raporty i ankiety
Opis: Jako schronisko chcę otrzymywać raporty oraz informacje zwrotne po adopcjach.
Kryteria akceptacji:
A. Raport tygodniowy wysyłany automatycznie w poniedziałek rano i dostępny w panelu.
B. Ankieta wysyłana 30 dni po adopcji, zawiera 5 pytań zamkniętych i pole komentarza.
C. Wyniki ankiet zasilają metryki dopasowania.
D. Brak odpowiedzi powoduje wysłanie przypomnienia.

### US-011 Rozszerzone bezpieczeństwo i dostępność
Opis: Jako zespół chcemy zapewnić 2FA i zgodność z WCAG 2.1 AA.
Kryteria akceptacji:
A. Pracownicy schronisk logują się z kodem TOTP.
B. Przeprowadzamy testy z osobami o specjalnych potrzebach, raportujemy wyniki.
C. Naprawiamy problemy wykryte w testach dostępności.
D. Zachowujemy log audytowy zmian w ustawieniach bezpieczeństwa.

## 6. Metryki sukcesu
### 6.1 MVP (2 tygodnie)
1. Minimum 60% zarejestrowanych użytkowników wypełnia skrócony profil stylu życia w pierwszym tygodniu od rejestracji.
2. Co najmniej 80% wniosków adopcyjnych otrzymuje zmianę statusu w panelu schroniska w ciągu 7 dni kalendarzowych.
3. 90% operacji katalogu psów kończy się sukcesem (pobranie listy, filtrowanie, szczegóły) bez błędów krytycznych.
4. Brak incydentów naruszeń danych (0 zgłoszeń RODO) w czasie realizacji MVP.

### 6.2 Po wdrożeniu rozszerzeń
- 50% wniosków zakończonych adopcją skutkuje wypełnieniem ankiety po 30 dniach.
- Średnia ocena dopasowania z ankiet użytkowników i schronisk wynosi minimum 4 w skali 1-5.
- 100% powiadomień transakcyjnych jest doręczanych w ciągu 5 minut od zdarzenia.
- Raport tygodniowy generowany i wysyłany bezbłędnie w 100% przypadków.
