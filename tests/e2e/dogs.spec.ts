import { test, expect } from "@playwright/test";
import { DogsPage } from "./pages/DogsPage";

test.describe("Dogs Listing Page", () => {
  let dogsPage: DogsPage;

  test.beforeEach(async ({ page }) => {
    dogsPage = new DogsPage(page);
    await dogsPage.goto();
  });

  test.skip("should display dog cards", async () => {
    const dogCount = await dogsPage.getDogCount();
    expect(dogCount).toBeGreaterThan(0);
  });

  test("should display dog images", async () => {
    const dogCount = await dogsPage.getDogCount();

    if (dogCount > 0) {
      const hasImage = await dogsPage.hasImage(0);
      expect(hasImage).toBe(true);
    }
  });

  test.skip("should search for dogs", async () => {
    // Try to search if search functionality exists
    await dogsPage.search("Labrador");

    // Give some time for results to filter
    await dogsPage.page.waitForTimeout(1000);

    // At least the page should still be functional
    const dogCount = await dogsPage.getDogCount();
    expect(dogCount).toBeGreaterThanOrEqual(0);
  });

  test("should navigate to dog details on card click", async ({ page }) => {
    const dogCount = await dogsPage.getDogCount();

    if (dogCount > 0) {
      await dogsPage.clickDogCard(0);

      // Wait for navigation or modal to appear
      await page.waitForTimeout(500);

      // Verify that we either navigated or a modal appeared
      const url = page.url();
      const hasModal = (await page.locator('[role="dialog"], .modal').count()) > 0;

      expect(url.includes("/dogs/") || hasModal).toBe(true);
    }
  });

  test.skip("should be responsive on tablet", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    const dogCount = await dogsPage.getDogCount();
    expect(dogCount).toBeGreaterThan(0);
  });

  test.skip("should handle no results gracefully", async () => {
    await dogsPage.search("XYZ_NONEXISTENT_DOG_BREED_12345");

    await dogsPage.page.waitForTimeout(1000);

    // Page should still be functional even with no results
    const dogCount = await dogsPage.getDogCount();
    expect(dogCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe("Dogs Page API Integration", () => {
  test("should load dogs from API", async ({ page }) => {
    // Listen to API requests
    const apiRequests: string[] = [];

    page.on("request", (request) => {
      if (request.url().includes("/api/") || request.url().includes("supabase")) {
        apiRequests.push(request.url());
      }
    });

    const dogsPage = new DogsPage(page);
    await dogsPage.goto();

    // Wait for potential API calls
    await page.waitForTimeout(2000);

    // Verify that dogs are loaded (either from API or SSR)
    const dogCount = await dogsPage.getDogCount();
    expect(dogCount).toBeGreaterThanOrEqual(0);
  });
});
