# Testing Guide - Adopt Me

## Overview

Ten projekt wykorzystuje kompleksową strategię testowania składającą się z testów jednostkowych (Vitest) i testów E2E (Playwright).

## Struktura katalogów

```
tests/
├── setup/              # Pliki konfiguracyjne testów
│   └── vitest.setup.ts # Setup dla Vitest
├── helpers/            # Funkcje pomocnicze
│   └── test-utils.tsx  # Custom render i utilities
├── unit/               # Testy jednostkowe
│   ├── example.test.ts
│   └── components/     # Testy komponentów React
└── e2e/                # Testy End-to-End
    ├── pages/          # Page Object Models
    │   └── DogsPage.ts
    ├── homepage.spec.ts
    └── dogs.spec.ts
```

## Testy jednostkowe (Vitest)

### Uruchomienie testów

```bash
# Uruchom wszystkie testy jednostkowe (watch mode)
npm run test

# Uruchom testy jednostkowe jednokrotnie
npm run test:unit

# Uruchom testy w trybie watch
npm run test:watch

# Uruchom testy z UI
npm run test:ui

# Uruchom testy z pokryciem kodu
npm run test:coverage
```

### Pisanie testów jednostkowych

#### Podstawowy test funkcji

```typescript
import { describe, it, expect } from 'vitest';

describe('MyFunction', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

#### Test komponentu React

```typescript
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '../helpers/test-utils';
import { MyComponent } from '@components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    renderWithProviders(<MyComponent />);

    const element = screen.getByText('Expected Text');
    expect(element).toBeInTheDocument();
  });
});
```

#### Mockowanie funkcji

```typescript
import { vi } from 'vitest';

const mockFn = vi.fn().mockReturnValue('mocked value');
const mockAsync = vi.fn().mockResolvedValue({ data: 'mocked' });

// Spy na istniejącej funkcji
const spy = vi.spyOn(object, 'method');
```

### Best Practices

- Używaj `describe` do grupowania powiązanych testów
- Pisz opisowe nazwy testów (it should...)
- Stosuj wzorzec Arrange-Act-Assert
- Mockuj zależności zewnętrzne (API, Supabase)
- Testuj edge cases i error handling
- Używaj `beforeEach` do setupu wspólnego dla testów

## Testy E2E (Playwright)

### Uruchomienie testów E2E

```bash
# Uruchom wszystkie testy E2E
npm run test:e2e

# Uruchom testy E2E z UI
npm run test:e2e:ui

# Uruchom testy E2E w trybie debug
npm run test:e2e:debug

# Nagraj nowe testy (codegen)
npm run test:e2e:codegen
```

### Pisanie testów E2E

#### Podstawowy test

```typescript
import { test, expect } from '@playwright/test';

test('should display homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Adopt Me/);
});
```

#### Użycie Page Object Model

```typescript
import { test, expect } from '@playwright/test';
import { DogsPage } from './pages/DogsPage';

test('should search for dogs', async ({ page }) => {
  const dogsPage = new DogsPage(page);
  await dogsPage.goto();

  await dogsPage.search('Labrador');
  const dogCount = await dogsPage.getDogCount();

  expect(dogCount).toBeGreaterThan(0);
});
```

### Best Practices E2E

- Używaj Page Object Model dla złożonych interakcji
- Wybieraj elementy po rolach (`getByRole`) lub test-id
- Czekaj na ładowanie danych (`waitForLoadState`)
- Izoluj testy - każdy test niezależny
- Używaj `beforeEach` do setupu wspólnego stanu
- Testuj najważniejsze user flows
- Unikaj testowania szczegółów implementacji

## Pokrycie kodu (Coverage)

Cel: minimum 70% pokrycia dla:
- Lines
- Functions
- Branches
- Statements

```bash
npm run test:coverage
```

Raport zostanie wygenerowany w `coverage/index.html`

## CI/CD Integration

Testy są uruchamiane automatycznie w CI/CD pipeline:

1. **Pre-commit**: Linting testów przez lint-staged
2. **CI**: Wszystkie testy jednostkowe + E2E
3. **Coverage Report**: Raport pokrycia kodu

## Debugowanie testów

### Vitest

```bash
# UI mode z debugowaniem
npm run test:ui

# Debug pojedynczego testu
npm run test -- -t "test name"
```

### Playwright

```bash
# Debug mode - otwiera Playwright Inspector
npm run test:e2e:debug

# Playwright UI mode
npm run test:e2e:ui

# Zobacz trace po nieudanym teście
npx playwright show-trace test-results/.../trace.zip
```

## Przydatne narzędzia

### Vitest
- **UI Mode**: Wizualna nawigacja po testach
- **Coverage Report**: Szczegółowy raport pokrycia
- **Watch Mode**: Automatyczne uruchamianie testów przy zmianach

### Playwright
- **Codegen**: Nagrywanie testów przez interakcję z aplikacją
- **Trace Viewer**: Wizualizacja wykonania testów
- **Inspector**: Krokowe debugowanie testów
- **Screenshots**: Automatyczne screenshoty przy błędach

## Troubleshooting

### Vitest nie znajduje modułów

Sprawdź alias w `vitest.config.ts` i upewnij się, że ścieżki są prawidłowe.

### Playwright timeout

Zwiększ timeout w `playwright.config.ts`:

```typescript
timeout: 60 * 1000, // 60 sekund
```

### Testy E2E nie uruchamiają się

Upewnij się, że serwer dev jest uruchomiony lub użyj `webServer` w konfiguracji Playwright.

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

