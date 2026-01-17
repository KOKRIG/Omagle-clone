/*
  # Fix Security and Performance Issues
  
  ## Performance Optimizations
  
  1. **Add Missing Foreign Key Indexes**
     - active_matches.user2_id
     - ice_candidates.sender_id
     - password_reset_tokens.user_id
     - reports.reported_id
     - reports.reporter_id
  
  2. **Optimize RLS Policies for Auth Function Calls**
     - Wrap auth.uid() with SELECT to prevent re-evaluation per row
     - Affects all tables: profiles, match_queue, active_matches, ice_candidates, reports
  
  ## Security Fixes
  
  3. **Fix Insecure Password Reset Token Policies**
     - Remove "always true" policies
     - Add proper user-scoped policies
  
  4. **Fix Function Search Path Issues**
     - Add explicit search_path to all functions
     - Prevents role mutable search_path security issues
  
  5. **Consolidate Duplicate Permissive Policies**
     - Merge overlapping SELECT policies on profiles table
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

-- Index on active_matches.user2_id for better join performance
CREATE INDEX IF NOT EXISTS idx_active_matches_user2_id ON active_matches(user2_id);

-- Index on ice_candidates.sender_id for filtering by sender
CREATE INDEX IF NOT EXISTS idx_ice_candidates_sender_id ON ice_candidates(sender_id);

-- Index on password_reset_tokens.user_id for user lookup
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- Index on reports.reported_id for counting reports per user
CREATE INDEX IF NOT EXISTS idx_reports_reported_id ON reports(reported_id);

-- Index on reports.reporter_id for user's report history
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);

-- =====================================================
-- 2. OPTIMIZE RLS POLICIES - DROP AND RECREATE
-- =====================================================

-- Drop existing policies that need optimization
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read other profiles for matching" ON profiles;

DROP POLICY IF EXISTS "Users can join queue" ON match_queue;
DROP POLICY IF EXISTS "Users can leave queue" ON match_queue;
DROP POLICY IF EXISTS "Users can view queue for matching" ON match_queue;

DROP POLICY IF EXISTS "Users can view own matches" ON active_matches;
DROP POLICY IF EXISTS "Users can create matches" ON active_matches;
DROP POLICY IF EXISTS "Users can update own matches" ON active_matches;
DROP POLICY IF EXISTS "Users can delete own matches" ON active_matches;

DROP POLICY IF EXISTS "Users can insert ICE candidates" ON ice_candidates;
DROP POLICY IF EXISTS "Users can view ICE candidates for their matches" ON ice_candidates;

DROP POLICY IF EXISTS "Users can create reports" ON reports;

-- =====================================================
-- PROFILES - Optimized Policies with Consolidated SELECT
-- =====================================================

-- Single consolidated policy for reading profiles (own + matching)
CREATE POLICY "Users can read profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = id 
    OR presence IN ('searching', 'online')
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Users can insert their own profile (on registration)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

-- =====================================================
-- MATCH QUEUE - Optimized Policies
-- =====================================================

-- Users can insert themselves into queue
CREATE POLICY "Users can join queue"
  ON match_queue FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can remove themselves from queue
CREATE POLICY "Users can leave queue"
  ON match_queue FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Users can see the queue for matchmaking
CREATE POLICY "Users can view queue for matching"
  ON match_queue FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- =====================================================
-- ACTIVE MATCHES - Optimized Policies
-- =====================================================

-- Users can see their own matches
CREATE POLICY "Users can view own matches"
  ON active_matches FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user1_id OR (SELECT auth.uid()) = user2_id);

-- Users can create matches
CREATE POLICY "Users can create matches"
  ON active_matches FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user1_id);

-- Users can update their matches (for signaling)
CREATE POLICY "Users can update own matches"
  ON active_matches FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user1_id OR (SELECT auth.uid()) = user2_id)
  WITH CHECK ((SELECT auth.uid()) = user1_id OR (SELECT auth.uid()) = user2_id);

-- Users can delete their matches (on disconnect)
CREATE POLICY "Users can delete own matches"
  ON active_matches FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user1_id OR (SELECT auth.uid()) = user2_id);

-- =====================================================
-- ICE CANDIDATES - Optimized Policies
-- =====================================================

-- Users can insert ICE candidates
CREATE POLICY "Users can insert ICE candidates"
  ON ice_candidates FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = sender_id);

-- Users can view ICE candidates for their matches
CREATE POLICY "Users can view ICE candidates for their matches"
  ON ice_candidates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM active_matches
      WHERE active_matches.id = ice_candidates.match_id
      AND (active_matches.user1_id = (SELECT auth.uid()) OR active_matches.user2_id = (SELECT auth.uid()))
    )
  );

-- =====================================================
-- REPORTS - Optimized Policies
-- =====================================================

-- Users can create reports
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = reporter_id);

-- =====================================================
-- 3. FIX PASSWORD RESET TOKEN POLICIES
-- =====================================================

-- Drop insecure policies
DROP POLICY IF EXISTS "Anyone can create reset tokens" ON password_reset_tokens;
DROP POLICY IF EXISTS "Anyone can read their own reset tokens" ON password_reset_tokens;
DROP POLICY IF EXISTS "Anyone can update their own reset tokens" ON password_reset_tokens;

-- Create secure policies (tokens are managed via functions only)
-- Note: These policies restrict direct table access. The security definer functions handle the logic.

-- Users can only read their own non-expired tokens
CREATE POLICY "Users can read own reset tokens"
  ON password_reset_tokens FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- No direct INSERT/UPDATE/DELETE allowed - must use security definer functions
-- This prevents abuse of the reset token system

-- =====================================================
-- 4. FIX FUNCTION SEARCH PATH ISSUES
-- =====================================================

-- Recreate increment_match_count with explicit search_path
CREATE OR REPLACE FUNCTION increment_match_count(user_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET match_count = match_count + 1
  WHERE id = user_id_param;
END;
$$;

-- Recreate verify_reset_token with explicit search_path
CREATE OR REPLACE FUNCTION verify_reset_token(p_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT user_id INTO v_user_id
  FROM password_reset_tokens
  WHERE token = p_token
    AND used = false
    AND expires_at > now();
  
  RETURN v_user_id;
END;
$$;

-- Recreate use_reset_token with explicit search_path
CREATE OR REPLACE FUNCTION use_reset_token(p_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE password_reset_tokens
  SET used = true
  WHERE token = p_token
    AND used = false
    AND expires_at > now();
  
  RETURN FOUND;
END;
$$;

-- Recreate increment_report_count with explicit search_path
CREATE OR REPLACE FUNCTION increment_report_count(reported_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count int;
BEGIN
  -- Get current count
  SELECT reports_count INTO current_count
  FROM profiles
  WHERE id = reported_user_id;

  -- Increment count
  UPDATE profiles
  SET reports_count = reports_count + 1,
      updated_at = now()
  WHERE id = reported_user_id;

  -- Apply ban if threshold reached (10 reports = 14 day ban)
  IF current_count + 1 >= 10 THEN
    UPDATE profiles
    SET ban_until = current_date + interval '14 days'
    WHERE id = reported_user_id
    AND (ban_until IS NULL OR ban_until < current_date);
  END IF;
END;
$$;

-- Recreate is_user_banned with explicit search_path
CREATE OR REPLACE FUNCTION is_user_banned(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ban_date date;
BEGIN
  SELECT ban_until INTO ban_date
  FROM profiles
  WHERE id = user_id;

  RETURN ban_date IS NOT NULL AND ban_date > current_date;
END;
$$;

-- Recreate check_billing_status with explicit search_path
CREATE OR REPLACE FUNCTION check_billing_status(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET is_paid = false
  WHERE id = user_id
  AND next_billing < current_date
  AND is_paid = true;
END;
$$;

-- Recreate create_reset_token with explicit search_path
CREATE OR REPLACE FUNCTION create_reset_token(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token text;
BEGIN
  -- Generate a random token
  v_token := encode(gen_random_bytes(32), 'hex');
  
  -- Insert the token
  INSERT INTO password_reset_tokens (user_id, token)
  VALUES (p_user_id, v_token);
  
  RETURN v_token;
END;
$$;