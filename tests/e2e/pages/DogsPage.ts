import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Dogs Listing Page
 *
 * This class encapsulates the page structure and provides methods
 * for interacting with the dogs listing page.
 */
export class DogsPage {
  readonly page: Page;
  readonly dogCards: Locator;
  readonly searchInput: Locator;
  readonly filterButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dogCards = page.locator('[data-testid="dog-card"]');
    this.searchInput = page.locator('input[type="search"], input[placeholder*="Szukaj"], input[placeholder*="Search"]');
    this.filterButton = page.locator('button:has-text("Filtruj"), button:has-text("Filter")');
  }

  /**
   * Navigate to the dogs listing page
   */
  async goto() {
    await this.page.goto('/dogs');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get the number of visible dog cards
   */
  async getDogCount(): Promise<number> {
    return await this.dogCards.count();
  }

  /**
   * Search for dogs by name or breed
   */
  async search(query: string) {
    if (await this.searchInput.count() > 0) {
      await this.searchInput.fill(query);
      await this.page.waitForTimeout(500); // Wait for debounce
    }
  }

  /**
   * Click on a specific dog card by index
   */
  async clickDogCard(index: number) {
    await this.dogCards.nth(index).click();
  }

  /**
   * Get dog name from card by index
   */
  async getDogName(index: number): Promise<string | null> {
    const dogCard = this.dogCards.nth(index);
    const nameElement = dogCard.locator('h2, h3, [data-testid="dog-name"]').first();
    return await nameElement.textContent();
  }

  /**
   * Check if a dog card has an image
   */
  async hasImage(index: number): Promise<boolean> {
    const dogCard = this.dogCards.nth(index);
    const image = dogCard.locator('img').first();
    return await image.isVisible();
  }

  /**
   * Filter dogs by age range
   */
  async filterByAge(minAge: number, maxAge: number) {
    // This is a placeholder - adjust based on actual filter implementation
    if (await this.filterButton.count() > 0) {
      await this.filterButton.click();
      // Add specific filter interactions here
    }
  }
}

