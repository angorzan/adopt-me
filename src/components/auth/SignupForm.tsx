import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 5) {
      return "Hasło musi mieć minimum 5 znaków";
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Walidacja client-side
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne");
      return;
    }

    if (!gdprConsent) {
      setError("Musisz zaakceptować przetwarzanie danych osobowych");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          confirmPassword,
          gdprConsent,
        }),
      });

      let data: { error?: string } | null = null;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Register response parse error:", parseError);
        throw new Error(`Serwer zwrócił nieprawidłową odpowiedź (${response.status})`);
      }

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error("Ten adres e-mail jest już zarejestrowany.");
        }
        if (response.status === 429) {
          throw new Error("Zbyt wiele prób rejestracji. Spróbuj ponownie za kilka minut.");
        }

        throw new Error(data?.error || `Błąd serwera: ${response.status}`);
      }

      setSuccess(true);
    } catch (err) {
      console.error("Signup error:", err);
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto" data-test-id="signup-form-success">
        <CardHeader>
          <CardTitle>Sprawdź swoją skrzynkę e-mail</CardTitle>
          <CardDescription data-test-id="signup-form-success-message">Konto zostało utworzone.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Wysłaliśmy link aktywacyjny na adres <strong>{email}</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              Kliknij w link, aby potwierdzić konto. Bez potwierdzenia część funkcji może być niedostępna.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button asChild className="w-full" data-test-id="signup-form-success-login-button">
            <a href="/auth/login">Przejdź do logowania</a>
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Nie widzisz wiadomości? Sprawdź folder spam lub poczekaj kilka minut.
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto" data-test-id="signup-form-container">
      <CardHeader>
        <CardTitle>Załóż konto</CardTitle>
        <CardDescription>Utwórz konto, aby adoptować psa i zarządzać wnioskami.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} data-test-id="signup-form">
        <CardContent>
          <div className="space-y-4">
            {error && (
              <div
                className="p-3 rounded-md bg-destructive/10 text-destructive text-sm"
                role="alert"
                aria-live="polite"
                data-test-id="signup-form-error"
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
                data-test-id="signup-form-email"
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
                autoComplete="new-password"
                data-test-id="signup-form-password"
              />
              <p className="text-xs text-muted-foreground">Minimum 5 znaków</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                minLength={5}
                autoComplete="new-password"
                data-test-id="signup-form-password-confirm"
              />
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="gdpr"
                checked={gdprConsent}
                onCheckedChange={(checked) => setGdprConsent(checked === true)}
                disabled={isLoading}
                required
                data-test-id="signup-form-gdpr-checkbox"
              />
              <Label htmlFor="gdpr" className="text-sm leading-tight cursor-pointer">
                Akceptuję przetwarzanie danych osobowych zgodnie z{" "}
                <a
                  href="/privacy-policy"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  polityką prywatności
                </a>
              </Label>
            </div>

            <div className="rounded-md border border-dashed border-muted p-3 bg-muted/40 text-xs text-muted-foreground">
              Po utworzeniu konta otrzymasz e-mail z linkiem aktywacyjnym Supabase. Potwierdzenie konta pozwoli na
              korzystanie z pełnych funkcji aplikacji.
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isLoading} data-test-id="signup-form-submit-button">
            {isLoading ? "Tworzenie konta..." : "Utwórz konto"}
          </Button>

          <div className="text-sm text-center text-muted-foreground">
            Masz już konto?{" "}
            <a href="/auth/login" className="text-primary hover:underline" data-test-id="signup-form-login-link">
              Zaloguj się
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};
