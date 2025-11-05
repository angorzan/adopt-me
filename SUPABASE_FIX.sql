-- INSTRUKCJA: Zaaplikuj ten SQL bezpośrednio w Supabase SQL Editor
-- URL: https://app.supabase.com/project/mgdfizbspwomirgzcomx/sql/new
--
-- Problem: Trigger handle_new_user próbuje wstawić rekord bez kolumny password_hash,
-- ale ta kolumna jest NOT NULL, co powoduje "Database error saving new user"
--
-- Rozwiązanie: Usunąć trigger, naprawić schemat, i przebudować trigger

BEGIN;

-- 1. Usunąć stary trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Usunąć starą funkcję
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Usunąć kolumnę password_hash z tabeli users (jeśli istnieje)
-- Supabase Auth zarządza hasłami, nie public.users tabela
ALTER TABLE public.users DROP COLUMN IF EXISTS password_hash;

-- 4. Przebudować funkcję do tworzenia użytkownika
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'adopter')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Trigger nie powinien przerywać auth.signUp() nawet jeśli tworzenie user_record się nie powiedzie
  RAISE NOTICE 'Error creating user record for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Przebudować trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;

-- Test: Spróbuj się zarejestrować na stronie
-- Jeśli dalej nie działa, możesz sprawdzić logi:
-- SELECT * FROM auth.audit_log_entries ORDER BY created_at DESC LIMIT 10;
