Jesteś doświadczonym menedżerem produktu, którego zadaniem jest stworzenie kompleksowego dokumentu wymagań produktu (PRD) w oparciu o poniższe opisy:

<project_description>
AdoptMe to aplikacja webowa wspierająca adopcję psów ze schronisk. Umożliwia użytkownikom przeglądanie dostępnych psów, filtrowanie ich według preferencji oraz składanie wniosków adopcyjnych. Kluczowym elementem aplikacji jest moduł AI, który analizuje styl życia użytkownika (np. aktywność, miejsce zamieszkania, doświadczenie z psami) i rekomenduje najlepiej dopasowanego psa. Projekt ma charakter społeczny i edukacyjny – ma ułatwiać adopcję, zwiększać świadomość oraz poprawiać trafność dopasowań.
</project_description>

<project_details>
<conversation_summary>
<decisions>
1. Ankieta po adopcji będzie składała się z 5 pytań zamkniętych oraz pola na komentarz i zostanie wysłana automatycznie 30 dni po adopcji.
2. Schroniska uzupełnią obowiązkowe pola (wiek, temperament, zdrowie) w formularzu z walidacją.
3. Dane o stylu życia użytkownika pozostaną samodeklarowane, przy czym kluczowe pola mogą wymagać dokumentu potwierdzającego lub kontaktu ze schroniskiem.
4. Schroniska odpowiadają za weryfikację wniosków adopcyjnych z ustalonym SLA wynoszącym 5 dni roboczych.
5. Komunikacja z użytkownikami będzie prowadzona przez e‑mail i panel w aplikacji, a zgody RODO zostaną zebrane podczas rejestracji.
6. Użytkownicy mogą edytować profil stylu życia; zmiany będą wersjonowane i logowane.
7. Schroniska otrzymają tygodniowe raporty (lista wniosków, adopcje zakończone, ocena dopasowania).
8. W przypadku braków danych karty psów będą ukrywane, zgłaszane zespołowi i możliwe będzie ręczne uzupełnienie.
9. Interfejs będzie zgodny z WCAG 2.1 AA i zostanie przetestowany z dwoma osobami o specjalnych potrzebach.
10. Harmonogram MVP obejmuje: tydzień 2 – katalog psów, tydzień 4 – formularz adopcyjny, tydzień 6 – adopcje pilotowe, z 15% buforem czasowym.

</decisions>

<matched_recommendations>
1. Ustrukturyzowanie ankiety feedbackowej (5 pytań + komentarz, automatyczna wysyłka po 30 dniach).
2. Definicja obowiązkowych pól danych psów z walidacją w formularzu schronisk.
3. Rozróżnienie pól samodeklarowanych i krytycznych wymaganych do weryfikacji.
4. Przypisanie odpowiedzialności RACI: schroniska obsługują wnioski adopcyjne z SLA 5 dni.
5. Zaplanowanie strategii powiadomień wraz ze zgodami RODO.
6. Wersjonowanie profilu użytkownika i log zmian dla wpływu na rekomendacje.
7. Zestaw raportów operacyjnych generowanych cyklicznie dla partnerów.
8. Procedury awaryjne przy brakach danych (ukrycie karty, alert, ręczne uzupełnienie).
9. Minimalne wymagania dostępności i testy z grupą o specjalnych potrzebach.
10. Harmonogram kamieni milowych z buforem czasowym.

</matched_recommendations>

