import type { MiddlewareHandler } from "astro";
import type { DTO } from "@/types";
import { supabaseClient, createSupabaseServerInstance } from "../db/supabase.client";

interface AuthLocals {
  supabase: typeof supabaseClient;
  user?: DTO.UserResponse;
  session?: {
    accessToken: string;
    refreshToken: string;
  };
}

export const onRequest: MiddlewareHandler = async ({ locals, cookies, request }, next) => {
  const authLocals = locals as AuthLocals;

  // Attach legacy client for non-auth operations
  authLocals.supabase = supabaseClient;

  // Create SSR-aware Supabase client for auth
  const supabaseSSR = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  try {
    // Get user session from cookies (managed by @supabase/ssr)
    const {
      data: { user: authUser },
      error: _error,
    } = await supabaseSSR.auth.getUser();

    if (authUser && !_error) {
      // Fetch full user data from users table
      const { data: userData, error: userError } = await supabaseClient
        .from("users")
        .select("id, email, role, shelter_id, created_at, updated_at")
        .eq("id", authUser.id)
        .single();

      if (userData && !userError) {
        authLocals.user = userData;

        // Note: Session tokens are managed by @supabase/ssr in cookies
        // We don't need to manually store them in context.locals
      }
    }
  } catch (_error) {
    // Log error but don't block request
  }

  return next();
};
