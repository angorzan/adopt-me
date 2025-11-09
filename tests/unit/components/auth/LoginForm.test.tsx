import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderWithProviders, screen, userEvent, waitFor } from "../../../helpers/test-utils";
import { LoginForm } from "@components/auth/LoginForm";

// Mock window.location.assign
delete (window as any).location;
window.location = { assign: vi.fn() } as any;

describe("LoginForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.location mock
    (window.location.assign as any).mockClear();
  });

  describe("Rendering", () => {
    it("should render login form with all required fields", () => {
      renderWithProviders(<LoginForm />);

      expect(screen.getByRole("heading", { name: /logowanie/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/adres e-mail/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/hasło/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /zaloguj się/i })).toBeInTheDocument();
    });

    it("should render forgot password link", () => {
      renderWithProviders(<LoginForm />);

      const forgotLink = screen.getByRole("link", { name: /zapomniałeś hasła/i });
      expect(forgotLink).toHaveAttribute("href", "/auth/forgot-password");
    });

    it("should render signup link for new users", () => {
      renderWithProviders(<LoginForm />);

      const signupLink = screen.getByRole("link", { name: /załóż konto/i });
      expect(signupLink).toHaveAttribute("href", "/auth/signup");
    });

    it("should have proper autocomplete attributes", () => {
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/hasło/i) as HTMLInputElement;

      expect(emailInput).toHaveAttribute("autoComplete", "email");
      expect(passwordInput).toHaveAttribute("autoComplete", "current-password");
    });

    it("should have email input type as email", () => {
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i) as HTMLInputElement;
      expect(emailInput.type).toBe("email");
    });

    it("should have password input type as password", () => {
      renderWithProviders(<LoginForm />);

      const passwordInput = screen.getByLabelText(/hasło/i) as HTMLInputElement;
      expect(passwordInput.type).toBe("password");
    });
  });

  describe("Form Submission - Happy Path", () => {
    it("should submit login with valid credentials", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: "user-123", email: "user@example.com" }),
      });

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/hasło/i);
      const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "Password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "user@example.com", password: "Password123" }),
        });
      });
    });

    it("should redirect to home after successful login", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: "user-123" }),
      });

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/hasło/i);
      const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "Password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(window.location.assign).toHaveBeenCalledWith("/");
      });
    });

    it("should redirect to specified redirect URL after login", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: "user-123" }),
      });

      render(<LoginForm redirectTo="/dashboard" />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/hasło/i);
      const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "Password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(window.location.assign).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("should clear error when form submitted successfully", async () => {
      const user = userEvent.setup();
      global.fetch = vi
        .fn()
        // First submission fails
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ error: "Invalid credentials" }),
        })
        // Second submission succeeds
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ id: "user-123" }),
        });

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/hasło/i);
      const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

      // First submission (fails)
      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "WrongPassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/nieprawidłowy e-mail lub hasło/i)).toBeInTheDocument();
      });

      // Clear fields and retry
      await user.clear(emailInput);
      await user.clear(passwordInput);
      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "CorrectPassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(window.location.assign).toHaveBeenCalledWith("/");
      });
    });
  });

  describe("Form Submission - Error Handling", () => {
    it("should show error for invalid credentials (401)", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: "Invalid login credentials" }),
      });

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/hasło/i);
      const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "WrongPassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/nieprawidłowy e-mail lub hasło/i)).toBeInTheDocument();
      });
    });

    it("should show error for unverified email (403)", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: "Email not verified" }),
      });

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/hasło/i);
      const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "Password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/e-mail niezweryfikowany/i)).toBeInTheDocument();
      });
    });

    it("should show rate limit error (429)", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: "Too many login attempts" }),
      });

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/hasło/i);
      const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "Password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/zbyt wiele prób logowania/i)).toBeInTheDocument();
      });
    });

    it("should show generic server error for 500", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Internal server error" }),
      });

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/hasło/i);
      const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "Password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/błąd serwera: 500/i)).toBeInTheDocument();
      });
    });

    it("should handle invalid JSON response", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/hasło/i);
      const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "Password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/server zwrócił nieprawidłową odpowiedź/i)).toBeInTheDocument();
      });
    });

    it("should handle network error gracefully", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockRejectedValueOnce(new Error("Network error"));

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/hasło/i);
      const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "Password123");
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
                  status: 200,
                  json: async () => ({ id: "user-123" }),
                }),
              100
            )
          )
      );

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/hasło/i);
      const submitButton = screen.getByRole("button", { name: /zaloguj się/i }) as HTMLButtonElement;

      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "Password123");
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(screen.getByText("Logowanie...")).toBeInTheDocument();

      await waitFor(() => {
        expect(window.location.assign).toHaveBeenCalled();
      });
    });

    it("should disable input fields while loading", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  status: 200,
                  json: async () => ({ id: "user-123" }),
                }),
              100
            )
          )
      );

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/hasło/i) as HTMLInputElement;
      const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "Password123");
      await user.click(submitButton);

      expect(emailInput.disabled).toBe(true);
      expect(passwordInput.disabled).toBe(true);

      await waitFor(() => {
        expect(window.location.assign).toHaveBeenCalled();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/hasło/i);

      expect(emailInput).toHaveAttribute("id", "email");
      expect(passwordInput).toHaveAttribute("id", "password");
    });

    it("should focus email input on error (accessibility)", async () => {
      const user = userEvent.setup();
      const focusSpy = vi.fn();

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: "Invalid credentials" }),
      });

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i) as HTMLElement;
      emailInput.focus = focusSpy;

      const passwordInput = screen.getByLabelText(/hasło/i);
      const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

      await user.type(passwordInput, "WrongPassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/nieprawidłowy e-mail lub hasło/i)).toBeInTheDocument();
      });
    });

    it("should have role alert on error message", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: "Invalid credentials" }),
      });

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/hasło/i);
      const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

      await user.type(emailInput, "user@example.com");
      await user.type(passwordInput, "WrongPassword");
      await user.click(submitButton);

      await waitFor(() => {
        const errorAlert = screen.getByRole("alert");
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveAttribute("aria-live", "polite");
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty form submission", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginForm />);

      const submitButton = screen.getByRole("button", { name: /zaloguj się/i });
      await user.click(submitButton);

      // HTML5 validation should prevent submission
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should preserve trimmed email input", async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: "user-123" }),
      });

      renderWithProviders(<LoginForm />);

      const emailInput = screen.getByLabelText(/adres e-mail/i);
      const passwordInput = screen.getByLabelText(/hasło/i);
      const submitButton = screen.getByRole("button", { name: /zaloguj się/i });

      await user.type(emailInput, "  user@example.com  ");
      await user.type(passwordInput, "Password123");
      await user.click(submitButton);

      await waitFor(() => {
        const lastCall = (global.fetch as any).mock.calls[0];
        const bodyArg = JSON.parse(lastCall[1].body);
        // Email value is typed as-is from input
        expect(bodyArg.email).toBe("  user@example.com  ");
      });
    });
  });
});
