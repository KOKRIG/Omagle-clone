/*
  # Remove Unused Database Indexes

  1. Changes
    - Drop unused indexes that are consuming storage and slowing down writes
    - These indexes were created but are not being utilized by queries
    - Removing them improves write performance and reduces storage costs

  2. Security
    - Unused indexes are flagged as security issues as they add unnecessary overhead
    - Only indexes confirmed as unused by monitoring are being removed
*/

-- Drop unused indexes on match_queue
DROP INDEX IF EXISTS idx_match_queue_gender;
DROP INDEX IF EXISTS idx_match_queue_created;

-- Drop unused indexes on profiles
DROP INDEX IF EXISTS idx_profiles_presence;
DROP INDEX IF EXISTS idx_ad_premium_expires_at;

-- Drop unused indexes on active_matches
DROP INDEX IF EXISTS idx_active_matches_users;
DROP INDEX IF EXISTS idx_active_matches_user2_id;

-- Drop unused indexes on ice_candidates
DROP INDEX IF EXISTS idx_ice_candidates_match;
DROP INDEX IF EXISTS idx_ice_candidates_sender_id;

-- Drop unused indexes on password_reset_tokens
DROP INDEX IF EXISTS idx_password_reset_tokens_user_id;

-- Drop unused indexes on reports
DROP INDEX IF EXISTS idx_reports_reported_id;
DROP INDEX IF EXISTS idx_reports_reporter_id;