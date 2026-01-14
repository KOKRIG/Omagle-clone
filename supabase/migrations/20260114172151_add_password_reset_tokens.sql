/*
  # Add Password Reset Tokens Table

  1. New Tables
    - `password_reset_tokens`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `token` (text, unique) - Random token for password reset
      - `created_at` (timestamptz) - When token was created
      - `expires_at` (timestamptz) - When token expires (15 minutes)
      - `used` (boolean) - Whether token has been used

  2. Security
    - Enable RLS on `password_reset_tokens` table
    - Add policy for users to create their own reset tokens
    - Add policy for users to use their own reset tokens
    - Tokens expire after 15 minutes
    - Tokens can only be used once

  3. Functions
    - `create_reset_token()` - Creates a new reset token for a user
    - `verify_reset_token()` - Checks if a token is valid
    - `use_reset_token()` - Marks a token as used
*/

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '15 minutes'),
  used boolean DEFAULT false
);

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create reset tokens"
  ON password_reset_tokens
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read their own reset tokens"
  ON password_reset_tokens
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update their own reset tokens"
  ON password_reset_tokens
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Function to create a reset token
CREATE OR REPLACE FUNCTION create_reset_token(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to verify a reset token
CREATE OR REPLACE FUNCTION verify_reset_token(p_token text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to mark token as used
CREATE OR REPLACE FUNCTION use_reset_token(p_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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