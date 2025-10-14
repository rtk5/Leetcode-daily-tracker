import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface LeetCodeUserData {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  avatar?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const username = url.searchParams.get('username');

    if (!username) {
      return new Response(
        JSON.stringify({ error: 'Username parameter is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch data from LeetCode GraphQL API
    const leetcodeData = await fetchLeetCodeData(username);

    if (!leetcodeData) {
      await supabase.from('fetch_log').insert({
        fetch_time: new Date().toISOString(),
        success: false,
        error_message: `Failed to fetch data for ${username}`,
      });

      return new Response(
        JSON.stringify({ error: 'Failed to fetch LeetCode data' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get or create user
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('leetcode_username', username)
      .maybeSingle();

    const today = new Date().toISOString().split('T')[0];
    let userId: string;
    let previousTotal = 0;

    if (existingUser) {
      userId = existingUser.id;
      previousTotal = existingUser.total_solved;

      // Calculate streak
      const { current_streak, longest_streak } = await calculateStreak(
        supabase,
        userId,
        leetcodeData.totalSolved,
        previousTotal
      );

      // Update user
      await supabase
        .from('users')
        .update({
          total_solved: leetcodeData.totalSolved,
          easy_solved: leetcodeData.easySolved,
          medium_solved: leetcodeData.mediumSolved,
          hard_solved: leetcodeData.hardSolved,
          avatar_url: leetcodeData.avatar,
          current_streak,
          longest_streak,
          last_fetched_at: new Date().toISOString(),
        })
        .eq('id', userId);
    } else {
      // Create new user
      const { data: newUser } = await supabase
        .from('users')
        .insert({
          leetcode_username: username,
          display_name: username,
          total_solved: leetcodeData.totalSolved,
          easy_solved: leetcodeData.easySolved,
          medium_solved: leetcodeData.mediumSolved,
          hard_solved: leetcodeData.hardSolved,
          avatar_url: leetcodeData.avatar,
          current_streak: leetcodeData.totalSolved > 0 ? 1 : 0,
          longest_streak: leetcodeData.totalSolved > 0 ? 1 : 0,
          last_fetched_at: new Date().toISOString(),
        })
        .select()
        .single();

      userId = newUser.id;
    }

    // Update or create daily stats
    const problemsSolvedToday = leetcodeData.totalSolved - previousTotal;

    await supabase
      .from('daily_stats')
      .upsert({
        user_id: userId,
        date: today,
        problems_solved: problemsSolvedToday,
        total_solved_snapshot: leetcodeData.totalSolved,
      }, {
        onConflict: 'user_id,date',
      });

    // Log successful fetch
    await supabase.from('fetch_log').insert({
      user_id: userId,
      fetch_time: new Date().toISOString(),
      success: true,
    });

    return new Response(
      JSON.stringify({ success: true, data: leetcodeData }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in fetch-leetcode-data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function fetchLeetCodeData(
  username: string
): Promise<LeetCodeUserData | null> {
  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            userAvatar
          }
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `;

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    const data = await response.json();

    if (!data.data?.matchedUser) {
      return null;
    }

    const user = data.data.matchedUser;
    const stats = user.submitStats.acSubmissionNum;

    const allStats = stats.find((s: any) => s.difficulty === 'All');
    const easyStats = stats.find((s: any) => s.difficulty === 'Easy');
    const mediumStats = stats.find((s: any) => s.difficulty === 'Medium');
    const hardStats = stats.find((s: any) => s.difficulty === 'Hard');

    return {
      username: user.username,
      totalSolved: allStats?.count || 0,
      easySolved: easyStats?.count || 0,
      mediumSolved: mediumStats?.count || 0,
      hardSolved: hardStats?.count || 0,
      avatar: user.profile.userAvatar,
    };
  } catch (error) {
    console.error('Error fetching LeetCode data:', error);
    return null;
  }
}

async function calculateStreak(
  supabase: any,
  userId: string,
  newTotal: number,
  oldTotal: number
): Promise<{ current_streak: number; longest_streak: number }> {
  const { data: user } = await supabase
    .from('users')
    .select('current_streak, longest_streak')
    .eq('id', userId)
    .single();

  const { data: dailyStats } = await supabase
    .from('daily_stats')
    .select('date, problems_solved')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(30);

  if (!dailyStats || dailyStats.length === 0) {
    const initialStreak = newTotal > oldTotal ? 1 : 0;
    return {
      current_streak: initialStreak,
      longest_streak: Math.max(initialStreak, user?.longest_streak || 0),
    };
  }

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let currentStreak = 0;
  const sortedStats = dailyStats.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const solvedToday = newTotal > oldTotal;

  if (solvedToday) {
    currentStreak = 1;
    let checkDate = new Date(yesterday);

    for (const stat of sortedStats) {
      const statDate = stat.date;
      if (statDate === today) continue;

      const expectedDate = checkDate.toISOString().split('T')[0];

      if (statDate === expectedDate && stat.problems_solved > 0) {
        currentStreak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }
  } else {
    const todayStats = sortedStats.find((s) => s.date === today);
    if (todayStats && todayStats.problems_solved > 0) {
      currentStreak = user?.current_streak || 0;
    } else {
      currentStreak = 0;
    }
  }

  const longestStreak = Math.max(
    currentStreak,
    user?.longest_streak || 0
  );

  return { current_streak: currentStreak, longest_streak: longestStreak };
}
