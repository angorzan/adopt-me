import { test, expect } from "@playwright/test";
import { AdoptionFormPage } from "./pages/AdoptionFormPage";
import { SignupPage, LoginPage } from "./pages/AuthPages";
import { DogsPage } from "./pages/DogsPage";
import { AuthHelper } from "./helpers/AuthHelper";
import { validAdoptionData, invalidAdoptionData, successMessages } from "./helpers/test-data";

// ═════════════════════════════════════════════════════════════════════
// ADOPTION FLOW - Complete Journey E2E Tests
// ═════════════════════════════════════════════════════════════════════
//
// IMPORTANT: Test Database Configuration
// ─────────────────────────────────────────────────────────────────────
// These tests use a DEDICATED TEST DATABASE configured in .env.test
//
// Environment Variables Required:
// - SUPABASE_URL: Test Supabase project URL
// - SUPABASE_PUBLIC_KEY: Test Supabase anon key
// - E2E_USERNAME: Email of existing test user
// - E2E_PASSWORD: Password of existing test user
// - E2E_USERNAME_ID: UUID of existing test user
//
// The E2E test user should already exist in the test database.
// See .env.test.example for setup instructions.
//
// ═════════════════════════════════════════════════════════════════════

test.describe("Adoption Flow - Complete Journey", () => {
  let dogId: string;

  test.beforeEach(async ({ page }) => {
    // Get a valid dog ID from the catalog
    const dogsPage = new DogsPage(page);
    await dogsPage.goto();

    // Ensure there are dogs available
    const count = await dogsPage.getDogCount();
    if (count === 0) {
      test.skip(true, "No dogs available in catalog");
    }

    // Get the first dog's ID
    dogId = await dogsPage.getFirstDogId();
  });

  // Test 1: Happy Path - Authenticated user can submit adoption application
  test("authenticated user can submit adoption application successfully", async ({ page }) => {
    // Login as test user
    await AuthHelper.quickLogin(page);

    const adoptionForm = new AdoptionFormPage(page);
    await adoptionForm.goto(dogId);

    // Verify form is visible
    await expect(adoptionForm.formContainer).toBeVisible();

    // Fill and submit form
    await adoptionForm.submitCompleteForm(validAdoptionData.short);

    // Wait for success
    await adoptionForm.waitForSuccess();
    await adoptionForm.expectSuccess();

    // Verify success message contains expected text
    const successMsg = await adoptionForm.getSuccessMessage();
    expect(successMsg).toContain(successMessages.adoption.submitted);
  });

  // Test 2: Unauthenticated user sees login/signup CTAs
  test("unauthenticated user sees login/signup CTAs instead of form", async ({ page }) => {
    // Ensure user is NOT logged in
    await AuthHelper.clearAuthState(page);

    const adoptionForm = new AdoptionFormPage(page);
    await adoptionForm.goto(dogId);

    // Verify unauthenticated state
    await adoptionForm.expectUnauthenticatedState();

    // Click login button
    await adoptionForm.clickLoginCta();

    // Verify redirect to login page
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  // Test 3: Form validation - required fields
  test("shows validation errors for required fields", async ({ page }) => {
    // Login
    await AuthHelper.quickLogin(page);

    const adoptionForm = new AdoptionFormPage(page);
    await adoptionForm.goto(dogId);

    // Try to submit empty form
    await adoptionForm.submit();

    // Verify validation errors appear
    await adoptionForm.expectMotivationError();
    await adoptionForm.expectGdprConsentError();

    // Verify no success state
    expect(await adoptionForm.isSuccessVisible()).toBe(false);
  });

  // Test 4: Form validation - minimum character length for motivation
  test("validates minimum character length for motivation field", async ({ page }) => {
    // Login
    await AuthHelper.quickLogin(page);

    const adoptionForm = new AdoptionFormPage(page);
    await adoptionForm.goto(dogId);

    // Fill with too short motivation (< 20 chars)
    await adoptionForm.fillMotivation(invalidAdoptionData.tooShort.motivation);
    await adoptionForm.checkGdprConsent();
    await adoptionForm.submit();

    // Verify validation error
    await adoptionForm.expectMotivationError();

    const errorText = await adoptionForm.getMotivationError();
    expect(errorText).toContain("20 znaków");
  });

  // Test 5: Duplicate application prevention
  test.skip("prevents duplicate application for the same dog", async ({ page }) => {
    // SKIPPED: This test would create duplicate applications in the test database
    // and pollute the E2E test user's application history.
    //
    // To properly test this:
    // 1. Create a temporary user
    // 2. Submit first application
    // 3. Try to submit duplicate
    // 4. Clean up the user and applications
    //
    // OR test this at the API level in unit/integration tests
    // OR implement a test database reset mechanism

    // Login with E2E user
    await AuthHelper.quickLogin(page);

    const adoptionForm = new AdoptionFormPage(page);
    await adoptionForm.goto(dogId);

    // Submit first application
    await adoptionForm.submitCompleteForm(validAdoptionData.short);
    await adoptionForm.waitForSuccess();

    // Refresh page and try to submit again
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Try to submit second application for same dog
    await adoptionForm.submitCompleteForm(validAdoptionData.short);

    // Wait for error
    await adoptionForm.waitForError();

    const errorText = await adoptionForm.getGlobalError();
    expect(errorText).toContain("już");
  });

  // Test 6: Loading state during form submission
  test("displays loading state during form submission", async ({ page }) => {
    // Login
    await AuthHelper.quickLogin(page);

    const adoptionForm = new AdoptionFormPage(page);
    await adoptionForm.goto(dogId);

    // Fill form
    await adoptionForm.fillCompleteForm(validAdoptionData.short);

    // Submit and check loading state
    await adoptionForm.submit();

    // Verify button shows loading text
    await expect(adoptionForm.submitButton).toContainText("Wysyłanie");

    // Verify button is disabled during submission
    expect(await adoptionForm.isSubmitButtonDisabled()).toBe(true);

    // Wait for completion
    await adoptionForm.waitForSuccess();
  });

  // Test 7: Preferred contact method selection
  test("allows user to select preferred contact method", async ({ page }) => {
    // Login
    await AuthHelper.quickLogin(page);

    const adoptionForm = new AdoptionFormPage(page);
    await adoptionForm.goto(dogId);

    // Select phone as contact method
    await adoptionForm.submitCompleteForm({
      ...validAdoptionData.short,
      contactPreference: "phone",
    });

    // Verify success
    await adoptionForm.waitForSuccess();
    await adoptionForm.expectSuccess();
  });

  // Test 8: Optional additional notes
  test("allows optional additional notes up to 500 characters", async ({ page }) => {
    // Login
    await AuthHelper.quickLogin(page);

    const adoptionForm = new AdoptionFormPage(page);
    await adoptionForm.goto(dogId);

    // Submit with extra notes
    await adoptionForm.submitCompleteForm(validAdoptionData.withNotes);

    // Verify success
    await adoptionForm.waitForSuccess();
    await adoptionForm.expectSuccess();
  });
});

test.describe("Adoption Flow - Registration & Login", () => {
  // Test 9: Complete registration flow
  test("new user can register and submit adoption application", async ({ page }) => {
    // Generate unique test user
    const testUser = AuthHelper.generateTestUser();

    // Register
    const signupPage = new SignupPage(page);
    await signupPage.goto();
    await signupPage.signup(testUser);

    // Verify success
    await signupPage.expectSuccess();

    // Go to login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);

    // Wait for redirect
    await loginPage.waitForSuccessfulLogin();

    // Navigate to dogs catalog and get a dog
    const dogsPage = new DogsPage(page);
    await dogsPage.goto();

    // Submit adoption application
    const adoptionForm = new AdoptionFormPage(page);
    await adoptionForm.submitCompleteForm(validAdoptionData.short);

    // Verify success
    await adoptionForm.waitForSuccess();
    await adoptionForm.expectSuccess();
  });

  // Test 10: Login validation
  test("shows validation errors for invalid login credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Try to login with invalid credentials
    await loginPage.login("invalid@example.com", "wrongpassword");

    // Wait for and verify error
    await loginPage.waitForError();
    await loginPage.expectError("Nieprawidłowy");
  });
});

test.describe("Adoption Flow - Dog Selection", () => {
  // Test 11: Navigate from catalog to dog details
  test("user can navigate from dog catalog to adoption form", async ({ page }) => {
    const dogsPage = new DogsPage(page);
    await dogsPage.goto();

    // Verify dogs are displayed
    await dogsPage.expectDogsDisplayed();

    // Click on first dog
    await dogsPage.clickViewDetails(0);

    // Verify redirect to dog details page
    await expect(page).toHaveURL(/\/dogs\/.+/);

    // Verify adoption form or CTA is visible
    const adoptionForm = new AdoptionFormPage(page);
    const isFormVisible = await adoptionForm.isFormVisible();
    const isUnauthVisible = await adoptionForm.isUnauthenticatedStateVisible();

    expect(isFormVisible || isUnauthVisible).toBe(true);
  });

  // Test 12: Dog catalog search
  test("user can search dogs and navigate to adoption form", async ({ page }) => {
    const dogsPage = new DogsPage(page);
    await dogsPage.goto();

    // Get first dog name before search
    const firstName = await dogsPage.getDogName(0);

    if (firstName) {
      // Search for the dog
      await dogsPage.search(firstName);

      // Verify results are shown
      const count = await dogsPage.getDogCount();
      expect(count).toBeGreaterThan(0);

      // Click on result
      await dogsPage.clickViewDetails(0);

      // Verify redirect to dog details
      await expect(page).toHaveURL(/\/dogs\/.+/);
    }
  });
});

test.describe("Adoption Flow - Error Handling", () => {
  let dogId: string;

  test.beforeEach(async ({ page }) => {
    const dogsPage = new DogsPage(page);
    await dogsPage.goto();

    const count = await dogsPage.getDogCount();
    if (count === 0) {
      test.skip(true, "No dogs available");
    }

    dogId = await dogsPage.getFirstDogId();
  });

  // Test 13: Network error handling
  test("shows error message when API request fails", async ({ page }) => {
    // Login
    await AuthHelper.quickLogin(page);

    // Mock failed API response
    await page.route("**/api/applications", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "server_error" }),
      });
    });

    const adoptionForm = new AdoptionFormPage(page);
    await adoptionForm.goto(dogId);

    // Submit form
    await adoptionForm.submitCompleteForm(validAdoptionData.short);

    // Wait for error
    await adoptionForm.waitForError();

    const errorText = await adoptionForm.getGlobalError();
    expect(errorText).toContain("błąd");
  });

  // Test 14: Unavailable dog
  test("shows error when dog is no longer available", async ({ page }) => {
    // Login
    await AuthHelper.quickLogin(page);

    // Mock API response with dog unavailable error
    await page.route("**/api/applications", (route) => {
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "dog_not_available" }),
      });
    });

    const adoptionForm = new AdoptionFormPage(page);
    await adoptionForm.goto(dogId);

    // Submit form
    await adoptionForm.submitCompleteForm(validAdoptionData.short);

    // Wait for error
    await adoptionForm.waitForError();

    const errorText = await adoptionForm.getGlobalError();
    expect(errorText).toContain("niedostępny");
  });
});

