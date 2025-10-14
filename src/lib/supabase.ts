import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  leetcode_username: string;
  display_name: string | null;
  avatar_url: string | null;
  notes: string;
  total_solved: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  current_streak: number;
  longest_streak: number;
  last_fetched_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyStat {
  id: string;
  user_id: string;
  date: string;
  problems_solved: number;
  total_solved_snapshot: number;
  created_at: string;
}

export interface FetchLog {
  id: string;
  user_id: string | null;
  fetch_time: string;
  success: boolean;
  error_message: string | null;
  created_at: string;
}
