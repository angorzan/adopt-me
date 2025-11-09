import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment variables from .env.test
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',

  // Maximum time one test can run
  timeout: 30 * 1000,

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  // Shared settings for all the projects
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.BASE_URL || 'http://localhost:4321',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Pass test environment variables to tests
    // These will be available via process.env in tests
  },

  // Make environment variables available in tests
  // This ensures test database credentials are accessible
  env: {
    E2E_USERNAME: process.env.E2E_USERNAME || '',
    E2E_PASSWORD: process.env.E2E_PASSWORD || '',
    E2E_USERNAME_ID: process.env.E2E_USERNAME_ID || '',
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_PUBLIC_KEY: process.env.SUPABASE_PUBLIC_KEY || '',
  },

  // Configure projects for major browsers - tylko Chromium zgodnie z wytycznymi
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    // Use test environment variables when starting dev server
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      // Pass test database credentials to dev server
      SUPABASE_URL: process.env.SUPABASE_URL || '',
      SUPABASE_PUBLIC_KEY: process.env.SUPABASE_PUBLIC_KEY || '',
      // Ensure we're in test mode
      NODE_ENV: 'test',
    },
  },
});

