import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "@/db/supabase.client";

export const onRequest = defineMiddleware(async (context, next) => {
  try {
    // Pobierz lub utwórz Supabase client z cookies
    const supabase = createSupabaseServerInstance({
      cookies: context.cookies,
      headers: context.request.headers,
    });

    // Pobierz aktualną sesję
    const {
      data: { session },
      error: _error,
    } = await supabase.auth.getSession();

    if (session?.user) {
      // Jeśli user jest zalogowany, pobierz jego dane z tabeli users
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, email, role, shelter_id, created_at, updated_at")
        .eq("id", session.user.id)
        .single();

      if (userData && !userError) {
        // Ustaw user w Astro.locals
        context.locals.user = userData;
      } else {
        context.locals.user = null;
      }
    } else {
      // Brak sesji - user nie jest zalogowany
      context.locals.user = null;
    }
  } catch (_err) {
    context.locals.user = null;
  }

  return next();
});
