import type { APIContext } from "astro";
import type { DTO } from "@/types";
import { createSupabaseServerInstance } from "@/db/supabase.client";
import { isFeatureEnabled } from "@/features";

export const prerender = false;

/**
 * GET /api/v1/dogs
 * Returns a list of dogs available for adoption with optional filters
 * Query params:
 * - size: 'small' | 'medium' | 'large'
 * - age_category: 'puppy' | 'adult' | 'senior'
 * - q: search query (filters by dog name or shelter city)
 */
export async function GET(ctx: APIContext): Promise<Response> {
  // Feature flag check - return 404 if collections is disabled
  if (!isFeatureEnabled("collections")) {
    return new Response("Feature disabled", { status: 404 });
  }
  try {
    const supabase = createSupabaseServerInstance({
      cookies: ctx.cookies,
      headers: ctx.request.headers,
    });
    const url = new URL(ctx.request.url);

    // Extract query parameters
    const sizeFilter = url.searchParams.get("size");
    const ageCategoryFilter = url.searchParams.get("age_category");
    const searchQuery = url.searchParams.get("q");
    const cityFilter = url.searchParams.get("city");
    const shelterFilter = url.searchParams.get("shelter");

    // Build query - only fetch available dogs
    let query = supabase
      .from("dogs")
      .select(
        `
        *,
        shelters!inner (
          id,
          name,
          city,
          contact_email,
          contact_phone
        )
      `
      )
      .eq("adoption_status", "available");

    // Apply size filter
    if (sizeFilter && ["small", "medium", "large"].includes(sizeFilter)) {
      query = query.eq("size", sizeFilter);
    }

    // Apply age category filter
    if (ageCategoryFilter && ["puppy", "adult", "senior"].includes(ageCategoryFilter)) {
      query = query.eq("age_category", ageCategoryFilter);
    }

    // Apply search query (searches in dog name)
    if (searchQuery && searchQuery.trim()) {
      const searchTerm = searchQuery.trim();
      query = query.ilike("name", `%${searchTerm}%`);
    }

    // Apply city filter (filters by shelter city)
    if (cityFilter && cityFilter.trim()) {
      query = query.eq("shelters.city", cityFilter.trim());
    }

    // Apply shelter filter (filters by shelter name)
    if (shelterFilter && shelterFilter.trim()) {
      query = query.eq("shelters.name", shelterFilter.trim());
    }

    // Order by created_at descending (newest first)
    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      return new Response(JSON.stringify({ error: "server_error", message: "Failed to fetch dogs" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Transform data to match DTO.DogResponse format
    // The query includes shelters data in nested format, but we need flat structure
    const dogs: DTO.DogResponse[] = data.map((dog: Record<string, unknown>) => ({
      id: dog.id,
      name: dog.name,
      age_years: dog.age_years,
      age_category: dog.age_category,
      size: dog.size,
      temperament: dog.temperament,
      health: dog.health,
      adoption_status: dog.adoption_status,
      shelter_id: dog.shelter_id,
      created_at: dog.created_at,
      updated_at: dog.updated_at,
    }));

    return new Response(JSON.stringify(dogs), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (_error) {
    return new Response(JSON.stringify({ error: "server_error", message: "Unexpected error occurred" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
