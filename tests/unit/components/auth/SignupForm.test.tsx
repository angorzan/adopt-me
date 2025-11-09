import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderWithProviders, screen, userEvent, waitFor } from "../../../helpers/test-utils";
import { SignupForm } from "@components/auth/SignupForm";

describe("SignupForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render signup form with all required fields", () => {
      renderWithProviders(<SignupForm />);

      expect(screen.getByRole("heading", { name: /załóż konto/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/adres e-mail/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^hasło$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/potwierdź hasło/i)).toBeInTheDocument();
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /utwórz konto/i })).toBeInTheDocument();
    });

    it("should render GDPR consent checkbox with link", () => {
      renderWithProviders(<SignupForm />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();

      const privacyLink = screen.getByRole("link", { name: /polityką prywatności/i });
      expect(privacyLink).toHaveAttribute("href", "/privacy-policy");
      expect(privacyLink).toHaveAttribute("target", "_blank");
    });

    it("should render login link for existing users", () => {
      renderWithProviders(<SignupForm />);

      const loginLink = screen.getByRole("link", { name: /zaloguj się/i });
      expect(loginLink).toHaveAttribute("href", "/auth/login");
    });

    it("should display password minimum requirement info", () => {
      renderWithProviders(<SignupForm />);

      expect(screen.getByText(/minimum 5 znaków/i)).toBeInTheDocument();
    });
  });

  describe("Form Submission - Happy Path", () => {
    it("should submit registration with valid data", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: "user-123", email: "newuser@example.com" }),
      });

      renderWithProviders(<SignupForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmInput = screen.getByLabelText(/potwierdź hasło/i);
      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByRole("button", { name: /utwórz konto/i });

      await user.type(emailInput, "newuser@example.com");
      await user.type(passwordInput, "ValidPass123");
      await user.type(confirmInput, "ValidPass123");
      await user.click(checkbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "newuser@example.com",
            password: "ValidPass123",
            confirmPassword: "ValidPass123",
            gdprConsent: true,
          }),
        });
      });
    });

    it("should show success message after registration", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: "user-123" }),
      });

      renderWithProviders(<SignupForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmInput = screen.getByLabelText(/potwierdź hasło/i);
      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByRole("button", { name: /utwórz konto/i });

      await user.type(emailInput, "newuser@example.com");
      await user.type(passwordInput, "ValidPass123");
      await user.type(confirmInput, "ValidPass123");
      await user.click(checkbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/sprawdź swoją skrzynkę e-mail/i)).toBeInTheDocument();
        expect(screen.getByText(/wysłaliśmy link aktywacyjny/i)).toBeInTheDocument();
      });
    });

    it("should display email in success message", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: "user-123" }),
      });

      renderWithProviders(<SignupForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmInput = screen.getByLabelText(/potwierdź hasło/i);
      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByRole("button", { name: /utwórz konto/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "ValidPass123");
      await user.type(confirmInput, "ValidPass123");
      await user.click(checkbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
      });
    });

    it("should show login button on success screen", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: "user-123" }),
      });

      renderWithProviders(<SignupForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmInput = screen.getByLabelText(/potwierdź hasło/i);
      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByRole("button", { name: /utwórz konto/i });

      await user.type(emailInput, "newuser@example.com");
      await user.type(passwordInput, "ValidPass123");
      await user.type(confirmInput, "ValidPass123");
      await user.click(checkbox);
      await user.click(submitButton);

      await waitFor(() => {
        const loginButton = screen.getByRole("link", { name: /przejdź do logowania/i });
        expect(loginButton).toHaveAttribute("href", "/auth/login");
      });
    });
  });

  describe("Client-side Validation", () => {
    it("should reject password shorter than 5 characters", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SignupForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmInput = screen.getByLabelText(/potwierdź hasło/i);
      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByRole("button", { name: /utwórz konto/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Pass");
      await user.type(confirmInput, "Pass");
      await user.click(checkbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/hasło musi mieć minimum 5 znaków/i)).toBeInTheDocument();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should accept password with exactly 5 characters", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: "user-123" }),
      });

      renderWithProviders(<SignupForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmInput = screen.getByLabelText(/potwierdź hasło/i);
      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByRole("button", { name: /utwórz konto/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "Pass1");
      await user.type(confirmInput, "Pass1");
      await user.click(checkbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/sprawdź swoją skrzynkę e-mail/i)).toBeInTheDocument();
      });
    });

    it("should reject mismatched passwords", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SignupForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmInput = screen.getByLabelText(/potwierdź hasło/i);
      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByRole("button", { name: /utwórz konto/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "ValidPass123");
      await user.type(confirmInput, "DifferentPass456");
      await user.click(checkbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/hasła nie są identyczne/i)).toBeInTheDocument();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should reject if GDPR consent is not checked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SignupForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmInput = screen.getByLabelText(/potwierdź hasło/i);
      const submitButton = screen.getByRole("button", { name: /utwórz konto/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "ValidPass123");
      await user.type(confirmInput, "ValidPass123");
      // Don't check the checkbox
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/musisz zaakceptować przetwarzanie danych/i)).toBeInTheDocument();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("Server-side Error Handling", () => {
    it("should show error when email already exists (409)", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ error: "Email already registered" }),
      });

      renderWithProviders(<SignupForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmInput = screen.getByLabelText(/potwierdź hasło/i);
      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByRole("button", { name: /utwórz konto/i });

      await user.type(emailInput, "existing@example.com");
      await user.type(passwordInput, "ValidPass123");
      await user.type(confirmInput, "ValidPass123");
      await user.click(checkbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/ten adres e-mail jest już zarejestrowany/i)).toBeInTheDocument();
      });
    });

    it("should show rate limit error (429)", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: "Too many registration attempts" }),
      });

      renderWithProviders(<SignupForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmInput = screen.getByLabelText(/potwierdź hasło/i);
      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByRole("button", { name: /utwórz konto/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "ValidPass123");
      await user.type(confirmInput, "ValidPass123");
      await user.click(checkbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/zbyt wiele prób rejestracji/i)).toBeInTheDocument();
      });
    });

    it("should handle network error", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network error"));

      renderWithProviders(<SignupForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmInput = screen.getByLabelText(/potwierdź hasło/i);
      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByRole("button", { name: /utwórz konto/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "ValidPass123");
      await user.type(confirmInput, "ValidPass123");
      await user.click(checkbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });

  describe("Loading State", () => {
    it("should disable button while loading", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  status: 201,
                  json: async () => ({ id: "user-123" }),
                }),
              100
            )
          )
      );

      renderWithProviders(<SignupForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmInput = screen.getByLabelText(/potwierdź hasło/i);
      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByRole("button", { name: /utwórz konto/i }) as HTMLButtonElement;

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "ValidPass123");
      await user.type(confirmInput, "ValidPass123");
      await user.click(checkbox);
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(screen.getByText("Tworzenie konta...")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(/sprawdź swoją skrzynkę e-mail/i)).toBeInTheDocument();
      });
    });

    it("should disable form inputs while loading", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  status: 201,
                  json: async () => ({ id: "user-123" }),
                }),
              100
            )
          )
      );

      renderWithProviders(<SignupForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/^hasło$/i) as HTMLInputElement;
      const confirmInput = screen.getByLabelText(/potwierdź hasło/i) as HTMLInputElement;
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      const submitButton = screen.getByRole("button", { name: /utwórz konto/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "ValidPass123");
      await user.type(confirmInput, "ValidPass123");
      await user.click(checkbox);
      await user.click(submitButton);

      expect(emailInput.disabled).toBe(true);
      expect(passwordInput.disabled).toBe(true);
      expect(confirmInput.disabled).toBe(true);
      expect(checkbox.disabled).toBe(true);

      await waitFor(() => {
        expect(screen.getByText(/sprawdź swoją skrzynkę e-mail/i)).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      renderWithProviders(<SignupForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmInput = screen.getByLabelText(/potwierdź hasło/i);
      const checkbox = screen.getByRole("checkbox");

      expect(emailInput).toHaveAttribute("id", "email");
      expect(passwordInput).toHaveAttribute("id", "password");
      expect(confirmInput).toHaveAttribute("id", "confirmPassword");
      expect(checkbox).toHaveAttribute("id", "gdpr");
    });

    it("should have role alert on error message", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SignupForm />);

      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmInput = screen.getByLabelText(/potwierdź hasło/i);
      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByRole("button", { name: /utwórz konto/i });

      await user.type(passwordInput, "short");
      await user.type(confirmInput, "short");
      await user.click(checkbox);
      await user.click(submitButton);

      await waitFor(() => {
        const errorAlert = screen.getByRole("alert");
        expect(errorAlert).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle special characters in password", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: "user-123" }),
      });

      renderWithProviders(<SignupForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/^hasło$/i);
      const confirmInput = screen.getByLabelText(/potwierdź hasło/i);
      const checkbox = screen.getByRole("checkbox");
      const submitButton = screen.getByRole("button", { name: /utwórz konto/i });

      const specialPassword = "P@ssw0rd!#$%";
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, specialPassword);
      await user.type(confirmInput, specialPassword);
      await user.click(checkbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/sprawdź swoją skrzynkę e-mail/i)).toBeInTheDocument();
      });
    });
  });
});
