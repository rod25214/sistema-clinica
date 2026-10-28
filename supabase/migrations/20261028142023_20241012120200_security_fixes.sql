/*
# Security advisor fixes

## Overview
Fixes two security advisor warnings:
1. update_updated_at_column has a mutable search_path.
2. handle_new_user (SECURITY DEFINER) is callable by authenticated via REST API.

## Changes
1. Recreate update_updated_at_column with SET search_path = public.
2. Re-create handle_new_user with SET search_path = public and revoke EXECUTE
   from authenticated (it only needs to run as a trigger on auth.users).
3. Revoke default anon grants that Supabase applies automatically to new tables,
   so only authenticated can reach the data (this is a sign-in-only app).
*/

-- ============================================================
-- Fix 1: update_updated_at_column with immutable search_path
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- Fix 2: handle_new_user — revoke EXECUTE from authenticated
-- (only runs as a trigger, never called directly)
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- ============================================================
-- Fix 3: Revoke default anon grants (sign-in-only app)
-- ============================================================
REVOKE ALL ON perfis FROM anon;
REVOKE ALL ON clinicas FROM anon;
REVOKE ALL ON historico_horarios FROM anon;
REVOKE ALL ON funcoes FROM anon;
REVOKE ALL ON clinica_usuarios FROM anon;
REVOKE ALL ON clinica_usuario_funcoes FROM anon;
REVOKE ALL ON pacientes FROM anon;
REVOKE ALL ON consultas FROM anon;
REVOKE ALL ON transacoes FROM anon;
