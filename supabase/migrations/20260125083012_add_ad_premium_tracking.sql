/*
  # Add Ad Premium Tracking

  1. Changes
    - Add `ad_premium_expires_at` column to profiles table to track when ad-earned premium expires
    - Add `match_pattern_position` column to track position in match pattern (0-9)
    - Add index on ad_premium_expires_at for efficient queries

  2. Notes
    - Users can watch ads to get 4 minutes of premium features
    - Match pattern: positions 0-3 = same gender, 4-7 = same gender, 8-9 = opposite gender
*/

-- Add ad premium tracking columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'ad_premium_expires_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN ad_premium_expires_at timestamptz DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'match_pattern_position'
  ) THEN
    ALTER TABLE profiles ADD COLUMN match_pattern_position int DEFAULT 0;
  END IF;
END $$;

-- Create index for efficient premium expiry checks
CREATE INDEX IF NOT EXISTS idx_ad_premium_expires_at ON profiles(ad_premium_expires_at);
