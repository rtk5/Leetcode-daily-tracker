/*
  # LeetCode Streak Tracker Database Schema

  ## Overview
  This migration creates the complete database schema for tracking LeetCode user statistics,
  daily problem solving activity, and streak management.

  ## New Tables

  ### 1. `users`
  Stores LeetCode usernames and profile information
  - `id` (uuid, primary key) - Unique identifier
  - `leetcode_username` (text, unique) - LeetCode username
  - `display_name` (text) - Optional display name
  - `avatar_url` (text) - Profile picture URL
  - `notes` (text) - Personal notes about the user
  - `total_solved` (integer) - Total problems solved
  - `easy_solved` (integer) - Easy problems solved
  - `medium_solved` (integer) - Medium problems solved
  - `hard_solved` (integer) - Hard problems solved
  - `current_streak` (integer) - Current daily streak
  - `longest_streak` (integer) - Longest streak achieved
  - `last_fetched_at` (timestamptz) - Last data fetch timestamp
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### 2. `daily_stats`
  Tracks daily problem solving statistics for each user
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Reference to users table
  - `date` (date) - The date of the statistics
  - `problems_solved` (integer) - Number of problems solved on this date
  - `total_solved_snapshot` (integer) - Total problems at end of day
  - `created_at` (timestamptz) - Record creation timestamp
  - Unique constraint on (user_id, date) to prevent duplicates

  ### 3. `fetch_log`
  Logs all data fetch operations for debugging and monitoring
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Reference to users table
  - `fetch_time` (timestamptz) - When the fetch occurred
  - `success` (boolean) - Whether fetch was successful
  - `error_message` (text) - Error details if failed
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - RLS enabled on all tables
  - Public read access for all tables (since this is a group tracking app)
  - Anyone can insert/update users (for demo purposes - can be restricted later)
  - Daily stats and fetch logs are automatically managed by the system

  ## Indexes
  - Index on leetcode_username for fast lookups
  - Index on date in daily_stats for efficient date-based queries
  - Index on user_id in daily_stats for user-specific queries
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  leetcode_username text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  notes text DEFAULT '',
  total_solved integer DEFAULT 0,
  easy_solved integer DEFAULT 0,
  medium_solved integer DEFAULT 0,
  hard_solved integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_fetched_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create daily_stats table
CREATE TABLE IF NOT EXISTS daily_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  problems_solved integer DEFAULT 0,
  total_solved_snapshot integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create fetch_log table
CREATE TABLE IF NOT EXISTS fetch_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  fetch_time timestamptz DEFAULT now(),
  success boolean DEFAULT true,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_leetcode_username ON users(leetcode_username);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_id ON daily_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_fetch_log_user_id ON fetch_log(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE fetch_log ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for users table
CREATE POLICY "Anyone can view users"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert users"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update users"
  ON users FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete users"
  ON users FOR DELETE
  USING (true);

-- Create RLS Policies for daily_stats table
CREATE POLICY "Anyone can view daily stats"
  ON daily_stats FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert daily stats"
  ON daily_stats FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update daily stats"
  ON daily_stats FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete daily stats"
  ON daily_stats FOR DELETE
  USING (true);

-- Create RLS Policies for fetch_log table
CREATE POLICY "Anyone can view fetch logs"
  ON fetch_log FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert fetch logs"
  ON fetch_log FOR INSERT
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();