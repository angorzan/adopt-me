### Analiza dopasowania stosu technologicznego

| Kryterium | Ocena | Uzasadnienie | Ryzyka / Rekomendacje |
|-----------|-------|--------------|-----------------------|
| 1. Szybkie dostarczenie MVP | Tak | • Astro 5 + React 19 umożliwia szybkie prototypowanie UI przy minimalnym JS.<br>• Supabase dostarcza gotowy backend (DB, auth, API) bez kodowania serwera.<br>• Tailwind + shadcn/ui przyspieszają implementację UI. | • Zespół musi opanować Astro, jeśli pracował głównie z Next.js. |
| 2. Skalowalność | Umiarkowana | • PostgreSQL w Supabase skaluje się wertykalnie i horyzontalnie (read-replicas).<br>• Astro generuje statyczne strony; React działa wyspowo, co obniża koszty renderu.<br>• Supabase Functions Edge umożliwiają rozszerzenia bez własnej infrastruktury. | • Przy dużym ruchu konieczne będzie skalowanie bazy – wyższy koszt.<br>• Koszty zapytań do modeli AI mogą rosnąć – należy cache'ować rekomendacje. |
| 3. Koszty utrzymania | Niskie → Średnie | • Komponenty open-source (brak licencji).<br>• Supabase free tier wystarczy na MVP; płatności rosną proporcjonalnie do użycia.<br>• DigitalOcean oferuje elastyczne plany i własne klastry Docker. | • Koszty Openrouter rosną wraz z liczbą zapytań AI i klasą modelu. |
| 4. Złożoność rozwiązania | Adekwatna | • Astro uproszcza SSR/CSR – większość stron statycznych.<br>• Supabase minimalizuje kod backendu.<br>• CI/CD w GitHub Actions jest proste. | • shadcn/ui zwiększa bundle; konieczne tree-shaking i lazy-load komponentów. |
| 5. Prostszą alternatywą | Częściowo | • Next.js + Supabase (jeden framework) lub nawet Supabase Studio + vanilla HTML dla POC.<br>• Firebase prostszy, ale gorszy dla złożonych raportów SQL. | • Rozważyć start od low-code Supabase + Minimal UI, refaktor gdy będzie feedback. |
| 6. Bezpieczeństwo | Tak | • Supabase oferuje RLS, RBAC, 2FA – spełnia US-012.<br>• GitHub Actions i DO umożliwiają skanowanie zależności.<br>• Astro/React pozwala łatwo kontrolować XSS. | • Włączyć RLS dla tabel wniosków/ankiet.<br>• Audyt lokalizacji danych i retencji dla RODO. |
| 7. Testowalność | Tak | • Vitest zapewnia szybkie testy jednostkowe i integracyjne.<br>• React Testing Library umożliwia testowanie komponentów.<br>• Playwright oferuje kompleksowe testy E2E.<br>• TypeScript i ESLint wspierają jakość kodu. | • Konieczne utrzymanie minimum 70% code coverage.<br>• Testy E2E mogą być wolniejsze – optymalizacja CI/CD. |

### Technologie testowe

| Typ testów | Narzędzie | Zastosowanie |
|-----------|----------|--------------|
| **Testy jednostkowe** | Vitest | Testowanie komponentów React, walidatorów, utility functions |
| **Testy komponentów** | React Testing Library | Testowanie interakcji użytkownika z komponentami UI |
| **Testy integracyjne** | Vitest + Supertest | Testowanie endpointów API z integracją Supabase |
| **Testy E2E** | Playwright | Kompleksowe scenariusze użytkownika, nawigacja, responsywność |
| **Code coverage** | c8 / Vitest coverage | Raportowanie pokrycia kodu testami (cel: 70%+) |
| **Type checking** | TypeScript | Statyczna analiza typów |
| **Linting** | ESLint | Analiza jakości kodu i wykrywanie błędów |

**Wniosek:** Stos spełnia wymagania MVP i jest wystarczająco skalowalny na pierwsze iteracje. Należy monitorować koszty AI (Openrouter) i wydajność bazy. Przy szybkim wzroście warto rozważyć własny hosting Supabase lub klasyczny backend oraz CDN dla obrazów. Kompleksowa strategia testowania zapewnia wysoką jakość i niezawodność aplikacji.