<prd_planning_summary>
- **Główne wymagania funkcjonalne**: katalog psów z obowiązkowymi danymi walidowanymi przez formularz; profile użytkowników z wersjonowanymi danymi stylu życia; proces składania i obsługi wniosków adopcyjnych przez schroniska; moduł powiadomień (email + panel); raporty tygodniowe dla schronisk; ankieta oceny dopasowania wysyłana po 30 dniach; fallback na ręczne dane, gdy schroniska nie dostarczą informacji.
- **Historie użytkownika i ścieżki**: nowy użytkownik rejestruje konto, akceptuje zgody, uzupełnia profil stylu życia, przegląda katalog (lub otrzymuje rekomendacje w kolejnej iteracji), wybiera psa, składa wniosek i może go edytować/anulować. Schronisko przegląda wnioski, weryfikuje je w ciągu 5 dni, potwierdza adopcje oraz tygodniowo monitoruje raporty i oceny dopasowania.
- **Kryteria sukcesu i pomiar**: liczba złożonych wniosków adopcyjnych; liczba zakończonych adopcji potwierdzonych przez schronisko; ocena trafności rekomendacji (ankieta użytkownika + ocena schroniska); SLA odpowiedzi schroniska (≤5 dni). Dane zbierane poprzez formularze, logi wersji profili oraz moduł feedbacku.
- **Plan realizacji**: MVP realizowane w 6 tygodniach – tydzień 2 katalog, tydzień 4 formularz adopcyjny, tydzień 6 adopcje pilotowe, z 15% buforem. Wersjonowanie profili i logowanie zmian umożliwią analizę wpływu danych na rekomendacje w kolejnych iteracjach.

</prd_planning_summary>

<unresolved_issues>
Brak.

</unresolved_issues>
</conversation_summary>
</project_details>

Wykonaj następujące kroki, aby stworzyć kompleksowy i dobrze zorganizowany dokument:

1. Podziel PRD na następujące sekcje:
   a. Przegląd projektu
   b. Problem użytkownika
   c. Wymagania funkcjonalne
   d. Granice projektu
   e. Historie użytkownika
   f. Metryki sukcesu

2. W każdej sekcji należy podać szczegółowe i istotne informacje w oparciu o opis projektu i odpowiedzi na pytania wyjaśniające. Upewnij się, że:
   - Używasz jasnego i zwięzłego języka
   - W razie potrzeby podajesz konkretne szczegóły i dane
   - Zachowujesz spójność w całym dokumencie
   - Odnosisz się do wszystkich punktów wymienionych w każdej sekcji

3. Podczas tworzenia historyjek użytkownika i kryteriów akceptacji
   - Wymień WSZYSTKIE niezbędne historyjki użytkownika, w tym scenariusze podstawowe, alternatywne i skrajne.
   - Przypisz unikalny identyfikator wymagań (np. US-001) do każdej historyjki użytkownika w celu bezpośredniej identyfikowalności.
   - Uwzględnij co najmniej jedną historię użytkownika specjalnie dla bezpiecznego dostępu lub uwierzytelniania, jeśli aplikacja wymaga identyfikacji użytkownika lub ograniczeń dostępu.
   - Upewnij się, że żadna potencjalna interakcja użytkownika nie została pominięta.
   - Upewnij się, że każda historia użytkownika jest testowalna.

Użyj następującej struktury dla każdej historii użytkownika:
- ID
- Tytuł
- Opis
- Kryteria akceptacji

4. Po ukończeniu PRD przejrzyj go pod kątem tej listy kontrolnej:
   - Czy każdą historię użytkownika można przetestować?
   - Czy kryteria akceptacji są jasne i konkretne?
   - Czy mamy wystarczająco dużo historyjek użytkownika, aby zbudować w pełni funkcjonalną aplikację?
   - Czy uwzględniliśmy wymagania dotyczące uwierzytelniania i autoryzacji (jeśli dotyczy)?

5. Formatowanie PRD:
   - Zachowaj spójne formatowanie i numerację.
   - Nie używaj pogrubionego formatowania w markdown ( ** ).
   - Wymień WSZYSTKIE historyjki użytkownika.
   - Sformatuj PRD w poprawnym markdown.

Przygotuj PRD z następującą strukturą:

```markdown
# Dokument wymagań produktu (PRD) - {{app-name}}
## 1. Przegląd produktu
## 2. Problem użytkownika
## 3. Wymagania funkcjonalne
## 4. Granice produktu
## 5. Historyjki użytkowników
## 6. Metryki sukcesu
```

Pamiętaj, aby wypełnić każdą sekcję szczegółowymi, istotnymi informacjami w oparciu o opis projektu i nasze pytania wyjaśniające. Upewnij się, że PRD jest wyczerpujący, jasny i zawiera wszystkie istotne informacje potrzebne do dalszej pracy nad produktem.

Ostateczny wynik powinien składać się wyłącznie z PRD zgodnego ze wskazanym formatem w markdown, który zapiszesz w pliku .ai/prd.md