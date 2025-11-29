import { Page, Locator, expect } from "@playwright/test";

/**
 * Page Object Model for Signup Page
 *
 * Handles user registration flow
 */
export class SignupPage {
  readonly page: Page;

  // Success state
  readonly successCard: Locator;
  readonly successMessage: Locator;
  readonly successLoginButton: Locator;

  // Form elements
  readonly formContainer: Locator;
  readonly form: Locator;
  readonly errorMessage: Locator;

  // Form fields
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly passwordConfirmInput: Locator;
  readonly gdprCheckbox: Locator;
  readonly submitButton: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Success state
    this.successCard = page.getByTestId("signup-form-success");
    this.successMessage = page.getByTestId("signup-form-success-message");
    this.successLoginButton = page.getByTestId("signup-form-success-login-button");

    // Form elements
    this.formContainer = page.getByTestId("signup-form-container");
    this.form = page.getByTestId("signup-form");
    this.errorMessage = page.getByTestId("signup-form-error");

    // Form fields
    this.emailInput = page.getByTestId("signup-form-email");
    this.passwordInput = page.getByTestId("signup-form-password");
    this.passwordConfirmInput = page.getByTestId("signup-form-password-confirm");
    this.gdprCheckbox = page.getByTestId("signup-form-gdpr-checkbox");
    this.submitButton = page.getByTestId("signup-form-submit-button");
    this.loginLink = page.getByTestId("signup-form-login-link");
  }

  /**
   * Navigate to the signup page
   */
  async goto(): Promise<void> {
    await this.page.goto("/auth/signup");
    await this.page.waitForLoadState("networkidle");
    // Wait for either the form container or success card to appear
    await Promise.race([
      this.formContainer.waitFor({ timeout: 10000 }),
      this.successCard.waitFor({ timeout: 10000 }),
    ]).catch(() => {
      // If both fail, continue anyway
    });
    await this.page.waitForTimeout(1000); // Give React time to render
  }

  /**
   * Fill email field
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.waitFor({ timeout: 10000 });
    await this.emailInput.fill(email);
  }

  /**
   * Fill password field
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.waitFor({ timeout: 10000 });
    await this.passwordInput.fill(password);
  }

  /**
   * Fill password confirmation field
   */
  async fillPasswordConfirm(password: string): Promise<void> {
    await this.passwordConfirmInput.waitFor({ timeout: 10000 });
    await this.passwordConfirmInput.fill(password);
  }

  /**
   * Check the GDPR checkbox
   */
  async checkGdpr(): Promise<void> {
    await this.gdprCheckbox.waitFor({ timeout: 10000 });
    await this.gdprCheckbox.check();
  }

  /**
   * Submit the form
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Fill the complete signup form
   */
  async fillForm(data: { email: string; password: string; confirmPassword?: string }): Promise<void> {
    await this.fillEmail(data.email);
    await this.fillPassword(data.password);
    await this.fillPasswordConfirm(data.confirmPassword || data.password);
    await this.checkGdpr();
  }

  /**
   * Fill and submit the complete signup form
   */
  async signup(data: { email: string; password: string; confirmPassword?: string }): Promise<void> {
    await this.fillForm(data);
    await this.submit();
  }

  /**
   * Get the error message text
   */
  async getErrorMessage(): Promise<string | null> {
    return await this.errorMessage.textContent();
  }

  /**
   * Check if success state is visible
   */
  async isSuccessVisible(): Promise<boolean> {
    return await this.successCard.isVisible();
  }

  /**
   * Navigate to login page via link
   */
  async goToLogin(): Promise<void> {
    await this.loginLink.click();
  }

  /**
   * Wait for success state to appear
   */
  async waitForSuccess(): Promise<void> {
    await expect(this.successCard).toBeVisible({ timeout: 10000 });
  }

  /**
   * Wait for error message to appear
   */
  async waitForError(): Promise<void> {
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert that signup was successful
   */
  async expectSuccess(): Promise<void> {
    await expect(this.successCard).toBeVisible();
    await expect(this.successMessage).toContainText("Konto zostało utworzone");
  }

  /**
   * Assert that error message is displayed
   */
  async expectError(errorText?: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    if (errorText) {
      await expect(this.errorMessage).toContainText(errorText);
    }
  }
}

/**
 * Page Object Model for Login Page
 *
 * Handles user login flow
 */
export class LoginPage {
  readonly page: Page;

  // Form elements
  readonly formContainer: Locator;
  readonly form: Locator;
  readonly errorMessage: Locator;

  // Form fields
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signupLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Form elements
    this.formContainer = page.getByTestId("login-form-container");
    this.form = page.getByTestId("login-form");
    this.errorMessage = page.getByTestId("login-form-error");

    // Form fields
    this.emailInput = page.getByTestId("login-form-email");
    this.passwordInput = page.getByTestId("login-form-password");
    this.submitButton = page.getByTestId("login-form-submit-button");
    this.forgotPasswordLink = page.getByTestId("login-form-forgot-password-link");
    this.signupLink = page.getByTestId("login-form-signup-link");
  }

  /**
   * Navigate to the login page
   */
  async goto(redirectTo?: string): Promise<void> {
    const url = redirectTo ? `/auth/login?redirect=${redirectTo}` : "/auth/login";
    await this.page.goto(url);
    await this.page.waitForLoadState("networkidle");
    // Wait for the form container to appear
    await this.formContainer.waitFor({ timeout: 10000 }).catch(() => {
      // If fails, continue anyway
    });
    await this.page.waitForTimeout(1000); // Give React time to render
  }

  /**
   * Fill email field
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.waitFor({ timeout: 10000 });
    await this.emailInput.fill(email);
  }

  /**
   * Fill password field
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.waitFor({ timeout: 10000 });
    await this.passwordInput.fill(password);
  }

  /**
   * Submit the form
   */
  async submit(): Promise<void> {
    await this.submitButton.waitFor({ timeout: 10000 });
    await this.submitButton.click();
  }

  /**
   * Fill and submit the login form
   */
  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  /**
   * Get the error message text
   */
  async getErrorMessage(): Promise<string | null> {
    return await this.errorMessage.textContent();
  }

  /**
   * Navigate to signup page via link
   */
  async goToSignup(): Promise<void> {
    await this.signupLink.click();
  }

  /**
   * Navigate to forgot password page
   */
  async goToForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  /**
   * Wait for successful login (redirect to home or specified page)
   */
  async waitForSuccessfulLogin(expectedUrl = "/"): Promise<void> {
    await this.page.waitForURL(expectedUrl, { timeout: 10000 });
  }

  /**
   * Wait for error message to appear
   */
  async waitForError(): Promise<void> {
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert that error message is displayed
   */
  async expectError(errorText?: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    if (errorText) {
      await expect(this.errorMessage).toContainText(errorText);
    }
  }

  /**
   * Assert that the submit button is disabled
   */
  async expectSubmitDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
  }

  /**
   * Check if submit button shows loading state
   */
  async isLoading(): Promise<boolean> {
    const text = await this.submitButton.textContent();
    return text?.includes("Logowanie...") || false;
  }
}
