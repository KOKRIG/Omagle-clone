/*
  # Fix Function Security - Search Path

  1. Security Fix
    - Updates `handle_new_user` function to have an immutable search_path
    - Prevents potential security vulnerabilities from search_path manipulation
    - Sets explicit search_path to 'public'

  2. Changes
    - Recreates the function with SET search_path = public
*/

-- Recreate the function with explicit search_path
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, country, secret_question, secret_answer_hash)
  values (
    new.id,
    new.email,
    'Unknown',
    'temp',
    'temp'
  );
  return new;
end;
$$;
