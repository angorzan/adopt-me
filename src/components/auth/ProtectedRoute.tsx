import type { ReactNode } from "react";
import type { DTO } from "@/types";

interface ProtectedRouteProps {
  children: ReactNode;
  user: DTO.UserResponse | null;
  requiredRole?: "adopter" | "shelter_staff" | "admin";
  fallback?: ReactNode;
}

export const ProtectedRoute = ({ children, user, requiredRole, fallback }: ProtectedRouteProps) => {
  // Sprawdzenie czy użytkownik jest zalogowany
  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Wymagane logowanie</h2>
          <p className="text-muted-foreground">Musisz być zalogowany, aby uzyskać dostęp do tej sekcji.</p>
          <div className="flex gap-3 justify-center">
            <a
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all h-9 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Zaloguj się
            </a>
            <a
              href="/auth/signup"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all h-9 px-4 py-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground"
            >
              Załóż konto
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Sprawdzenie roli
  if (requiredRole && user.role !== requiredRole) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Brak dostępu</h2>
          <p className="text-muted-foreground">Nie masz uprawnień do tej sekcji.</p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all h-9 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Wróć do strony głównej
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
