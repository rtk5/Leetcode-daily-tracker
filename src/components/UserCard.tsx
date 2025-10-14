import { User } from '../lib/supabase';
import { Trophy, Flame, Target, Trash2, RefreshCw } from 'lucide-react';

interface UserCardProps {
  user: User;
  onDelete: (id: string) => void;
  onRefresh: (username: string) => void;
  isRefreshing?: boolean;
}

export function UserCard({ user, onDelete, onRefresh, isRefreshing }: UserCardProps) {
  const solvedPercentage = Math.round((user.total_solved / 3000) * 100);

  return (
    <div className="user-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="avatar">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.display_name || user.leetcode_username} />
            ) : (
              <div className="avatar-placeholder">
                {(user.display_name || user.leetcode_username).charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">
              {user.display_name || user.leetcode_username}
            </h3>
            <p className="text-gray-400 text-sm">@{user.leetcode_username}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onRefresh(user.leetcode_username)}
            disabled={isRefreshing}
            className="icon-button"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => onDelete(user.id)}
            className="icon-button icon-button-danger"
            title="Remove user"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="stat-box">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-400 text-sm">Total Solved</span>
          </div>
          <p className="text-3xl font-bold text-white">{user.total_solved}</p>
          <div className="progress-bar mt-2">
            <div className="progress-fill" style={{ width: `${Math.min(solvedPercentage, 100)}%` }} />
          </div>
        </div>

        <div className="stat-box">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-gray-400 text-sm">Current Streak</span>
          </div>
          <p className="text-3xl font-bold text-white">{user.current_streak}</p>
          <p className="text-sm text-gray-400 mt-1">Best: {user.longest_streak}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="difficulty-badge difficulty-easy">
          <span className="text-xs text-gray-400">Easy</span>
          <span className="text-lg font-bold">{user.easy_solved}</span>
        </div>
        <div className="difficulty-badge difficulty-medium">
          <span className="text-xs text-gray-400">Medium</span>
          <span className="text-lg font-bold">{user.medium_solved}</span>
        </div>
        <div className="difficulty-badge difficulty-hard">
          <span className="text-xs text-gray-400">Hard</span>
          <span className="text-lg font-bold">{user.hard_solved}</span>
        </div>
      </div>

      {user.notes && (
        <div className="notes-box">
          <p className="text-sm text-gray-300">{user.notes}</p>
        </div>
      )}

      {user.last_fetched_at && (
        <p className="text-xs text-gray-500 mt-3">
          Last updated: {new Date(user.last_fetched_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}
