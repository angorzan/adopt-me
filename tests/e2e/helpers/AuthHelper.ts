import { Page } from "@playwright/test";
import { LoginPage, SignupPage } from "../pages/AuthPages";

export interface TestUser {
  email: string;
  password: string;
  id?: string;
}

/**
 * Authentication Helper
 *
 * Provides utility functions for authentication in tests
 */
export class AuthHelper {
  /**
   * Get the dedicated E2E test user from environment variables
   * This user should already exist in the test database
   */
  static getE2ETestUser(): TestUser {
    const email = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;
    const id = process.env.E2E_USERNAME_ID;

    if (!email || !password) {
      throw new Error(
        "E2E test user credentials not found in environment variables. " +
          "Please ensure E2E_USERNAME and E2E_PASSWORD are set in .env.test"
      );
    }

    return {
      email,
      password,
      id,
    };
  }

  /**
   * Generate a unique email for testing (for tests that need new users)
   */
  static generateTestEmail(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `test-user-${timestamp}-${random}@adoptme-test.pl`;
  }

  /**
   * Generate test user credentials (for tests that need new users)
   */
  static generateTestUser(): TestUser {
    return {
      email: this.generateTestEmail(),
      password: "TestPassword123!",
    };
  }

  /**
   * Create a new test user account
   */
  static async createTestUser(page: Page, user?: TestUser): Promise<TestUser> {
    const testUser = user || this.generateTestUser();
    const signupPage = new SignupPage(page);

    await signupPage.goto();
    await signupPage.signup({
      email: testUser.email,
      password: testUser.password,
    });

    // Wait for success state
    await signupPage.waitForSuccess();

    return testUser;
  }

  /**
   * Login with existing user credentials
   */
  static async loginTestUser(page: Page, user: TestUser, redirectTo?: string): Promise<void> {
    const loginPage = new LoginPage(page);

    await loginPage.goto(redirectTo);
    await loginPage.login(user.email, user.password);

    // Wait for successful redirect
    await loginPage.waitForSuccessfulLogin(redirectTo || "/");
  }

  /**
   * Create a new user and login
   */
  static async createAndLoginTestUser(page: Page): Promise<TestUser> {
    const testUser = this.generateTestUser();

    // Create account
    await this.createTestUser(page, testUser);

    // Navigate to login and authenticate
    await this.loginTestUser(page, testUser);

    return testUser;
  }

  /**
   * Logout current user
   */
  static async logout(page: Page): Promise<void> {
    // Navigate to logout endpoint or click logout button
    // Adjust based on your actual logout implementation
    await page.goto("/api/v1/auth/logout");
    await page.waitForLoadState("networkidle");
  }

  /**
   * Check if user is logged in
   */
  static async isLoggedIn(page: Page): Promise<boolean> {
    // Check for the presence of user-specific elements
    // This might need adjustment based on your actual implementation
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check if login button is visible (not logged in) or user menu is visible (logged in)
    const loginButton = page.getByRole("link", { name: /zaloguj|login/i });
    const loginButtonVisible = await loginButton.isVisible().catch(() => false);

    return !loginButtonVisible;
  }

  /**
   * Setup authentication state in storage (for faster tests)
   * This requires having a valid session token
   */
  static async setupAuthState(page: Page, authToken: string): Promise<void> {
    // Set auth cookies/storage
    // This will depend on how your app handles authentication
    await page.context().addCookies([
      {
        name: "auth_token",
        value: authToken,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);
  }

  /**
   * Clear authentication state
   */
  static async clearAuthState(page: Page): Promise<void> {
    await page.context().clearCookies();
    await page.context().clearPermissions();
  }

  /**
   * Quick login using API (faster than UI)
   * Use this for tests that don't need to test the login flow itself
   *
   * By default, uses the E2E test user from environment variables.
   * Pass a custom user if you need to test with a different account.
   */
  static async quickLogin(page: Page, user?: TestUser): Promise<TestUser> {
    // Use the dedicated E2E test user by default (already exists in test DB)
    const testUser = user || this.getE2ETestUser();

    // Login via API
    const response = await page.request.post("/api/v1/auth/login", {
      data: {
        email: testUser.email,
        password: testUser.password,
      },
    });

    if (!response.ok()) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(
        `Quick login failed: ${response.status()}\n` + `User: ${testUser.email}\n` + `Response: ${errorText}`
      );
    }

    // Navigate to home to ensure cookies are set
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    return testUser;
  }

  /**
   * Quick login using the E2E test user specifically
   * This is a convenience method that's more explicit
   */
  static async quickLoginAsE2EUser(page: Page): Promise<TestUser> {
    return this.quickLogin(page, this.getE2ETestUser());
  }
}
