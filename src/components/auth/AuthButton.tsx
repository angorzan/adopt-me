import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { DTO } from '@/types';

interface AuthButtonProps {
  user: DTO.UserResponse | null;
  variant?: 'header' | 'mobile';
}

export const AuthButton = ({ user, variant = 'header' }: AuthButtonProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <a href="/auth/login">Zaloguj się</a>
        </Button>
        <Button asChild>
          <a href="/auth/signup">Załóż konto</a>
        </Button>
      </div>
    );
  }

  // Zalogowany użytkownik
  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setShowDropdown(!showDropdown)}
        className="gap-2"
      >
        <span className="hidden md:inline">{user.email}</span>
        <span className="md:hidden">Menu</span>
        <svg
          className={`size-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-56 rounded-md border bg-card shadow-lg z-20">
            <div className="py-1">
              <div className="px-4 py-2 text-sm text-muted-foreground border-b">
                <div className="font-medium text-foreground">{user.email}</div>
                <div className="text-xs mt-1">Rola: {user.role}</div>
              </div>

              {user.role === 'adopter' && (
                <>
                  <a
                    href="/recommendations"
                    className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    Rekomendacje AI
                  </a>
                </>
              )}

              {user.role === 'shelter_staff' && (
                <>
                  <a
                    href="/shelter/dashboard"
                    className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    Panel schroniska
                  </a>
                  <a
                    href="/shelter/dogs"
                    className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    Zarządzaj psami
                  </a>
                  <a
                    href="/shelter/applications"
                    className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    Obsługa wniosków
                  </a>
                </>
              )}

              <div className="border-t my-1" />

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? 'Wylogowywanie...' : 'Wyloguj się'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

