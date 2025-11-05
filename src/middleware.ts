import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerInstance } from '@/db/supabase.client';

export const onRequest = defineMiddleware(async (context, next) => {
  try {
    // Pobierz lub utwórz Supabase client z cookies
    const supabase = createSupabaseServerInstance({
      cookies: context.cookies,
      headers: context.request.headers,
    });

    // Pobierz aktualną sesję
    const { data: { session }, error } = await supabase.auth.getSession();

    console.log('Middleware: getSession result:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      email: session?.user?.email,
      error: error?.message,
    });

    if (session?.user) {
      // Jeśli user jest zalogowany, pobierz jego dane z tabeli users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, role, shelter_id, created_at, updated_at')
        .eq('id', session.user.id)
        .single();

      console.log('Middleware: fetch user result:', {
        hasData: !!userData,
        error: userError?.message,
        userId: userData?.id,
      });

      if (userData && !userError) {
        // Ustaw user w Astro.locals
        context.locals.user = userData;
        console.log('Middleware: User set in context.locals');
      } else {
        context.locals.user = null;
      }
    } else {
      // Brak sesji - user nie jest zalogowany
      context.locals.user = null;
      console.log('Middleware: No session found');
    }
  } catch (err) {
    console.error('Middleware error:', err);
    context.locals.user = null;
  }

  return next();
});
