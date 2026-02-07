/*
  # Add missing UPDATE policy on match_queue

  1. Security Changes
    - Add UPDATE policy on `match_queue` for authenticated users
    - Users can only update their own queue entry
    - Required for upsert operations when re-joining the queue (e.g. pressing "Next")

  2. Notes
    - Without this policy, the upsert in joinQueue fails silently when a user already has a queue entry
    - This was preventing users from searching again after their first match
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'match_queue'
    AND policyname = 'Users can update own queue entry'
  ) THEN
    CREATE POLICY "Users can update own queue entry"
      ON match_queue
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
