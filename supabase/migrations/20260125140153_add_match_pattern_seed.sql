/*
  # Add Random Match Pattern Seed

  1. Changes
    - Add `match_pattern_seed` column to profiles table to store random pattern selection
    - This allows each user to have a different matching pattern that rotates

  2. Details
    - Column: match_pattern_seed (integer, default random value 0-7)
    - Used to select one of 8 different gender matching patterns
    - Makes matching patterns unpredictable for free users
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'match_pattern_seed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN match_pattern_seed int DEFAULT floor(random() * 8);
  END IF;
END $$;