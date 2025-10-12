# Dokument wymagań produktu (PRD) - AdoptMe
## 1. Przegląd produktu
AdoptMe to aplikacja webowa wspierająca adopcję psów w Polsce. Użytkownicy rejestrują konto, opisują swój styl życia i składają wnioski adopcyjne. Schroniska zarządzają katalogiem psów, przeglądają napływające wnioski oraz potwierdzają adopcje. System dba o transparentność procesu, wspiera komunikację i edukuje w temacie odpowiedzialnej adopcji. Aplikacja jest zgodna z RODO, obsługuje użytkowników końcowych i pracowników schronisk oraz gromadzi dane do raportów.

## 2. Problem użytkownika
Osoby chcące adoptować psa mają problem ze znalezieniem zwierzęcia do swojego stylu życia, brakuje im kompletnych informacji o psach i ich potrzebach. Schroniska toną w wnioskach przesyłanych różnymi kanałami, odpowiadają po długim czasie lub gubią zgłoszenia. Przygotowanie użytkownika do adopcji i zbudowanie relacji z konkretnym schroniskiem jest czasochłonne. AdoptMe rozwiązuje te problemy, dostarczając sprawny katalog, ustrukturyzowany formularz wniosków i moduł edukacyjny.

## 3. Wymagania funkcjonalne
1. Rejestracja i logowanie użytkowników z wymaganą akceptacją zgód RODO.
2. Profil stylu życia z możliwością edycji, wersjonowaniem danych i logowaniem zmian (typ mieszkania, liczba domowników, aktywność, doświadczenie z psami).
3. Przejrzysty katalog psów dodawany przez schroniska, z obowiązkowymi polami: zdjecie, wiek, temperament, wymagania zdrowotne, status adopcji.
4. Filtrowanie i wyszukiwanie psów według podstawowych kryteriów (lokalizacja schroniska, wielkość psa, wiek).
5. Stworzenie wniosku adopcyjnego powiązanego z użytkownikiem i konkretnym psem (zbieranie danych personalnych, powodów adopcji, załączników).
6. Panel schroniska z listą wniosków, możliwością zaakceptowania, odrzucenia lub przesunięcia na później, przy SLA maksymalnie 5 dni roboczych.
7. System powiadomień w aplikacji oraz e-mail z szablonami (przyjęcie wniosku, decyzja schroniska, przypomnienie o ankiecie).
8. Raporty tygodniowe dla schronisk (wnioski w toku, adopcje zakończone, średnia ocena dopasowania).
9. Automatyczna ankieta po 30 dniach od adopcji (5 pytań zamkniętych + komentarz) wysyłana użytkownikowi oraz formularz oceny dopasowania dla schroniska.
10. Mechanizm fallback: ukrycie karty psa przy brakach danych, log powiadomień do zespołu oraz opcja ręcznego uzupełnienia informacji.

## 4. Granice produktu
- Brak modułu płatności i darowizn.
- Brak wsparcia dla adopcji innych zwierząt (koty, małe zwierzęta).
- Brak automatycznych integracji z zewnętrznymi bazami danych schronisk (import planowany w kolejnej iteracji).
- Moduł AI do rekomendacji psów dostępny dopiero po MVP.
- Brak natywnej aplikacji mobilnej; responsywność webu jest wymagana.
- Brak obsługi czatu na żywo pomiędzy użytkownikami a schroniskami (tylko notyfikacje i statusy).
- Brak rozliczeń za usługi; adopcje traktowane są jako proces społeczny.

Zakres poza MVP (planowane na kolejne iteracje):
- Moduł rekomendacji AI analizujący dane stylu życia użytkownika i proponujący psy.
- Automatyczne importy danych ze schronisk (API, CSV) oraz integracje z zewnętrznymi rejestrami.
- Funkcje społecznościowe (udostępnianie wniosków, opinie publiczne, budowanie społeczności).
- Powiadomienia SMS/push i natywna aplikacja mobilna.
- Rozszerzenie adopcji na inne gatunki zwierząt oraz dodatkowe procesy (domy tymczasowe, wolontariat).


