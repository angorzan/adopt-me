import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface LoginFormProps {
  redirectTo?: string;
}

export const LoginForm = ({ redirectTo }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error(`Server returned invalid response (${response.status})`);
      }

      if (!response.ok) {
        // Obsługa różnych typów błędów
        if (response.status === 401) {
          throw new Error('Nieprawidłowy e-mail lub hasło');
        } else if (response.status === 403) {
          throw new Error('E-mail niezweryfikowany. Sprawdź swoją skrzynkę pocztową.');
        } else if (response.status === 429) {
          throw new Error('Zbyt wiele prób logowania. Spróbuj ponownie za chwilę.');
        } else {
          throw new Error(data.error || `Błąd serwera: ${response.status}`);
        }
      }

      // Sukces - server-side reload aby middleware wypełnił Astro.locals.user
      // Używamy window.location.assign() dla full page reload
      window.location.assign(redirectTo || '/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd');
      // Focus na input email po błędzie (accessibility)
      const emailInput = document.getElementById('email');
      if (emailInput) {
        emailInput.focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Logowanie</CardTitle>
        <CardDescription>
          Zaloguj się do swojego konta AdoptMe
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <div
                className="p-3 rounded-md bg-destructive/10 text-destructive text-sm"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Adres e-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="twoj@email.pl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={5}
                autoComplete="current-password"
              />
            </div>

            <div className="text-sm">
              <a
                href="/auth/forgot-password"
                className="text-primary hover:underline"
              >
                Zapomniałeś hasła?
              </a>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Logowanie...' : 'Zaloguj się'}
          </Button>

          <div className="text-sm text-center text-muted-foreground">
            Nie masz konta?{' '}
            <a
              href="/auth/signup"
              className="text-primary hover:underline"
            >
              Załóż konto
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

