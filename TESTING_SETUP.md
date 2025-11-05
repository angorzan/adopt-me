# Środowisko testowe - Adopt Me

## ✅ Instalacja zakończona

Środowisko testowe zostało w pełni skonfigurowane zgodnie ze stosem technologicznym projektu.

## 📦 Zainstalowane zależności

### Testy jednostkowe (Vitest)
- `vitest` - Framework testowy
- `jsdom` / `happy-dom` - Środowisko DOM
- `@testing-library/react` - Testy komponentów React
- `@testing-library/user-event` - Symulacja interakcji użytkownika
- `@testing-library/jest-dom` - Dodatkowe matchery dla DOM
- `@vitest/ui` - Interfejs graficzny dla testów
- `@vitest/coverage-v8` - Raportowanie pokrycia kodu
- `@vitejs/plugin-react` - Plugin React dla Vite

### Testy E2E (Playwright)
- `@playwright/test` - Framework testów E2E
- Chromium (przeglądarka) - zgodnie z wytycznymi

## 📁 Struktura katalogów

```
tests/
├── setup/
│   ├── vitest.setup.ts       # Setup dla Vitest (globals, mocks)
│   └── vitest.d.ts            # Definicje typów TypeScript
├── helpers/
│   └── test-utils.tsx         # Utilities (renderWithProviders, mocks)
├── unit/
│   ├── example.test.ts        # Przykładowe testy funkcji
│   └── components/
│       └── Button.test.tsx    # Przykładowy test komponentu
└── e2e/
    ├── pages/
    │   └── DogsPage.ts        # Page Object Model
    ├── homepage.spec.ts       # Testy strony głównej
    └── dogs.spec.ts           # Testy listy psów
```

## ⚙️ Konfiguracja

### vitest.config.ts
- ✅ Środowisko: `jsdom`
- ✅ Coverage provider: `v8`
- ✅ Setup files konfiguracja
- ✅ Globals enabled
- ✅ Thresholds pokrycia: 70%
- ✅ Aliasy ścieżek (@, @components, @lib, @types)

### playwright.config.ts
- ✅ Tylko Chromium/Desktop Chrome
- ✅ Parallel execution
- ✅ Retry on CI
- ✅ Trace on retry
- ✅ Screenshot/video on failure
- ✅ Auto-start dev server

### tsconfig.json
- ✅ Dodane types: `vitest/globals`, `@testing-library/jest-dom`
- ✅ Include: `tests/`

## 🚀 Dostępne komendy

### Testy jednostkowe
```bash
npm test                  # Watch mode (development)
npm run test:unit         # Uruchom raz
npm run test:watch        # Watch mode (explicit)
npm run test:ui           # Interfejs graficzny
npm run test:coverage     # Z raportem pokrycia kodu
```

### Testy E2E
```bash
npm run test:e2e          # Uruchom testy E2E
npm run test:e2e:ui       # Playwright UI mode
npm run test:e2e:debug    # Debug mode
npm run test:e2e:codegen  # Nagraj nowe testy
```

### Wszystkie testy
```bash
npm run test:all          # Unit + E2E
```

## ✅ Weryfikacja instalacji

Testy jednostkowe zostały uruchomione i **wszystkie przeszły pomyślnie**:

```
✓ tests/unit/example.test.ts (9 tests)
✓ tests/unit/components/Button.test.tsx (6 tests)

Test Files  2 passed (2)
Tests       15 passed (15)
```

## 📚 Przykładowe testy

### 1. Test funkcji (example.test.ts)
- Formatowanie nazwy psa
- Testowanie funkcji asynchronicznych
- Mockowanie z `vi.fn()`
- Inline snapshots
- Edge cases i error handling

### 2. Test komponentu React (Button.test.tsx)
- Rendering komponentu
- Interakcje użytkownika (click)
- Stany komponentu (disabled)
- CSS classes
- Accessibility attributes
- Custom render z providers

### 3. Testy E2E (homepage.spec.ts, dogs.spec.ts)
- Nawigacja
- Responsive design
- Visual regression (screenshots)
- API integration
- Page Object Model

## 🎯 Best Practices zaimplementowane

### Vitest
- ✅ Setup files dla konfiguracji globalnej
- ✅ Custom render z providers (QueryClient)
- ✅ Mock utilities dla Supabase
- ✅ Type-safe mocks
- ✅ Coverage thresholds

### Playwright
- ✅ Page Object Model dla maintainability
- ✅ Resilient locators (getByRole, getByTestId)
- ✅ Automatic wait strategies
- ✅ Visual comparison setup
- ✅ Trace viewer dla debugowania

## 📖 Dokumentacja

Szczegółowa dokumentacja testowania znajduje się w `tests/README.md`:
- Jak pisać testy jednostkowe
- Jak pisać testy E2E
- Page Object Model patterns
- Debugging tips
- Best practices

## 🔧 Konfiguracja IDE

### VSCode (zalecane rozszerzenia)
- Vitest Extension
- Playwright Test for VSCode

## 🚨 Uwagi

1. **Środowisko**: Testy uruchamiają się w `jsdom` (Vitest) i Chromium (Playwright)
2. **Coverage**: Cel to minimum 70% dla lines/functions/branches/statements
3. **CI/CD**: Konfiguracja gotowa dla GitHub Actions
4. **Parallel**: Testy E2E działają równolegle dla szybszego wykonania
5. **.gitignore**: Dodane wpisy dla artifacts testowych

## 🎉 Gotowe do użycia!

Środowisko testowe jest w pełni skonfigurowane i zweryfikowane. Możesz:

1. Uruchomić `npm test` aby rozpocząć pisanie testów w watch mode
2. Uruchomić `npm run test:e2e:codegen` aby nagrać nowe testy E2E
3. Przeczytać `tests/README.md` dla szczegółowych instrukcji

Happy Testing! 🧪