## 5. Historyjki użytkowników
### US-001 Rejestracja konta
Opis: Jako osoba chcąca adoptować psa chcę założyć konto i zaakceptować zgody, aby móc korzystać z systemu.
Kryteria akceptacji:
A. Formularz rejestracji zbiera e-mail, hasło, imię i nazwisko, zgody RODO, zgody na powiadomienia.
B. Email weryfikacyjny wysyłany automatycznie, konto aktywne dopiero po potwierdzeniu.
C. Błędne dane wyświetlają komunikat walidacyjny.
D. Login wymaga wcześniejszej weryfikacji e-mail.

### US-002 Logowanie i reset hasła
Opis: Jako zarejestrowany użytkownik chcę się zalogować i móc zresetować hasło.
Kryteria akceptacji:
A. Formularz loginu przyjmuje e-mail i hasło, weryfikuje dane z bazą.
B. Link „Nie pamiętam hasła” wysyła jednorazowe hasło resetujące ważne 60 minut.
C. Po trzech nieudanych próbach konto blokuje się na 15 minut.
D. Zalogowany użytkownik jest przekierowany do dashboardu.

### US-003 Uzupełnienie profilu stylu życia
Opis: Jako użytkownik chcę podać informacje o stylu życia, aby system lepiej dopasował psa.
Kryteria akceptacji:
A. Formularz zawiera pola: typ mieszkania, metraż, liczba domowników, dzieci, godziny pracy, aktywność fizyczna, doświadczenie z psami, inne zwierzęta.
B. Wypełnienie wszystkich obowiązkowych pól jest wymagane.
C. Dane są wersjonowane i logowane; historia jest dostępna dla schroniska.
D. Przy zmianie krytycznych pól system prosi o potwierdzenie dokumentem lub kontakt telefoniczny (flaga do obsługi manualnej).

### US-004 Przeglądanie katalogu psów
Opis: Jako użytkownik chcę przeglądać psy i filtrować je według kryteriów.
Kryteria akceptacji:
A. Lista psów wyświetla nazwę, zdjęcie, wiek, temperament, lokalizację schroniska i status adopcji.
B. Filtrowanie według wieku, wielkości, województwa, temperamentów i statusu.
C. Kliknięcie karty psa otwiera szczegółowy profil (historia, zdrowie, wymagania).
D. Psy bez pełnych danych są ukryte z informacją o braku danych.

### US-005 Złożenie wniosku adopcyjnego
Opis: Jako użytkownik chcę złożyć wniosek adopcyjny dla wybranego psa.
Kryteria akceptacji:
A. Wniosek powiązany jest z kontem użytkownika i identyfikatorem psa.
B. Formularz zawiera pytania o powód adopcji, przygotowanie na zwierzę, preferowany kontakt, możliwe załączniki (PDF, JPG).
C. Po wysłaniu wniosku użytkownik dostaje potwierdzenie e-mail i status „Oczekuje”.
D. Wniosek trafia do panelu schroniska i rozpoczyna się odliczanie SLA 5 dni.

### US-006 Edycja lub anulowanie wniosku
Opis: Jako użytkownik chcę edytować lub anulować wniosek, dopóki nie został rozpatrzony.
Kryteria akceptacji:
A. Wnioski z statusem „Oczekuje” można edytować lub anulować.
B. Edycje zapisywane są w historii wniosku, schronisko widzi ostatnią wersję.
C. Anulowanie zmienia status na „Anulowany przez użytkownika”, system wysyła powiadomienie do schroniska.
D. Po podjęciu decyzji przez schronisko edycja/anulowanie nie jest możliwe.

