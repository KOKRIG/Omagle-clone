/*
  # Add match_count column to profiles

  1. Changes
    - Add `match_count` column to profiles table (integer, default 0)
    - This tracks the number of matches for free users to implement 6:1 gender ratio
    
  2. Functions
    - Create `increment_match_count()` function to safely increment the counter
*/

-- Add match_count column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'match_count'
  ) THEN
    ALTER TABLE profiles ADD COLUMN match_count integer DEFAULT 0;
  END IF;
END $$;

-- Function to increment match count
CREATE OR REPLACE FUNCTION increment_match_count(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET match_count = match_count + 1
  WHERE id = user_id_param;
END;
$$;