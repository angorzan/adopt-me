import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import type { DTO } from "@/types";
import type { LoginCommand, RegisterCommand } from "../validators/auth.validators";
import { getEnv } from "../utils/env";

export class AuthService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Logowanie użytkownika
   * @returns Sesja i pełne dane użytkownika z tabeli users
   * @throws Error jeśli dane nieprawidłowe lub email niezweryfikowany
   */
  async login(command: LoginCommand): Promise<{
    session: { access_token: string; refresh_token: string; expires_at: number };
    user: DTO.UserResponse;
  }> {
    // 1. Logowanie przez Supabase Auth
    const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
      email: command.email,
      password: command.password,
    });

    if (authError) {
      throw new Error(this.mapAuthError(authError.message));
    }

    if (!authData.user || !authData.session) {
      throw new Error("Nieprawidłowy e-mail lub hasło");
    }

    // 2. Pobranie pełnych danych użytkownika z tabeli users
    const { data: userData, error: userError } = await this.supabase
      .from("users")
      .select("id, email, role, shelter_id, created_at, updated_at")
      .eq("id", authData.user.id)
      .single();

    if (userError) {
      throw new Error("Nie udało się pobrać danych użytkownika");
    }

    if (!userData) {
      throw new Error("Nie udało się pobrać danych użytkownika");
    }

    return {
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at || 0,
      },
      user: userData,
    };
  }

  /**
   * Rejestracja użytkownika
   * @throws Error jeśli email już istnieje lub rejestracja się nie powiodła
   */
  async register(command: RegisterCommand): Promise<void> {
    // 1. Rejestracja przez Supabase Auth (automatycznie wysyła email weryfikacyjny)
    const appUrl = getEnv("PUBLIC_APP_URL") || "http://localhost:4323";
    const { data, error } = await this.supabase.auth.signUp({
      email: command.email,
      password: command.password,
      options: {
        emailRedirectTo: `${appUrl}/auth/verify-email`,
      },
    });

    if (error) {
      throw new Error(this.mapAuthError(error.message));
    }

    if (!data.user) {
      throw new Error("Rejestracja nie powiodła się");
    }

    // Uwaga: Trigger `handle_new_user` w bazie danych automatycznie utworzy rekord w tabeli users
    // z domyślną rolą 'adopter'
  }

  /**
   * Wylogowanie użytkownika
   */
  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      throw new Error("Wylogowanie nie powiodło się");
    }
  }

  /**
   * Inicjowanie resetowania hasła
   */
  async forgotPassword(email: string): Promise<void> {
    const appUrl = getEnv("PUBLIC_APP_URL") || "http://localhost:4323";
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/auth/reset-password`,
    });

    if (error) {
      // Celowo nie ujawniamy czy email istnieje (security best practice)
    }
  }

  /**
   * Resetowanie hasła z tokenem
   */
  async resetPassword(newPassword: string): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error("Nie udało się zmienić hasła. Token mógł wygasnąć.");
    }
  }

  /**
   * Ponowne wysłanie maila weryfikacyjnego
   */
  async resendVerificationEmail(email: string): Promise<void> {
    const appUrl = getEnv("PUBLIC_APP_URL") || "http://localhost:4323";

    // Wysyłamy magic link na email (signInWithOtp)
    // Supabase wyśle email niezależnie czy user istnieje czy nie
    const { error } = await this.supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${appUrl}/auth/verify-email`,
      },
    });

    if (error) {
      throw new Error(this.mapAuthError(error.message));
    }
  }

  /**
   * Mapowanie błędów Supabase Auth na user-friendly komunikaty
   */
  private mapAuthError(errorMessage: string): string {
    const errorMap: Record<string, string> = {
      "Invalid login credentials": "Nieprawidłowy e-mail lub hasło",
      "Email not confirmed": "Nieprawidłowy e-mail lub hasło",
      "User already registered": "Ten adres e-mail jest już zarejestrowany",
      "Email rate limit exceeded": "Zbyt wiele prób. Spróbuj ponownie za chwilę",
      "Password should be at least 6 characters": "Hasło musi mieć minimum 6 znaków",
    };

    // Szukamy czy message zawiera któryś z known errorów
    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.includes(key)) {
        return value;
      }
    }

    return "Wystąpił błąd. Spróbuj ponownie później.";
  }
}
