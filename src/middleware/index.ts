/// <reference path="../env.d.ts" />
import type { MiddlewareHandler } from "astro";
import type { DTO } from "@/types";
import { supabaseClient, createSupabaseServerInstance } from "../db/supabase.client";

// Public paths that don't require authentication check
const PUBLIC_PATHS = [
  "/",
  "/dogs",
  "/auth/login",
  "/auth/register",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/auth/logout",
  "/api/v1/auth/login",
  "/api/v1/auth/register",
  "/api/v1/auth/logout",
  "/api/v1/auth/forgot-password",
  "/api/v1/auth/reset-password",
];

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
      error,
    } = await supabaseSSR.auth.getUser();

    if (authUser && !error) {
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
  } catch (error) {
    // Log error but don't block request
    console.error("Middleware auth error:", error);
  }

  return next();
};
