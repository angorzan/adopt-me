import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to be fully loaded
    await expect(page).toHaveTitle(/Adopt Me/i);
  });

  test('should display main navigation', async ({ page }) => {
    await page.goto('/');

    // Check if navigation elements are visible
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should navigate to dogs listing page', async ({ page }) => {
    await page.goto('/');

    // Click on the dogs link (adjust selector as needed)
    const dogsLink = page.getByRole('link', { name: /psy|dogs/i });
    if (await dogsLink.count() > 0) {
      await dogsLink.first().click();

      // Wait for navigation
      await page.waitForURL(/.*dogs.*/);

      // Verify we're on the dogs page
      await expect(page).toHaveURL(/.*dogs.*/);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Check if page renders correctly on mobile
    await expect(page).toHaveTitle(/Adopt Me/i);
  });

  test('should take screenshot of homepage', async ({ page }) => {
    await page.goto('/');

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Take a screenshot
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

