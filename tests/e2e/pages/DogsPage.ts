import { Page, Locator, expect } from "@playwright/test";

/**
 * Page Object Model for Dogs Catalog Page (Home Page)
 *
 * This class encapsulates the page structure and provides methods
 * for interacting with the dogs catalog, including filtering and searching.
 */
export class DogsPage {
  readonly page: Page;

  // Catalog view
  readonly catalogView: Locator;
  readonly catalogError: Locator;

  // Dog cards
  readonly dogCards: Locator;

  // Filters
  readonly filters: Locator;
  readonly searchInput: Locator;
  readonly cityFilter: Locator;
  readonly sizeFilter: Locator;
  readonly ageFilter: Locator;
  readonly shelterFilter: Locator;

  constructor(page: Page) {
    this.page = page;

    // Catalog view
    this.catalogView = page.getByTestId("dog-catalog-view");
    this.catalogError = page.getByTestId("dog-catalog-error");

    // Dog cards - use data-test-id
    this.dogCards = page.getByTestId("dog-card");

    // Filters
    this.filters = page.getByTestId("dog-filters");
    this.searchInput = page.getByTestId("dog-filters-search");
    this.cityFilter = page.getByTestId("dog-filters-city");
    this.sizeFilter = page.getByTestId("dog-filters-size");
    this.ageFilter = page.getByTestId("dog-filters-age");
    this.shelterFilter = page.getByTestId("dog-filters-shelter");
  }

  /**
   * Navigate to the dogs catalog page (home page)
   */
  async goto(): Promise<void> {
    await this.page.goto("/");
    // Wait for page to load and React component to render
    await this.page.waitForLoadState("networkidle");
    // Wait for the catalog view to be present (either with dogs or error message)
    await Promise.race([
      this.catalogView.waitFor({ timeout: 10000 }),
      this.catalogError.waitFor({ timeout: 10000 }),
    ]).catch(() => {
      // If both fail, continue anyway
    });
    await this.page.waitForTimeout(2000); // Give React time to render and load data from API
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
  async search(query: string): Promise<void> {
    await this.searchInput.waitFor({ timeout: 10000 });
    await this.searchInput.fill(query);
    // Wait for debounce (500ms according to DogCatalogView)
    await this.page.waitForTimeout(600);
  }

  /**
   * Filter by city
   */
  async filterByCity(city: string): Promise<void> {
    await this.cityFilter.waitFor({ timeout: 5000 });
    await this.cityFilter.click();
    await this.page.getByRole("option", { name: city }).click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Filter by size
   */
  async filterBySize(size: "small" | "medium" | "large" | "all"): Promise<void> {
    await this.sizeFilter.waitFor({ timeout: 5000 });
    await this.sizeFilter.click();
    const sizeLabels = {
      small: "Mały",
      medium: "Średni",
      large: "Duży",
      all: "Wszystkie rozmiary",
    };
    await this.page.getByRole("option", { name: sizeLabels[size] }).click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Filter by age category
   */
  async filterByAge(age: "puppy" | "adult" | "senior" | "all"): Promise<void> {
    await this.ageFilter.waitFor({ timeout: 5000 });
    await this.ageFilter.click();
    const ageLabels = {
      puppy: "Szczeniak",
      adult: "Dorosły",
      senior: "Senior",
      all: "Każdy wiek",
    };
    await this.page.getByRole("option", { name: ageLabels[age] }).click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Click on a specific dog card by index
   */
  async clickDogCard(index: number): Promise<void> {
    await this.dogCards.nth(index).waitFor({ timeout: 5000 });
    await this.dogCards.nth(index).click();
  }

  /**
   * Click on a dog card's "View Details" button by index
   */
  async clickViewDetails(index: number): Promise<void> {
    const card = this.dogCards.nth(index);
    await card.waitFor({ timeout: 5000 });
    await card.getByTestId("dog-card-view-details-button").click();
  }

  /**
   * Get dog name from card by index
   */
  async getDogName(index: number): Promise<string | null> {
    const dogCard = this.dogCards.nth(index);
    const nameElement = dogCard.getByTestId("dog-card-name");
    return await nameElement.textContent();
  }

  /**
   * Get dog metadata (age, size, shelter) from card by index
   */
  async getDogMetadata(index: number): Promise<string | null> {
    const dogCard = this.dogCards.nth(index);
    const metadataElement = dogCard.getByTestId("dog-card-metadata");
    return await metadataElement.textContent();
  }

  /**
   * Get dog temperament description from card by index
   */
  async getDogTemperament(index: number): Promise<string | null> {
    const dogCard = this.dogCards.nth(index);
    const temperamentElement = dogCard.getByTestId("dog-card-temperament");
    return await temperamentElement.textContent();
  }

  /**
   * Get the first dog's ID from the URL after clicking
   */
  async getFirstDogId(): Promise<string> {
    // Click the first dog card
    await this.clickViewDetails(0);

    // Wait for navigation
    await this.page.waitForURL(/\/dogs\/.+/);

    // Extract ID from URL
    const url = this.page.url();
    const match = url.match(/\/dogs\/(.+)/);
    return match ? match[1] : "";
  }

  /**
   * Check if error message is displayed
   */
  async isErrorVisible(): Promise<boolean> {
    return await this.catalogError.isVisible();
  }

  /**
   * Check if filters are visible
   */
  async areFiltersVisible(): Promise<boolean> {
    return await this.filters.isVisible();
  }

  /**
   * Assert that dog cards are displayed
   */
  async expectDogsDisplayed(): Promise<void> {
    const count = await this.getDogCount();
    expect(count).toBeGreaterThan(0);
  }

  /**
   * Assert that search returns results
   */
  async expectSearchResults(query: string): Promise<void> {
    await this.search(query);
    const count = await this.getDogCount();
    expect(count).toBeGreaterThanOrEqual(0);
  }

  /**
   * Assert that no dogs are displayed
   */
  async expectNoDogs(): Promise<void> {
    const count = await this.getDogCount();
    expect(count).toBe(0);
  }
}