### US-007 Panel schroniska i obsługa wniosków
Opis: Jako pracownik schroniska chcę widzieć listę wniosków i je rozpatrywać.
Kryteria akceptacji:
A. Panel pokazuje wnioski „Nowe”, „W toku”, „Do kontaktu”, „Zakończone”, „Odrzucone”.
B. Wniosek zawiera pełne dane użytkownika, historię zmian profilu, notatki.
C. Pracownik może oznaczyć status (zaakceptowany, odrzucony, potrzebny kontakt) z komentarzem.
D. System monitoruje SLA – po 4 dniach wysyła przypomnienie; po 5 dniach powiadamia administratora.

### US-008 Generowanie raportów
Opis: Jako schronisko chcę otrzymywać raport tygodniowy.
Kryteria akceptacji:
A. Raport generowany co poniedziałek o 09:00 i wysyłany na e-mail schroniska oraz dostępny w panelu.
B. Zawiera liczbę nowych wniosków, wniosków w toku, adopcji zakończonych, średnią ocenę dopasowania z ankiet.
C. Można pobrać raport w PDF i CSV.
D. Raport oznaczony jest identyfikatorem tygodnia i przechowywany min. 12 miesięcy.

### US-009 Ankieta po adopcji
Opis: Jako użytkownik chcę otrzymać ankietę oceny dopasowania 30 dni po adopcji.
Kryteria akceptacji:
A. System wysyła e-mail z linkiem do ankiety, powiązanej z wnioskiem.
B. Ankieta zawiera 5 pytań zamkniętych (skala 1-5) i pole komentarza.
C. Wypełnienie ankiety aktualizuje ocenę dopasowania w raporcie.
D. Brak odpowiedzi w ciągu 7 dni powoduje wysłanie przypomnienia.

### US-010 Dostępność i testy UX
Opis: Jako produkt chcę, aby interfejs był dostępny dla osób z niepełnosprawnościami.
Kryteria akceptacji:
A. Aplikacja spełnia WCAG 2.1 AA (kontrast, nawigacja klawiaturą, tekst alternatywny).
B. Zespół przeprowadza testy z co najmniej dwiema osobami o specjalnych potrzebach.
C. Raport z testów dokumentuje znalezione problemy i działania naprawcze.
D. Zmiany dostępnościowe przechodzą test regresji.

### US-011 Moderacja profili psów
Opis: Jako administrator chcę móc czasowo ukryć profil psa, gdy brakuje danych.
Kryteria akceptacji:
A. Administrator widzi listę profili z flagą „brak danych”.
B. Może ukryć profil i przypisać zadanie pracownikowi schroniska.
C. System loguje datę ukrycia i powiadamia schronisko e-mailem.
D. Po uzupełnieniu danych profil automatycznie wraca do katalogu po zatwierdzeniu.

### US-012 Bezpieczny dostęp dla schronisk
Opis: Jako pracownik schroniska chcę logować się do panelu z uwierzytelnieniem dwuskładnikowym.
Kryteria akceptacji:
A. Logowanie wymaga e-maila, hasła i kodu z aplikacji TOTP.
B. Pierwsze logowanie po włączeniu 2FA wymaga skonfigurowania aplikacji i zapisania kodów zapasowych.
C. Brak poprawnego kodu uniemożliwia dostęp i generuje alert bezpieczeństwa po trzech próbach.
D. Administrator może resetować 2FA po weryfikacji tożsamości.

## 6. Metryki sukcesu
1. Minimum 60% zarejestrowanych użytkowników wypełnia pełny profil stylu życia w pierwszych dwóch tygodniach od rejestracji.
2. Co najmniej 70% wniosków adopcyjnych otrzymuje decyzję w wymaganym SLA 5 dni roboczych.
3. 50% wniosków zakończonych adopcją skutkuje wypełnieniem ankiety po 30 dniach.
4. Średnia ocena dopasowania z ankiet użytkowników i schronisk wynosi minimum 4 w skali 1-5.
5. Brak istotnych naruszeń RODO (0 incydentów zgłoszonych do organu nadzoru) w ciągu pierwszych 12 miesięcy.
