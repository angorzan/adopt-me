import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { isFeatureEnabled } from "@/features";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  // Feature flag check - return 404 if auth is disabled
  if (!isFeatureEnabled("auth")) {
    return new Response("Feature disabled", { status: 404 });
  }
  try {
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Wyloguj użytkownika
    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({
          error: "Nie udało się wylogować",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Wylogowano pomyślnie",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (_error) {
    return new Response(
      JSON.stringify({
        error: "Nie udało się wylogować. Spróbuj ponownie później.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
