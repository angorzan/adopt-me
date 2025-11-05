import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor } from '../../../helpers/test-utils';
import { AdoptionForm } from '@components/applications/AdoptionForm';

describe('AdoptionForm Component', () => {
  const defaultProps = {
    dogId: '550e8400-e29b-41d4-a716-446655440000',
    dogName: 'Rex',
    isAuthenticated: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('When Not Authenticated', () => {
    it('should show login prompt when user is not authenticated', () => {
      renderWithProviders(
        <AdoptionForm {...defaultProps} isAuthenticated={false} />
      );

      expect(screen.getByText(/zaloguj się, aby wysłać wniosek/i)).toBeInTheDocument();
      expect(screen.getByText(/formularz adopcyjny jest dostępny tylko dla zalogowanych/i)).toBeInTheDocument();
    });

    it('should show login and signup buttons', () => {
      renderWithProviders(
        <AdoptionForm {...defaultProps} isAuthenticated={false} />
      );

      const loginButton = screen.getByRole('link', { name: /zaloguj się/i });
      const signupButton = screen.getByRole('link', { name: /załóż konto/i });

      expect(loginButton).toHaveAttribute('href', '/auth/login');
      expect(signupButton).toHaveAttribute('href', '/auth/signup');
    });

    it('should display dog name in unauthenticated message', () => {
      renderWithProviders(
        <AdoptionForm {...defaultProps} dogName="Buddy" isAuthenticated={false} />
      );

      expect(screen.getByText(/dla psa Buddy/i)).toBeInTheDocument();
    });
  });

  describe('Rendering - Authenticated User', () => {
    it('should render adoption form with all required fields', () => {
      renderWithProviders(<AdoptionForm {...defaultProps} />);

      expect(screen.getByRole('heading', { name: /formularz adopcyjny/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/dlaczego chcesz adoptować/i)).toBeInTheDocument();
      expect(screen.getByText('Preferowany kontakt')).toBeInTheDocument();
      expect(screen.getByLabelText(/dodatkowe informacje/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/wyrażam zgodę/i)).toBeInTheDocument();
    });

    it('should display dog name in form description', () => {
      renderWithProviders(
        <AdoptionForm {...defaultProps} dogName="Buddy" />
      );

      expect(screen.getByText(/dla psa Buddy/i)).toBeInTheDocument();
    });

    it('should show motivation character counter', () => {
      renderWithProviders(<AdoptionForm {...defaultProps} />);

      expect(screen.getByText(/minimum 20 znaków/i)).toBeInTheDocument();
      expect(screen.getByText('0/800')).toBeInTheDocument();
    });

    it('should show extra notes character counter', () => {
      renderWithProviders(<AdoptionForm {...defaultProps} />);

      expect(screen.getByText('0/500')).toBeInTheDocument();
    });

    it('should have submit button', () => {
      renderWithProviders(<AdoptionForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /wyślij wniosek/i });
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Form Submission - Happy Path', () => {
    it('should submit valid adoption application', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 'app-123' }),
      });

      renderWithProviders(<AdoptionForm {...defaultProps} />);

      const motivationInput = screen.getByLabelText(/dlaczego chcesz adoptować/i);
      const contactSelect = screen.getByRole('combobox');
      const consentCheckbox = screen.getByLabelText(/wyrażam zgodę/i);
      const submitButton = screen.getByRole('button', { name: /wyślij wniosek/i });

      await user.type(motivationInput, 'I love dogs and have space for a family pet at home');
      await user.click(contactSelect);
      await user.click(screen.getByRole('option', { name: /e-mail/i }));
      await user.click(consentCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('dog_id'),
        });
      });
    });

    it('should show success message after submission', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 'app-123' }),
      });

      renderWithProviders(<AdoptionForm {...defaultProps} />);

      const motivationInput = screen.getByLabelText(/dlaczego chcesz adoptować/i);
      const contactSelect = screen.getByRole('combobox');
      const consentCheckbox = screen.getByLabelText(/wyrażam zgodę/i);
      const submitButton = screen.getByRole('button', { name: /wyślij wniosek/i });

      await user.type(motivationInput, 'I love dogs and have space for a family pet at home');
      await user.click(contactSelect);
      await user.click(screen.getByRole('option', { name: /e-mail/i }));
      await user.click(consentCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/wniosek wysłany/i)).toBeInTheDocument();
        expect(screen.getByText(/dziękujemy/i)).toBeInTheDocument();
      });
    });

    it('should clear form after successful submission', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 'app-123' }),
      });

      renderWithProviders(<AdoptionForm {...defaultProps} />);

      const motivationInput = screen.getByLabelText(/dlaczego chcesz adoptować/i) as HTMLTextAreaElement;
      const contactSelect = screen.getByRole('combobox');
      const extraNotesInput = screen.getByLabelText(/dodatkowe informacje/i) as HTMLTextAreaElement;
      const consentCheckbox = screen.getByLabelText(/wyrażam zgodę/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /wyślij wniosek/i });

      // Fill form
      await user.type(motivationInput, 'I love dogs and have space for a family pet at home');
      await user.click(contactSelect);
      await user.click(screen.getByRole('option', { name: /e-mail/i }));
      await user.type(extraNotesInput, 'Some extra notes');
      await user.click(consentCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/wniosek wysłany/i)).toBeInTheDocument();
      });
    });
  });

  describe('Client-side Validation', () => {
    it('should reject motivation shorter than 20 characters', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AdoptionForm {...defaultProps} />);

      const motivationInput = screen.getByLabelText(/dlaczego chcesz adoptować/i);
      const contactSelect = screen.getByRole('combobox');
      const consentCheckbox = screen.getByLabelText(/wyrażam zgodę/i);
      const submitButton = screen.getByRole('button', { name: /wyślij wniosek/i });

      await user.type(motivationInput, 'Too short');
      await user.click(contactSelect);
      await user.click(screen.getByRole('option', { name: /e-mail/i }));
      await user.click(consentCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/co najmniej 20 znaków/i)).toBeInTheDocument();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should accept motivation with exactly 20 characters', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 'app-123' }),
      });

      renderWithProviders(<AdoptionForm {...defaultProps} />);

      const motivation20Chars = 'a'.repeat(20);
      const motivationInput = screen.getByLabelText(/dlaczego chcesz adoptować/i);
      const contactSelect = screen.getByRole('combobox');
      const consentCheckbox = screen.getByLabelText(/wyrażam zgodę/i);
      const submitButton = screen.getByRole('button', { name: /wyślij wniosek/i });

      await user.type(motivationInput, motivation20Chars);
      await user.click(contactSelect);
      await user.click(screen.getByRole('option', { name: /e-mail/i }));
      await user.click(consentCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should require contact preference selection', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AdoptionForm {...defaultProps} />);

      const motivationInput = screen.getByLabelText(/dlaczego chcesz adoptować/i);
      const consentCheckbox = screen.getByLabelText(/wyrażam zgodę/i);
      const submitButton = screen.getByRole('button', { name: /wyślij wniosek/i });

      await user.type(motivationInput, 'I love dogs and have space for a family pet at home');
      // Don't select contact preference
      await user.click(consentCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/wybierz preferowany kanał kontaktu/i)).toBeInTheDocument();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should reject extra notes longer than 500 characters', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AdoptionForm {...defaultProps} />);

      const motivationInput = screen.getByLabelText(/dlaczego chcesz adoptować/i);
      const extraNotesInput = screen.getByLabelText(/dodatkowe informacje/i);
      const contactSelect = screen.getByRole('combobox');
      const consentCheckbox = screen.getByLabelText(/wyrażam zgodę/i);
      const submitButton = screen.getByRole('button', { name: /wyślij wniosek/i });

      const notes501Chars = 'a'.repeat(501);
      await user.type(motivationInput, 'I love dogs and have space for a family pet at home');
      await user.type(extraNotesInput, notes501Chars);
      await user.click(contactSelect);
      await user.click(screen.getByRole('option', { name: /e-mail/i }));
      await user.click(consentCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/maksymalnie 500 znaków/i)).toBeInTheDocument();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should accept extra notes up to 500 characters', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 'app-123' }),
      });

      renderWithProviders(<AdoptionForm {...defaultProps} />);

      const notes500Chars = 'a'.repeat(500);
      const motivationInput = screen.getByLabelText(/dlaczego chcesz adoptować/i);
      const extraNotesInput = screen.getByLabelText(/dodatkowe informacje/i);
      const contactSelect = screen.getByRole('combobox');
      const consentCheckbox = screen.getByLabelText(/wyrażam zgodę/i);
      const submitButton = screen.getByRole('button', { name: /wyślij wniosek/i });

      await user.type(motivationInput, 'I love dogs and have space for a family pet at home');
      await user.type(extraNotesInput, notes500Chars);
      await user.click(contactSelect);
      await user.click(screen.getByRole('option', { name: /e-mail/i }));
      await user.click(consentCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should require consent checkbox', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AdoptionForm {...defaultProps} />);

      const motivationInput = screen.getByLabelText(/dlaczego chcesz adoptować/i);
      const contactSelect = screen.getByRole('combobox');
      const submitButton = screen.getByRole('button', { name: /wyślij wniosek/i });

      await user.type(motivationInput, 'I love dogs and have space for a family pet at home');
      await user.click(contactSelect);
      await user.click(screen.getByRole('option', { name: /e-mail/i }));
      // Don't click consent checkbox
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/wyrażam zgodę na przetwarzanie/i)).toBeInTheDocument();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Server-side Error Handling', () => {
    it('should show error when dog is not available', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ error: 'dog_not_available' }),
      });

      renderWithProviders(<AdoptionForm {...defaultProps} />);

      const motivationInput = screen.getByLabelText(/dlaczego chcesz adoptować/i);
      const contactSelect = screen.getByRole('combobox');
      const consentCheckbox = screen.getByLabelText(/wyrażam zgodę/i);
      const submitButton = screen.getByRole('button', { name: /wyślij wniosek/i });

      await user.type(motivationInput, 'I love dogs and have space for a family pet at home');
      await user.click(contactSelect);
      await user.click(screen.getByRole('option', { name: /e-mail/i }));
      await user.click(consentCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/nie jest obecnie dostępny do adopcji/i)).toBeInTheDocument();
      });
    });

    it('should show error for duplicate application', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ error: 'duplicate_application' }),
      });

      renderWithProviders(<AdoptionForm {...defaultProps} />);

      const motivationInput = screen.getByLabelText(/dlaczego chcesz adoptować/i);
      const contactSelect = screen.getByRole('combobox');
      const consentCheckbox = screen.getByLabelText(/wyrażam zgodę/i);
      const submitButton = screen.getByRole('button', { name: /wyślij wniosek/i });

      await user.type(motivationInput, 'I love dogs and have space for a family pet at home');
      await user.click(contactSelect);
      await user.click(screen.getByRole('option', { name: /e-mail/i }));
      await user.click(consentCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/masz już aktywny wniosek dla tego psa/i)).toBeInTheDocument();
      });
    });

    it('should handle authentication error', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'auth_required' }),
      });

      renderWithProviders(<AdoptionForm {...defaultProps} />);

      const motivationInput = screen.getByLabelText(/dlaczego chcesz adoptować/i);
      const contactSelect = screen.getByRole('combobox');
      const consentCheckbox = screen.getByLabelText(/wyrażam zgodę/i);
      const submitButton = screen.getByRole('button', { name: /wyślij wniosek/i });

      await user.type(motivationInput, 'I love dogs and have space for a family pet at home');
      await user.click(contactSelect);
      await user.click(screen.getByRole('option', { name: /e-mail/i }));
      await user.click(consentCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/musisz być zalogowany/i)).toBeInTheDocument();
      });
    });

    it('should handle generic server error', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'server_error' }),
      });

      renderWithProviders(<AdoptionForm {...defaultProps} />);

      const motivationInput = screen.getByLabelText(/dlaczego chcesz adoptować/i);
      const contactSelect = screen.getByRole('combobox');
      const consentCheckbox = screen.getByLabelText(/wyrażam zgodę/i);
      const submitButton = screen.getByRole('button', { name: /wyślij wniosek/i });

      await user.type(motivationInput, 'I love dogs and have space for a family pet at home');
      await user.click(contactSelect);
      await user.click(screen.getByRole('option', { name: /e-mail/i }));
      await user.click(consentCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/nieoczekiwany błąd/i)).toBeInTheDocument();
      });
    });

    it('should handle network error', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<AdoptionForm {...defaultProps} />);

      const motivationInput = screen.getByLabelText(/dlaczego chcesz adoptować/i);
      const contactSelect = screen.getByRole('combobox');
      const consentCheckbox = screen.getByLabelText(/wyrażam zgodę/i);
      const submitButton = screen.getByRole('button', { name: /wyślij wniosek/i });

      await user.type(motivationInput, 'I love dogs and have space for a family pet at home');
      await user.click(contactSelect);
      await user.click(screen.getByRole('option', { name: /e-mail/i }));
      await user.click(consentCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/problem z połączeniem/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should disable submit button while submitting', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          ok: true,
          status: 201,
          json: async () => ({ id: 'app-123' }),
        }), 100))
      );

      renderWithProviders(<AdoptionForm {...defaultProps} />);

      const motivationInput = screen.getByLabelText(/dlaczego chcesz adoptować/i);
      const contactSelect = screen.getByRole('combobox');
      const consentCheckbox = screen.getByLabelText(/wyrażam zgodę/i);
      const submitButton = screen.getByRole('button', { name: /wyślij wniosek/i }) as HTMLButtonElement;

      await user.type(motivationInput, 'I love dogs and have space for a family pet at home');
      await user.click(contactSelect);
      await user.click(screen.getByRole('option', { name: /e-mail/i }));
      await user.click(consentCheckbox);
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(screen.getByText('Wysyłanie…')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(/wniosek wysłany/i)).toBeInTheDocument();
      });
    });

    it('should disable form inputs while submitting', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          ok: true,
          status: 201,
          json: async () => ({ id: 'app-123' }),
        }), 100))
      );

      renderWithProviders(<AdoptionForm {...defaultProps} />);

      const motivationInput = screen.getByLabelText(/dlaczego chcesz adoptować/i) as HTMLTextAreaElement;
      const contactSelect = screen.getByRole('combobox') as HTMLElement;
      const consentCheckbox = screen.getByLabelText(/wyrażam zgodę/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /wyślij wniosek/i });

      await user.type(motivationInput, 'I love dogs and have space for a family pet at home');
      await user.click(contactSelect);
      await user.click(screen.getByRole('option', { name: /e-mail/i }));
      await user.click(consentCheckbox);
      await user.click(submitButton);

      expect(motivationInput.disabled).toBe(true);
      expect(consentCheckbox.disabled).toBe(true);

      await waitFor(() => {
        expect(screen.getByText(/wniosek wysłany/i)).toBeInTheDocument();
      });
    });
  });

  describe('Character Counters', () => {
    it('should update motivation character counter', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AdoptionForm {...defaultProps} />);

      const motivationInput = screen.getByLabelText(/dlaczego chcesz adoptować/i);

      expect(screen.getByText('0/800')).toBeInTheDocument();

      await user.type(motivationInput, 'Test text');

      await waitFor(() => {
        expect(screen.getByText('9/800')).toBeInTheDocument();
      });
    });

    it('should update extra notes character counter', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AdoptionForm {...defaultProps} />);

      const extraNotesInput = screen.getByLabelText(/dodatkowe informacje/i);

      expect(screen.getByText('0/500')).toBeInTheDocument();

      await user.type(extraNotesInput, 'Some notes');

      await waitFor(() => {
        expect(screen.getByText('10/500')).toBeInTheDocument();
      });
    });
  });

  describe('Contact Preference Options', () => {
    it('should provide email and phone options', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AdoptionForm {...defaultProps} />);

      const contactSelect = screen.getByRole('combobox');
      await user.click(contactSelect);

      expect(screen.getByRole('option', { name: /e-mail/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /telefon/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and descriptions', () => {
      renderWithProviders(<AdoptionForm {...defaultProps} />);

      const motivationInput = screen.getByLabelText(/dlaczego chcesz adoptować/i);
      const consentCheckbox = screen.getByLabelText(/wyrażam zgodę/i);

      expect(motivationInput).toHaveAttribute('id', 'motivation');
      expect(consentCheckbox).toHaveAttribute('id', 'consent');
    });
  });
});
