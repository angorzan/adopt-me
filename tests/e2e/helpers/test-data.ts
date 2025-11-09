/**
 * Test Data Helpers
 *
 * Provides sample data for testing
 */

/**
 * Sample adoption form data for valid submissions
 */
export const validAdoptionData = {
  short: {
    motivation: "Uwielbiam psy i chcę adoptować tego psa, ponieważ wydaje się idealny dla mojej rodziny.",
    contactPreference: "email" as const,
  },
  withNotes: {
    motivation:
      "Mam duże doświadczenie w opiece nad psami. Posiadam dom z ogrodem i dużo czasu na spacery. Szukam wiernego towarzysza.",
    contactPreference: "phone" as const,
    extraNotes:
      "Mieszkam w domu z ogrodem. Pracuję zdalnie, więc mogę poświęcić psu dużo czasu. Mam doświadczenie z psami ras większych.",
  },
  long: {
    motivation:
      "Od zawsze marzyłem o psie. Mam stabilną sytuację życiową, własny dom z ogrodem i regularny rozkład dnia. " +
      "Szukam kompana do wspólnych przygód i spacerów. Jestem gotowy zapewnić pełną opiekę weterynaryjną i wiele miłości.",
    contactPreference: "email" as const,
    extraNotes:
      "Pracuję z domu, więc pies nie będzie sam. Mam doświadczenie z psami adopcyjnymi. " +
      "Regularnie jeżdżę na wycieczki górskie, więc pies będzie miał dużo ruchu. " +
      "Jestem przygotowany na koszty związane z opieką weterynaryjną i karmieniem.",
  },
};

/**
 * Invalid adoption form data for validation tests
 */
export const invalidAdoptionData = {
  tooShort: {
    motivation: "Chcę psa",
    contactPreference: "email" as const,
  },
  noConsent: {
    motivation: "Uwielbiam psy i chcę adoptować tego psa, ponieważ wydaje się idealny dla mojej rodziny.",
    contactPreference: "email" as const,
    skipConsent: true,
  },
  empty: {
    motivation: "",
    contactPreference: "" as unknown,
  },
};

/**
 * Sample user credentials for testing
 */
export const testUsers = {
  valid: {
    email: "test-user@example.com",
    password: "TestPassword123!",
  },
  weak: {
    email: "weak@example.com",
    password: "123",
  },
  invalid: {
    email: "invalid-email",
    password: "password",
  },
};

/**
 * Generate random adoption motivation text
 */
export function generateMotivation(length: "short" | "medium" | "long" = "medium"): string {
  const motivations = {
    short: "Kocham psy i chcę dać temu psu wspaniały dom pełen miłości i troski.",
    medium:
      "Mam wieloletnie doświadczenie w opiece nad psami i szukam wiernego towarzysza. " +
      "Posiadam dom z ogrodem i regularnie chodzę na długie spacery. Jestem gotowy zapewnić pełną opiekę.",
    long:
      "Od lat pracuję z psami i zawsze marzyłem o adopcji. Mam stabilną sytuację życiową, własny dom z dużym ogrodem " +
      "i regularny rozkład dnia, który pozwala mi poświęcić psu wiele czasu. Regularnie jeżdżę na wycieczki górskie, " +
      "więc pies będzie miał dużo ruchu i przygód. Jestem przygotowany finansowo na koszty związane z opieką weterynaryjną, " +
      "karmieniem wysokiej jakości paszą oraz dbaniem o dobre samopoczucie psa. Szukam lojalnego kompana, " +
      "któremu zapewnię dom pełen miłości na resztę życia.",
  };
  return motivations[length];
}

/**
 * Generate random extra notes
 */
export function generateExtraNotes(): string {
  const notes = [
    "Pracuję z domu, więc pies nie będzie sam.",
    "Mam doświadczenie z psami adopcyjnymi.",
    "Regularnie chodzę na długie spacery.",
    "Posiadam ogródek, gdzie pies będzie mógł biegać.",
    "Jestem przygotowany na koszty weterynaryjne.",
  ];
  return notes[Math.floor(Math.random() * notes.length)];
}

/**
 * Search queries for dog catalog testing
 */
export const searchQueries = {
  valid: ["Burek", "Labrador", "Reksio", "Azor"],
  nonexistent: "XYZ_NONEXISTENT_DOG_BREED_12345",
  special: "@#$%^&*()",
};

/**
 * Filter options for dog catalog
 */
export const filterOptions = {
  size: ["small", "medium", "large", "all"] as const,
  age: ["puppy", "adult", "senior", "all"] as const,
  cities: ["Warszawa", "Kraków", "Wrocław", "Poznań", "Gdańsk"],
};

/**
 * Error messages to validate
 */
export const errorMessages = {
  adoption: {
    motivationTooShort: "Uzasadnienie musi mieć co najmniej 20 znaków",
    noConsent: "Musisz wyrazić zgodę na przetwarzanie danych",
    duplicateApplication: "Masz już aktywny wniosek dla tego psa",
    dogUnavailable: "Wybrany pies nie jest obecnie dostępny do adopcji",
    authRequired: "Musisz być zalogowany",
  },
  signup: {
    passwordTooShort: "Hasło musi mieć minimum 5 znaków",
    passwordMismatch: "Hasła nie są identyczne",
    noGdpr: "Musisz zaakceptować przetwarzanie danych osobowych",
    emailExists: "Ten adres e-mail jest już zarejestrowany",
  },
  login: {
    invalidCredentials: "Nieprawidłowy e-mail lub hasło",
    emailNotVerified: "E-mail niezweryfikowany",
    tooManyAttempts: "Zbyt wiele prób logowania",
  },
};

/**
 * Success messages to validate
 */
export const successMessages = {
  adoption: {
    submitted: "Twój wniosek adopcyjny",
    thankYou: "Dziękujemy",
  },
  signup: {
    accountCreated: "Konto zostało utworzone",
    checkEmail: "Sprawdź swoją skrzynkę e-mail",
  },
};
