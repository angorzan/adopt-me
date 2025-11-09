import type { APIRoute } from "astro";
import type { Database } from "../../../db/database.types";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const GET: APIRoute = async ({ cookies, request }) => {
  try {
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Fetch only shelters that have available dogs
    const { data: shelters, error } = await supabase
      .from("shelters")
      .select(
        `
        id,
        name,
        dogs!inner (
          id
        )
      `
      )
      .eq("dogs.adoption_status", "available")
      .order("name");

    // Remove duplicates and unwanted fields
    const uniqueShelters =
      shelters?.reduce(
        (acc, shelter) => {
          if (!acc.some((s) => s.id === shelter.id)) {
            const { dogs, ...rest } = shelter;
            acc.push(rest);
          }
          return acc;
        },
        [] as { id: string; name: string }[]
      ) ?? [];

    if (error) {
      console.error("Error fetching shelters:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch shelters" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(uniqueShelters), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in /api/v1/shelters:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
