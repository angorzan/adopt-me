import type { APIRoute } from "astro";
import { ZodError } from "zod";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { forgotPasswordCommandSchema } from "@/lib/validators/auth.validators";
import { AuthService } from "@/lib/services/auth.service";
import { isFeatureEnabled } from "@/features";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  // Feature flag check - return 404 if auth is disabled
  if (!isFeatureEnabled("auth")) {
    return new Response("Feature disabled", { status: 404 });
  }
  try {
    // 1. Parse request body
    const body = await request.json().catch(() => null);

    if (!body) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane wejściowe",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 2. Walidacja przez Zod
    const command = forgotPasswordCommandSchema.parse(body);

    // 3. Utworzenie Supabase server client
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // 4. Wywołanie AuthService
    const authService = new AuthService(supabase);
    await authService.forgotPassword(command.email);

    // 5. Zwrócenie sukcesu (nie ujawniamy czy email istnieje)
    return new Response(
      JSON.stringify({
        message: "Jeśli konto istnieje, link do resetowania hasła został wysłany",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Obsługa błędów walidacji Zod
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return new Response(
        JSON.stringify({
          error: firstError.message,
          details: error.flatten(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Obsługa błędów biznesowych (z AuthService)
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Błędy nieznane
    console.error("Forgot password error:", error);
    return new Response(
      JSON.stringify({
        error: "Wystąpił błąd serwera. Spróbuj ponownie później.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
