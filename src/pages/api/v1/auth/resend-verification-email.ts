import type { APIRoute } from "astro";
import { ZodError, z } from "zod";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { AuthService } from "@/lib/services/auth.service";
import { isFeatureEnabled } from "@/features";

export const prerender = false;

const resendVerificationSchema = z.object({
  email: z.string().email("Nieprawidłowy adres e-mail"),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  // Feature flag check - return 404 if auth is disabled
  if (!isFeatureEnabled("auth")) {
    return new Response("Feature disabled", { status: 404 });
  }
  try {
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

    const data = resendVerificationSchema.parse(body);

    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    const authService = new AuthService(supabase);
    try {
      await authService.resendVerificationEmail(data.email);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      console.log("Resend email error:", errorMsg);
      // Nie przerywamy - mogą być błędy z Supabase ale email mógł być wysłany
    }

    return new Response(
      JSON.stringify({
        message: "Mail weryfikacyjny został wysłany. Sprawdź swoją skrzynkę e-mail.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
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

    if (error instanceof Error) {
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.error("Resend verification error:", error);
    return new Response(
      JSON.stringify({
        error: "Nie udało się wysłać maila weryfikacyjnego. Spróbuj ponownie później.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
