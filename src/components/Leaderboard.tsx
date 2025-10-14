import { User } from '../lib/supabase';
import { Trophy, Medal } from 'lucide-react';

interface LeaderboardProps {
  users: User[];
}

export function Leaderboard({ users }: LeaderboardProps) {
  const sortedByProblems = [...users].sort((a, b) => b.total_solved - a.total_solved);
  const sortedByStreak = [...users].sort((a, b) => b.longest_streak - a.longest_streak);

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 1) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-orange-400" />;
    return <span className="text-gray-500 font-semibold">{rank + 1}</span>;
  };

  return (
    <div className="leaderboard">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <div className="icon-circle">
          <Trophy className="w-5 h-5 text-yellow-400" />
        </div>
        Leaderboards
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="leaderboard-section">
          <h3 className="text-lg font-semibold text-white mb-4">Most Problems Solved</h3>
          <div className="space-y-2">
            {sortedByProblems.map((user, index) => (
              <div key={user.id} className="leaderboard-item">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 flex justify-center">
                    {getRankIcon(index)}
                  </div>
                  <div className="avatar avatar-sm">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.display_name || user.leetcode_username} />
                    ) : (
                      <div className="avatar-placeholder">
                        {(user.display_name || user.leetcode_username).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {user.display_name || user.leetcode_username}
                    </p>
                    <p className="text-xs text-gray-400">@{user.leetcode_username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-cyan-400">{user.total_solved}</p>
                  <p className="text-xs text-gray-400">problems</p>
                </div>
              </div>
            ))}
            {sortedByProblems.length === 0 && (
              <p className="text-gray-500 text-center py-8">No users yet</p>
            )}
          </div>
        </div>

        <div className="leaderboard-section">
          <h3 className="text-lg font-semibold text-white mb-4">Longest Streak</h3>
          <div className="space-y-2">
            {sortedByStreak.map((user, index) => (
              <div key={user.id} className="leaderboard-item">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 flex justify-center">
                    {getRankIcon(index)}
                  </div>
                  <div className="avatar avatar-sm">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.display_name || user.leetcode_username} />
                    ) : (
                      <div className="avatar-placeholder">
                        {(user.display_name || user.leetcode_username).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {user.display_name || user.leetcode_username}
                    </p>
                    <p className="text-xs text-gray-400">@{user.leetcode_username}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-orange-400">{user.longest_streak}</p>
                  <p className="text-xs text-gray-400">days</p>
                </div>
              </div>
            ))}
            {sortedByStreak.length === 0 && (
              <p className="text-gray-500 text-center py-8">No users yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
