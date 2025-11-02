import type { APIRoute } from 'astro';
import { ZodError } from 'zod';
import { createSupabaseServerInstance } from '@/db/supabase.client';
import { registerCommandSchema } from '@/lib/validators/auth.validators';
import { AuthService } from '@/lib/services/auth.service';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return new Response(
        JSON.stringify({
          error: 'Nieprawidłowe dane wejściowe',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    const command = registerCommandSchema.parse(body);

    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    const authService = new AuthService(supabase);
    await authService.register(command);

    return new Response(
      JSON.stringify({
        message: 'Konto utworzone. Sprawdź swoją skrzynkę e-mail i potwierdź rejestrację.',
        email: command.email,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      },
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
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    if (error instanceof Error) {
      let statusCode = 500;

      if (error.message.includes('zarejestrowany') || error.message.includes('istnieje')) {
        statusCode = 409;
      } else if (error.message.includes('Zbyt wiele prób')) {
        statusCode = 429;
      }

      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: statusCode,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    console.error('Register error:', error);
    return new Response(
      JSON.stringify({
        error: 'Wystąpił błąd serwera. Spróbuj ponownie później.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
};
