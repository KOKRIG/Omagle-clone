# Security Setup Instructions

## ✅ Database Indexes - COMPLETED

All unused indexes have been successfully removed! The migration `20260125140529_remove_unused_indexes.sql` has been applied.

If you're still seeing warnings about unused indexes in your Supabase dashboard:
1. **Refresh your browser** - The dashboard may be showing cached data
2. **Wait 5-10 minutes** - Monitoring systems may take time to update
3. **Check the Security Advisor again** - The warnings should be gone

### Current Status:
- ✅ `idx_match_queue_gender` - REMOVED
- ✅ `idx_match_queue_created` - REMOVED
- ✅ `idx_profiles_presence` - REMOVED
- ✅ `idx_ad_premium_expires_at` - REMOVED
- ✅ `idx_active_matches_users` - REMOVED
- ✅ `idx_active_matches_user2_id` - REMOVED
- ✅ `idx_ice_candidates_match` - REMOVED
- ✅ `idx_ice_candidates_sender_id` - REMOVED
- ✅ `idx_password_reset_tokens_user_id` - REMOVED
- ✅ `idx_reports_reported_id` - REMOVED
- ✅ `idx_reports_reporter_id` - REMOVED

---

## ⚠️ Leaked Password Protection - MANUAL ACTION REQUIRED

This security feature **cannot be enabled via code** - you must enable it manually in your Supabase Dashboard.

### Steps to Enable:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Providers** → **Email**
4. Scroll down to find **"Security and protection"** section
5. Enable **"Check passwords against HaveIBeenPwned"** or similar option
6. Save the settings

### What This Does:

- Prevents users from using compromised passwords that have been leaked in data breaches
- Checks passwords against the HaveIBeenPwned.org database
- Enhances overall account security
- Blocks registration/password changes with known compromised passwords

### Alternative Locations in Dashboard:

The setting might also be located at:
- **Authentication** → **Settings** → **Auth Providers** → **Email**
- **Project Settings** → **Authentication** → **Email Auth**
- Look for options like:
  - "Password strength"
  - "Leaked password protection"
  - "Check against HaveIBeenPwned database"
  - "Prevent compromised passwords"

### Why This Matters:

- Prevents users from using passwords that have been exposed in data breaches
- Checks against **HaveIBeenPwned.org** database (over 600M+ compromised passwords)
- Users will be blocked from registering or changing passwords to known compromised ones
- Significantly enhances account security with zero impact on legitimate users

### Note:
Once enabled, this setting takes effect immediately. Users attempting to use compromised passwords will receive an error message asking them to choose a different password.

---

## Summary

| Security Issue | Status | Action Required |
|---------------|--------|-----------------|
| Unused Indexes | ✅ **FIXED** | None - Already removed via migration |
| Leaked Password Protection | ⚠️ **PENDING** | Enable manually in Supabase Dashboard |

**Next Steps:**
1. ✅ Indexes removed - No action needed (may need dashboard refresh)
2. ⚠️ Enable password protection in Supabase Dashboard following the steps above
