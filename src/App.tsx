import { useEffect, useState } from 'react';
import { supabase, User } from './lib/supabase';
import { UserCard } from './components/UserCard';
import { AddUserModal } from './components/AddUserModal';
import { GroupStats } from './components/GroupStats';
import { Leaderboard } from './components/Leaderboard';
import { UserPlus, RefreshCw, Code2 } from 'lucide-react';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState<Record<string, boolean>>({});
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();

    const channel = supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => {
          loadUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('total_solved', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err.message);
    }
  };

  const fetchLeetCodeData = async (username: string) => {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-leetcode-data?username=${username}`;

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch LeetCode data');
    }

    return response.json();
  };

  const handleAddUser = async (username: string, notes: string) => {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('leetcode_username', username)
        .maybeSingle();

      if (existingUser) {
        throw new Error('User already exists');
      }

      await fetchLeetCodeData(username);

      if (notes) {
        await supabase
          .from('users')
          .update({ notes })
          .eq('leetcode_username', username);
      }

      await loadUsers();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to add user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadUsers();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message);
    }
  };

  const handleRefreshUser = async (username: string) => {
    setIsRefreshing({ ...isRefreshing, [username]: true });
    try {
      await fetchLeetCodeData(username);
      await loadUsers();
    } catch (err: any) {
      console.error('Error refreshing user:', err);
      setError(err.message);
    } finally {
      setIsRefreshing({ ...isRefreshing, [username]: false });
    }
  };

  const handleRefreshAll = async () => {
    setIsRefreshingAll(true);
    try {
      await Promise.all(users.map(user => fetchLeetCodeData(user.leetcode_username)));
      await loadUsers();
    } catch (err: any) {
      console.error('Error refreshing all users:', err);
      setError(err.message);
    } finally {
      setIsRefreshingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="icon-circle-lg">
                <Code2 className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">
                  LeetCode Streak Tracker
                </h1>
                <p className="text-gray-400">Track your progress and compete with friends</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefreshAll}
                disabled={isRefreshingAll || users.length === 0}
                className="button button-secondary"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshingAll ? 'animate-spin' : ''}`} />
                Refresh All
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="button button-primary"
              >
                <UserPlus className="w-4 h-4" />
                Add User
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="error-box mb-6">
            <p>{error}</p>
            <button onClick={() => setError('')} className="text-red-400 underline ml-4">
              Dismiss
            </button>
          </div>
        )}

        {users.length > 0 && (
          <>
            <GroupStats users={users} />
            <Leaderboard users={users} />
          </>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            Team Members {users.length > 0 && `(${users.length})`}
          </h2>
          {users.length === 0 ? (
            <div className="empty-state">
              <Code2 className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No users yet</h3>
              <p className="text-gray-500 mb-6">
                Start by adding LeetCode usernames to track progress
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="button button-primary"
              >
                <UserPlus className="w-4 h-4" />
                Add Your First User
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onDelete={handleDeleteUser}
                  onRefresh={handleRefreshUser}
                  isRefreshing={isRefreshing[user.leetcode_username]}
                />
              ))}
            </div>
          )}
        </div>

        <AddUserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddUser}
        />
      </div>
    </div>
  );
}

export default App;
