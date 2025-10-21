<conversation_summary>
<decisions>
1. Utrzymujemy jedną tabelę `users` z kolumną `role` (enum/Check), domyślnie przypisywaną przy rejestracji.
2. Pole `shelter_id` obowiązuje wyłącznie dla roli `shelter_staff`, co wiąże personel z jednym schroniskiem.
3. `dogs.temperament` będzie pojedynczym polem tekstowym; format zostanie ujednolicony w aplikacji.
4. Statusy psów oraz wniosków adopcyjnych wykorzystają enum/Check z domyślnymi wartościami (`available`, `new`).
5. Wnioski adopcyjne używają statusów `new`, `in_progress`, `accepted`, `rejected`; pozostałe ustawienia jak rekomendowano.
6. Odpowiedzi ankiety AI przechowujemy w kolumnie `JSONB` (snapshot odpowiedzi + profil).
7. Pytania ankietowe pozostają zakodowane w aplikacji (brak tabeli metadanych).
8. Lokalizacja schroniska przechowywana w tabeli `shelters`; `dogs` łączy się kluczem obcym.
9. Włączamy minimalne reguły RLS: `adopter` widzi własne wnioski, `shelter_staff` dane związane z przypisanym schroniskiem.
10. Wszystkie główne tabele otrzymują kolumny `created_at`/`updated_at` z domyślnym `now()`.

</decisions>

<matched_recommendations>
1. Spójna lista ról i wykorzystanie enum/Check w `users.role`.
2. Relacja między personelem a schroniskami przez klucz obcy `shelter_id`.
3. Utrzymanie temperamentów jako jednego pola tekstowego z umownym formatem.
4. Standaryzacja statusów psów i wniosków poprzez enum/Check z wartościami domyślnymi.
5. Logowanie rekomendacji AI w tabeli `ai_recommendations` z `JSONB` i metadanymi.
6. `lifestyle_profiles` z ograniczeniem `UNIQUE(user_id)` i kompletem wymaganych pól.
7. Indeksy dla katalogu psów (rozmiar, kategoria wieku, miasto) i statusów wniosków.
8. Minimalne polityki RLS ograniczające widoczność danych użytkowników.
9. Dodanie znaczników czasu (`created_at`, `updated_at`) dla audytu i sortowania.

</matched_recommendations>

<database_planning_summary>
Schemat MVP obejmie tabele: `users` (rola jako enum; opcjonalny `shelter_id` dla personelu), `shelters` (dane adresowe, miasto), `dogs` (podstawowe atrybuty, tekstowy temperament, status, FK do schroniska, kolumny czasowe), `lifestyle_profiles` (pojedynczy rekord na użytkownika, wymagane pola stylu życia), `adoption_applications` (FK do użytkownika i psa, status enum, komentarz personelu, znacznik czasu), `ai_recommendations` (FK do użytkownika i psa, `JSONB` z odpowiedziami ankiety i snapshotem profilu, prompt/response metadane). Relacje: użytkownik ←1:1→ profil stylu życia, schronisko ←1:N→ psy oraz ←1:N→ personel, pies ←1:N→ wnioski, użytkownik ←1:N→ wnioski i rekomendacje. Indeksy zostaną dodane na `dogs(size)`, `dogs(age_category)`, `shelters(city)` oraz `adoption_applications(dog_id, status)`; możliwa kolumna `age_category` obliczana przy zapisie lub triggerem. RLS zapewni, że adoptujący widzą tylko własne wnioski, a personel – wnioski związane z ich schroniskiem; reszta danych pozostaje publiczna w ramach MVP. Skalowalność jest wtórna (brak historii, brak dodatkowych tabel), lecz kolumny czasowe i struktura JSONB umożliwią późniejsze rozszerzenia. Projekt spełnia wymaganie prostoty (tydzień pracy) przy zachowaniu minimalnej kontrolowanej prywatności i audytu.

</database_planning_summary>

<unresolved_issues>
Brak.

</unresolved_issues>
</conversation_summary>