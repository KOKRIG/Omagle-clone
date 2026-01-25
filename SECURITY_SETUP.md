# Security Setup Instructions

## Leaked Password Protection

To enable leaked password protection (HaveIBeenPwned integration) in Supabase:

### Steps:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Policies** (or **Settings**)
4. Look for **Password Settings** or **Security Settings**
5. Enable **"Check passwords against HaveIBeenPwned database"**
6. Save the settings

### What This Does:

- Prevents users from using compromised passwords that have been leaked in data breaches
- Checks passwords against the HaveIBeenPwned.org database
- Enhances overall account security
- Blocks registration/password changes with known compromised passwords

### Alternative Method (via Supabase CLI):

If you have the Supabase CLI installed, you can also enable this via:

```bash
supabase projects api-keys --project-ref YOUR_PROJECT_REF
```

Then update the auth configuration through the API.

## Database Indexes

All unused indexes have been removed via migration to:
- Improve write performance
- Reduce storage costs
- Eliminate security warnings about unused indexes

The following indexes were removed:
- `idx_match_queue_gender`
- `idx_match_queue_created`
- `idx_profiles_presence`
- `idx_ad_premium_expires_at`
- `idx_active_matches_users`
- `idx_active_matches_user2_id`
- `idx_ice_candidates_match`
- `idx_ice_candidates_sender_id`
- `idx_password_reset_tokens_user_id`
- `idx_reports_reported_id`
- `idx_reports_reporter_id`

These were flagged as unused by Supabase monitoring and have been safely removed.
