import type { APIContext } from 'astro';

export const prerender = false;

/**
 * GET /api/v1/cities
 * Returns a list of unique cities where shelters with available dogs are located
 */
export async function GET(ctx: APIContext): Promise<Response> {
  try {
    const { supabase } = ctx.locals;

    // Get unique cities from shelters that have available dogs
    const { data: shelters, error } = await supabase
      .from('shelters')
      .select('city, dogs!inner(adoption_status)')
      .eq('dogs.adoption_status', 'available');

    if (error) {
      console.error('Failed to fetch cities:', error);
      return new Response(
        JSON.stringify({ error: 'server_error', message: 'Failed to fetch cities' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Extract unique city names and sort alphabetically
    const uniqueCities = [...new Set(shelters?.map(s => s.city) || [])].sort();

    return new Response(
      JSON.stringify(uniqueCities),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Unexpected error in GET /api/v1/cities:', error);
    return new Response(
      JSON.stringify({ error: 'server_error', message: 'Unexpected error occurred' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