test.describe("Adoption Flow - Responsive Design", () => {
  let dogId: string;

  test.beforeEach(async ({ page }) => {
    const dogsPage = new DogsPage(page);
    await dogsPage.goto();

    const count = await dogsPage.getDogCount();
    if (count === 0) {
      test.skip(true, "No dogs available");
    }

    dogId = await dogsPage.getFirstDogId();
  });

  // Test 15: Mobile adoption form
  test("adoption form works correctly on mobile devices", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Login
    await AuthHelper.quickLogin(page);

    const adoptionForm = new AdoptionFormPage(page);
    await adoptionForm.goto(dogId);

    // Verify form is visible and responsive
    await expect(adoptionForm.formContainer).toBeVisible();

    // Fill and submit
    await adoptionForm.submitCompleteForm(validAdoptionData.short);

    // Verify success
    await adoptionForm.waitForSuccess();
    await adoptionForm.expectSuccess();
  });

  // Test 16: Tablet adoption form
  test("adoption form works correctly on tablet devices", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Login
    await AuthHelper.quickLogin(page);

    const adoptionForm = new AdoptionFormPage(page);
    await adoptionForm.goto(dogId);

    // Verify form is visible and responsive
    await expect(adoptionForm.formContainer).toBeVisible();

    // Fill and submit
    await adoptionForm.submitCompleteForm(validAdoptionData.short);

    // Verify success
    await adoptionForm.waitForSuccess();
    await adoptionForm.expectSuccess();
  });
});
