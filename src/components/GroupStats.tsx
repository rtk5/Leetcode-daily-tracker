import { User } from '../lib/supabase';
import { Users, Flame, TrendingUp, Calendar } from 'lucide-react';

interface GroupStatsProps {
  users: User[];
}

export function GroupStats({ users }: GroupStatsProps) {
  const totalProblems = users.reduce((sum, user) => sum + user.total_solved, 0);
  const averageProblems = users.length > 0 ? Math.round(totalProblems / users.length) : 0;
  const minStreak = users.length > 0 ? Math.min(...users.map(u => u.current_streak)) : 0;
  const groupStreak = minStreak;
  const activeToday = users.filter(u => {
    const lastFetch = u.last_fetched_at ? new Date(u.last_fetched_at) : null;
    if (!lastFetch) return false;
    const today = new Date().toDateString();
    return lastFetch.toDateString() === today && u.current_streak > 0;
  }).length;

  return (
    <div className="group-stats">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <div className="icon-circle">
          <Users className="w-5 h-5 text-cyan-400" />
        </div>
        Group Statistics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-box">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-400 text-sm">Total Members</span>
          </div>
          <p className="text-4xl font-bold text-white">{users.length}</p>
        </div>

        <div className="stat-box">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-gray-400 text-sm">Group Streak</span>
          </div>
          <p className="text-4xl font-bold text-white">{groupStreak}</p>
          <p className="text-xs text-gray-400 mt-1">Minimum streak of all members</p>
        </div>

        <div className="stat-box">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-gray-400 text-sm">Total Problems</span>
          </div>
          <p className="text-4xl font-bold text-white">{totalProblems}</p>
          <p className="text-xs text-gray-400 mt-1">Average: {averageProblems} per member</p>
        </div>

        <div className="stat-box">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400 text-sm">Active Today</span>
          </div>
          <p className="text-4xl font-bold text-white">{activeToday}</p>
          <p className="text-xs text-gray-400 mt-1">out of {users.length} members</p>
        </div>
      </div>

      {users.length > 0 && groupStreak === 0 && (
        <div className="warning-box mt-4">
          <p className="text-sm">
            ⚠️ Group streak broken! At least one member missed solving a problem today.
          </p>
        </div>
      )}

      {users.length > 0 && activeToday === users.length && (
        <div className="success-box mt-4">
          <p className="text-sm">
            🎉 Everyone is active today! Keep the momentum going!
          </p>
        </div>
      )}
    </div>
  );
}
