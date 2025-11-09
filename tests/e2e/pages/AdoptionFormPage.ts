import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Adoption Form
 *
 * Handles all interactions with the adoption application form,
 * including unauthenticated state, form filling, and validation.
 */
export class AdoptionFormPage {
  readonly page: Page;

  // Unauthenticated state
  readonly unauthenticatedCard: Locator;
  readonly loginButton: Locator;
  readonly signupButton: Locator;

  // Success state
  readonly successCard: Locator;
  readonly successMessage: Locator;

  // Form elements
  readonly formContainer: Locator;
  readonly form: Locator;
  readonly globalError: Locator;

  // Form fields
  readonly motivationTextarea: Locator;
  readonly motivationCounter: Locator;
  readonly motivationError: Locator;

  readonly contactPreferenceSelect: Locator;
  readonly contactEmailOption: Locator;
  readonly contactPhoneOption: Locator;
  readonly contactPreferenceError: Locator;

  readonly extraNotesTextarea: Locator;
  readonly extraNotesCounter: Locator;
  readonly extraNotesError: Locator;

  readonly gdprConsentCheckbox: Locator;
  readonly gdprConsentError: Locator;

  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Unauthenticated state
    this.unauthenticatedCard = page.getByTestId('adoption-form-unauthenticated');
    this.loginButton = page.getByTestId('adoption-form-login-button');
    this.signupButton = page.getByTestId('adoption-form-signup-button');

    // Success state
    this.successCard = page.getByTestId('adoption-form-success');
    this.successMessage = page.getByTestId('adoption-form-success-message');

    // Form elements
    this.formContainer = page.getByTestId('adoption-form-container');
    this.form = page.getByTestId('adoption-form');
    this.globalError = page.getByTestId('adoption-form-global-error');

    // Form fields
    this.motivationTextarea = page.getByTestId('adoption-form-motivation');
    this.motivationCounter = page.getByTestId('adoption-form-motivation-counter');
    this.motivationError = page.getByTestId('adoption-form-motivation-error');

    this.contactPreferenceSelect = page.getByTestId('adoption-form-contact-preference');
    this.contactEmailOption = page.getByTestId('adoption-form-contact-email');
    this.contactPhoneOption = page.getByTestId('adoption-form-contact-phone');
    this.contactPreferenceError = page.getByTestId('adoption-form-contact-preference-error');

    this.extraNotesTextarea = page.getByTestId('adoption-form-extra-notes');
    this.extraNotesCounter = page.getByTestId('adoption-form-extra-notes-counter');
    this.extraNotesError = page.getByTestId('adoption-form-extra-notes-error');

    this.gdprConsentCheckbox = page.getByTestId('adoption-form-consent-checkbox');
    this.gdprConsentError = page.getByTestId('adoption-form-consent-error');

    this.submitButton = page.getByTestId('adoption-form-submit-button');
  }

  /**
   * Navigate to a dog's adoption form page
   */
  async goto(dogId: string): Promise<void> {
    await this.page.goto(`/dogs/${dogId}`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if the unauthenticated state is displayed
   */
  async isUnauthenticatedStateVisible(): Promise<boolean> {
    return await this.unauthenticatedCard.isVisible();
  }

  /**
   * Check if the form is visible (authenticated state)
   */
  async isFormVisible(): Promise<boolean> {
    return await this.formContainer.isVisible();
  }

  /**
   * Check if the success message is displayed
   */
  async isSuccessVisible(): Promise<boolean> {
    return await this.successCard.isVisible();
  }

  /**
   * Click the login CTA button
   */
  async clickLoginCta(): Promise<void> {
    await this.loginButton.click();
  }

  /**
   * Click the signup CTA button
   */
  async clickSignupCta(): Promise<void> {
    await this.signupButton.click();
  }

  /**
   * Fill the motivation field
   */
  async fillMotivation(text: string): Promise<void> {
    await this.motivationTextarea.fill(text);
  }

  /**
   * Select preferred contact method
   */
  async selectContactPreference(method: 'email' | 'phone'): Promise<void> {
    await this.contactPreferenceSelect.click();

    if (method === 'email') {
      await this.contactEmailOption.click();
    } else {
      await this.contactPhoneOption.click();
    }
  }

  /**
   * Fill additional notes field
   */
  async fillExtraNotes(text: string): Promise<void> {
    await this.extraNotesTextarea.fill(text);
  }

  /**
   * Check the GDPR consent checkbox
   */
  async checkGdprConsent(): Promise<void> {
    await this.gdprConsentCheckbox.check();
  }

  /**
   * Uncheck the GDPR consent checkbox
   */
  async uncheckGdprConsent(): Promise<void> {
    await this.gdprConsentCheckbox.uncheck();
  }

  /**
   * Submit the form
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Fill the complete form with all required fields
   */
  async fillCompleteForm(data: {
    motivation: string;
    contactPreference?: 'email' | 'phone';
    extraNotes?: string;
  }): Promise<void> {
    await this.fillMotivation(data.motivation);

    if (data.contactPreference) {
      await this.selectContactPreference(data.contactPreference);
    }

    if (data.extraNotes) {
      await this.fillExtraNotes(data.extraNotes);
    }

    await this.checkGdprConsent();
  }

  /**
   * Fill and submit the complete form
   */
  async submitCompleteForm(data: {
    motivation: string;
    contactPreference?: 'email' | 'phone';
    extraNotes?: string;
  }): Promise<void> {
    await this.fillCompleteForm(data);
    await this.submit();
  }

  /**
   * Get the text content of the success message
   */
  async getSuccessMessage(): Promise<string | null> {
    return await this.successMessage.textContent();
  }

  /**
   * Get the text content of the global error message
   */
  async getGlobalError(): Promise<string | null> {
    return await this.globalError.textContent();
  }

  /**
   * Get the text content of the motivation error
   */
  async getMotivationError(): Promise<string | null> {
    return await this.motivationError.textContent();
  }

  /**
   * Get the text content of the GDPR consent error
   */
  async getGdprConsentError(): Promise<string | null> {
    return await this.gdprConsentError.textContent();
  }

  /**
   * Check if the submit button is disabled
   */
  async isSubmitButtonDisabled(): Promise<boolean> {
    return await this.submitButton.isDisabled();
  }

  /**
   * Get the character count from the motivation counter
   */
  async getMotivationCharCount(): Promise<string> {
    const text = await this.motivationCounter.textContent();
    return text || '0/800';
  }

  /**
   * Wait for the loading state to finish (button shows "Wysyłanie...")
   */
  async waitForSubmitLoading(): Promise<void> {
    await expect(this.submitButton).toContainText('Wysyłanie');
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
    await expect(this.globalError).toBeVisible({ timeout: 5000 });
  }

  /**
   * Assert that validation error is shown for motivation field
   */
  async expectMotivationError(): Promise<void> {
    await expect(this.motivationError).toBeVisible();
  }

  /**
   * Assert that validation error is shown for GDPR consent
   */
  async expectGdprConsentError(): Promise<void> {
    await expect(this.gdprConsentError).toBeVisible();
  }

  /**
   * Assert that the form is in unauthenticated state
   */
  async expectUnauthenticatedState(): Promise<void> {
    await expect(this.unauthenticatedCard).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    await expect(this.signupButton).toBeVisible();
  }

  /**
   * Assert that the form submission was successful
   */
  async expectSuccess(): Promise<void> {
    await expect(this.successCard).toBeVisible();
    await expect(this.successMessage).toContainText('Twój wniosek adopcyjny');
  }
}
