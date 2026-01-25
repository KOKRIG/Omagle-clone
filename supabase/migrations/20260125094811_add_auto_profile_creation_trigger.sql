/*
  # Add Automatic Profile Creation Trigger

  1. Changes
    - Creates a trigger function to automatically create a profile entry when a new user signs up
    - This ensures profiles table is always in sync with auth.users
    - Removes the need for manual profile insertion in the application code
  
  2. Security
    - Uses security definer to bypass RLS for the initial profile creation
    - Profile is created with minimal default values
    - Application can update the profile afterwards with full details
*/

-- Function to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
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
$$ language plpgsql security definer;

-- Trigger to call the function when a new user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
