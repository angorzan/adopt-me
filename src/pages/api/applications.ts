import type { APIContext } from 'astro';
import { ApplicationCreateSchema } from '@/lib/validators/application';
import { createApplication } from '@/lib/services/adoptionService';

export const prerender = false;

/**
 * POST /api/v1/applications
 * Creates a new adoption application
 */
export async function POST(ctx: APIContext) {
  try {
    const { supabase } = ctx.locals;

    // 1. Parse and validate request body
    const body = await ctx.request.json();
    const result = ApplicationCreateSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error.flatten() }),
        { status: 400 }
      );
    }

    // 2. Create application
    const response = await createApplication(supabase, result.data);

    if ('error' in response) {
      const status = response.error === 'server_error' ? 500
        : response.error === 'dog_not_available' ? 404
        : 409;

      return new Response(
        JSON.stringify({ error: response.error }),
        { status }
      );
    }

    // 3. Return created application
    return new Response(
      JSON.stringify(response.data),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Failed to process application:', error);
    return new Response(
      JSON.stringify({ error: 'server_error' }),
      { status: 500 }
    );
  }
}