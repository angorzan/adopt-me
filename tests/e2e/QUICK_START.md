# Quick Start - E2E Tests

Szybki przewodnik uruchomienia testów e2e dla Adopt-Me.

## ⚡ TL;DR - Minimalny setup

```bash
# 1. Skopiuj template
cp .env.test.example .env.test

# 2. Wypełnij .env.test danymi testowej bazy Supabase
# (szczegóły w TEST_DATABASE_SETUP.md)

# 3. Uruchom testy
npm run test:e2e
```

## ✅ Checklist przed pierwszym uruchomieniem

- [ ] Masz oddzielny projekt Supabase dla testów
- [ ] Plik `.env.test` istnieje i ma wszystkie zmienne:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_PUBLIC_KEY`
  - [ ] `E2E_USERNAME`
  - [ ] `E2E_PASSWORD`
  - [ ] `E2E_USERNAME_ID`
- [ ] Użytkownik E2E istnieje w testowej bazie
- [ ] Email użytkownika E2E jest potwierdzony
- [ ] Testowa baza ma strukturę tabel (migracje zaaplikowane)
- [ ] Testowa baza ma kilka psów do adopcji

## 🚀 Uruchomienie

### Wszystkie testy
```bash
npm run test:e2e
```

### Tylko adoption flow
```bash
npx playwright test adoption-flow
```

### W trybie interaktywnym
```bash
npx playwright test --ui
```

### Z przeglądarką (headed mode)
```bash
npx playwright test --headed
```

## 📊 Sprawdzenie wyników

Po zakończeniu testów:

```bash
# Otwórz raport HTML
npx playwright show-report
```

Lub ręcznie otwórz: `playwright-report/index.html`

## ❌ Jeśli coś nie działa

### Test: "E2E test user credentials not found"

```bash
# Sprawdź czy .env.test istnieje i ma dane
cat .env.test

# Jeśli nie, skopiuj template
cp .env.test.example .env.test
# I wypełnij danymi
```

### Test: "Quick login failed: 401"

Użytkownik nie istnieje lub email nie jest potwierdzony.

```bash
# Sprawdź w Supabase Dashboard:
# Authentication > Users
# Znajdź użytkownika o emailu z E2E_USERNAME
# Upewnij się że "Email confirmed" = ✅
```

### Test: "No dogs available in catalog"

Testowa baza nie ma psów.

```sql
-- Dodaj przykładowego psa przez SQL Editor w Supabase:
INSERT INTO dogs (name, breed, age_years, size, gender, temperament, shelter_id, available)
VALUES ('Rex', 'Labrador', 3, 'large', 'male', 'Przyjazny', (SELECT id FROM shelters LIMIT 1), true);
```

## 📚 Więcej informacji

- **Pełny przewodnik**: [TEST_DATABASE_SETUP.md](./TEST_DATABASE_SETUP.md)
- **Dokumentacja testów**: [README.md](./README.md)
- **Drzewo komponentów**: [component-tree.md](./component-tree.md)

## 🆘 Nadal nie działa?

1. Sprawdź logi w terminalu
2. Otwórz trace: `npx playwright show-trace test-results/.../trace.zip`
3. Sprawdź screenshots w `test-results/`
4. Przeczytaj sekcję Troubleshooting w [README.md](./README.md#troubleshooting)

## 💡 Tips

- Używaj `--headed` żeby zobaczyć co dzieje się w przeglądarce
- Używaj `--debug` żeby krokować przez testy
- Używaj `--grep` żeby uruchomić konkretny test:
  ```bash
  npx playwright test --grep "authenticated user can submit"
  ```
- Sprawdzaj `playwright-report/` dla szczegółowych wyników

---

**Gotowe!** Jeśli checklist jest uzupełniony, testy powinny działać bez problemów. 🎉
