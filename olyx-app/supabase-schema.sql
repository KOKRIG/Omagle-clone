-- =====================================================
-- OLYX.SITE - SUPABASE DATABASE SCHEMA
-- =====================================================
-- Run this SQL in Supabase SQL Editor to set up the database

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,

  full_name text,
  gender text check (gender in ('male', 'female')),
  country text not null,

  secret_question text not null,
  secret_answer_hash text not null,

  plan text default 'free',
  reports_count int default 0,
  ban_until date,

  -- Billing fields for paid plans
  is_paid boolean default false,
  billing_start date,
  next_billing date,

  -- Presence/status fields
  presence text default 'offline' check (presence in ('offline', 'online', 'searching', 'in_chat')),

  -- Filter preferences (only work for paid users)
  filter_gender text check (filter_gender in ('male', 'female', 'any')),
  filter_region text,

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- =====================================================
-- 2. MATCH QUEUE TABLE (for matchmaking)
-- =====================================================
create table if not exists match_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  gender text,
  country text,
  is_paid boolean default false,
  filter_gender text,
  filter_region text,
  created_at timestamp with time zone default now(),

  -- Ensure one entry per user
  constraint unique_user_queue unique (user_id)
);

-- =====================================================
-- 3. ACTIVE MATCHES TABLE (current chat sessions)
-- =====================================================
create table if not exists active_matches (
  id uuid primary key default gen_random_uuid(),
  user1_id uuid references profiles(id) on delete cascade,
  user2_id uuid references profiles(id) on delete cascade,
  started_at timestamp with time zone default now(),

  -- WebRTC signaling data
  offer text,
  answer text,

  constraint unique_match unique (user1_id, user2_id)
);

-- =====================================================
-- 4. ICE CANDIDATES TABLE (for WebRTC signaling)
-- =====================================================
create table if not exists ice_candidates (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references active_matches(id) on delete cascade,
  sender_id uuid references profiles(id) on delete cascade,
  candidate jsonb not null,
  created_at timestamp with time zone default now()
);

-- =====================================================
-- 5. REPORTS TABLE (for tracking user reports)
-- =====================================================
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id) on delete cascade,
  reported_id uuid references profiles(id) on delete cascade,
  reason text not null check (reason in ('inappropriate', 'sexual_aggression', 'harassment', 'violence', 'spam', 'fake_video')),
  created_at timestamp with time zone default now()
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table match_queue enable row level security;
alter table active_matches enable row level security;
alter table ice_candidates enable row level security;
alter table reports enable row level security;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can read their own profile
create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Users can insert their own profile (on registration)
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Allow reading other profiles for matchmaking (limited fields via function)
create policy "Users can read other profiles for matching"
  on profiles for select
  using (presence = 'searching' or presence = 'online');

-- =====================================================
-- MATCH QUEUE POLICIES
-- =====================================================

-- Users can insert themselves into queue
create policy "Users can join queue"
  on match_queue for insert
  with check (auth.uid() = user_id);

-- Users can remove themselves from queue
create policy "Users can leave queue"
  on match_queue for delete
  using (auth.uid() = user_id);

-- Users can see the queue for matchmaking
create policy "Users can view queue for matching"
  on match_queue for select
  using (true);

-- =====================================================
-- ACTIVE MATCHES POLICIES
-- =====================================================

-- Users can see their own matches
create policy "Users can view own matches"
  on active_matches for select
  using (auth.uid() = user1_id or auth.uid() = user2_id);

-- Users can create matches
create policy "Users can create matches"
  on active_matches for insert
  with check (auth.uid() = user1_id);

-- Users can update their matches (for signaling)
create policy "Users can update own matches"
  on active_matches for update
  using (auth.uid() = user1_id or auth.uid() = user2_id);

-- Users can delete their matches (on disconnect)
create policy "Users can delete own matches"
  on active_matches for delete
  using (auth.uid() = user1_id or auth.uid() = user2_id);

-- =====================================================
-- ICE CANDIDATES POLICIES
-- =====================================================

-- Users can insert ICE candidates
create policy "Users can insert ICE candidates"
  on ice_candidates for insert
  with check (auth.uid() = sender_id);

-- Users can view ICE candidates for their matches
create policy "Users can view ICE candidates for their matches"
  on ice_candidates for select
  using (
    exists (
      select 1 from active_matches
      where active_matches.id = ice_candidates.match_id
      and (active_matches.user1_id = auth.uid() or active_matches.user2_id = auth.uid())
    )
  );

-- =====================================================
-- REPORTS POLICIES
-- =====================================================

-- Users can create reports
create policy "Users can create reports"
  on reports for insert
  with check (auth.uid() = reporter_id);

-- Users cannot see reports (admin only via service role)
-- No select policy for regular users

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to increment report count and apply ban if needed
create or replace function increment_report_count(reported_user_id uuid)
returns void as $$
declare
  current_count int;
begin
  -- Get current count
  select reports_count into current_count
  from profiles
  where id = reported_user_id;

  -- Increment count
  update profiles
  set reports_count = reports_count + 1,
      updated_at = now()
  where id = reported_user_id;

  -- Apply ban if threshold reached (10 reports = 14 day ban)
  if current_count + 1 >= 10 then
    update profiles
    set ban_until = current_date + interval '14 days'
    where id = reported_user_id
    and (ban_until is null or ban_until < current_date);
  end if;
end;
$$ language plpgsql security definer;

-- Function to check if user is banned
create or replace function is_user_banned(user_id uuid)
returns boolean as $$
declare
  ban_date date;
begin
  select ban_until into ban_date
  from profiles
  where id = user_id;

  return ban_date is not null and ban_date > current_date;
end;
$$ language plpgsql security definer;

-- Function to check if billing has expired
create or replace function check_billing_status(user_id uuid)
returns void as $$
begin
  update profiles
  set is_paid = false
  where id = user_id
  and next_billing < current_date
  and is_paid = true;
end;
$$ language plpgsql security definer;

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- =====================================================

-- Enable realtime for match_queue (for matchmaking)
alter publication supabase_realtime add table match_queue;

-- Enable realtime for active_matches (for signaling)
alter publication supabase_realtime add table active_matches;

-- Enable realtime for ice_candidates (for WebRTC)
alter publication supabase_realtime add table ice_candidates;

-- Enable realtime for profiles (for presence)
alter publication supabase_realtime add table profiles;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

create index if not exists idx_match_queue_gender on match_queue(gender);
create index if not exists idx_match_queue_created on match_queue(created_at);
create index if not exists idx_profiles_presence on profiles(presence);
create index if not exists idx_active_matches_users on active_matches(user1_id, user2_id);
create index if not exists idx_ice_candidates_match on ice_candidates(match_id);
