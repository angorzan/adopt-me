import type { APIRoute } from "astro";
import { ZodError } from "zod";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { loginCommandSchema } from "@/lib/validators/auth.validators";
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
    const command = loginCommandSchema.parse(body);

    // 3. Utworzenie Supabase server client
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // 4. Wywołanie AuthService
    const authService = new AuthService(supabase);
    const { session, user } = await authService.login(command);

    // 5. Zwrócenie pełnej odpowiedzi (cookies są już ustawione przez @supabase/ssr)
    return new Response(
      JSON.stringify({
        user,
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
        },
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
      // Sprawdzenie typu błędu dla odpowiedniego status code
      let statusCode = 500;

      if (error.message.includes("Nieprawidłowy e-mail lub hasło")) {
        statusCode = 401;
      } else if (error.message.includes("E-mail niezweryfikowany")) {
        statusCode = 403;
      } else if (error.message.includes("Zbyt wiele prób")) {
        statusCode = 429;
      }

      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: statusCode,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Błędy nieznane
    return new Response(
      JSON.stringify({
        error: "Wystąpił błąd serwera. Spróbuj ponownie później.",
        debug: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
