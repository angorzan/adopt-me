-- FIX: Naprawianie infinite recursion w RLS policies dla tabeli users
-- Problem: Policy dla users_select_authenticated powoduje nieskończoną rekursję
-- Rozwiązanie: Uproszczenie polityk - użytkownik widzi tylko swoje dane
--
-- WAŻNE: Ta wersja nie obsługuje admin access. Dla produkcji trzeba bardziej skomplikowane rozwiązanie.

BEGIN;

-- 1. Usuwanie starych policies które powodują rekursję
DROP POLICY IF EXISTS users_select_anon ON public.users;
DROP POLICY IF EXISTS users_select_authenticated ON public.users;
DROP POLICY IF EXISTS users_insert_authenticated ON public.users;
DROP POLICY IF EXISTS users_insert_anon ON public.users;
DROP POLICY IF EXISTS users_update_authenticated ON public.users;
DROP POLICY IF EXISTS users_update_anon ON public.users;
DROP POLICY IF EXISTS users_delete_authenticated ON public.users;
DROP POLICY IF EXISTS users_delete_anon ON public.users;

-- 2. Tworzenie nowych, bezpiecznych policies
-- Anonimowy użytkownik: brak dostępu
CREATE POLICY users_select_anon ON public.users
  FOR SELECT TO anon
  USING (false);

-- Zalogowany użytkownik: widzi tylko swoje dane
CREATE POLICY users_select_authenticated ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Insert: może wstawić tylko swój rekord
CREATE POLICY users_insert_authenticated ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY users_insert_anon ON public.users
  FOR INSERT TO anon
  WITH CHECK (false);

-- Update: może modyfikować tylko swoje dane
CREATE POLICY users_update_authenticated ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY users_update_anon ON public.users
  FOR UPDATE TO anon
  USING (false)
  WITH CHECK (false);

-- Delete: nikt nie może usuwać (nawet admin w tej wersji)
CREATE POLICY users_delete_authenticated ON public.users
  FOR DELETE TO authenticated
  USING (false);

CREATE POLICY users_delete_anon ON public.users
  FOR DELETE TO anon
  USING (false);

COMMIT;

-- Test: Spróbuj się zalogować. Login endpoint powinien teraz zadziałać!
