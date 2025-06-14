
import React from 'react';
import BottomNav from '@/components/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, LoaderCircle, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStatus } from '@/hooks/useAuthStatus';

const LeaderboardPage = () => {
  const { user } = useAuthStatus();

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, kelp_points')
      .not('kelp_points', 'is', null)
      .order('kelp_points', { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);
    
    return data.map((profile, index) => ({
        rank: index + 1,
        name: profile.full_name || profile.username || 'Anonymous',
        points: profile.kelp_points || 0,
        avatar: profile.avatar_url || '',
        isCurrentUser: user?.id === profile.id
    }));
  };

  const { data: leaderboard, isLoading, isError, error } = useQuery({
      queryKey: ['leaderboard'],
      queryFn: fetchLeaderboard
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-green-700 text-center">Leaderboard</h1>
      </header>

      <main className="flex-grow p-4 md:p-6 space-y-6 mb-16">
        <Card>
          <CardHeader>
            <CardTitle>Top Kelp Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex justify-center items-center py-10">
                <LoaderCircle className="w-8 h-8 animate-spin text-green-600" />
              </div>
            )}
            {isError && (
              <div className="flex flex-col items-center justify-center py-10 text-red-600">
                <AlertTriangle className="w-8 h-8 mb-2" />
                <p>Could not load leaderboard.</p>
                <p className="text-sm text-red-500">{error.message}</p>
              </div>
            )}
            {leaderboard && (
              <ul className="space-y-4">
                {leaderboard.map((u, index) => (
                  <li key={u.rank} className={`flex items-center p-3 rounded-lg ${u.isCurrentUser ? 'bg-green-100 border border-green-300' : 'bg-white'}`}>
                    <div className="w-8 text-lg font-bold text-gray-500">{u.rank}</div>
                    <Avatar className="w-10 h-10 mx-4">
                      <AvatarImage src={u.avatar} />
                      <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-800">{u.name}</p>
                      <p className="text-sm text-gray-500">{Math.round(u.points)} Kelp Points</p>
                    </div>
                    {index < 3 && <Crown className={`w-6 h-6 ${
                        index === 0 ? 'text-yellow-400' : 
                        index === 1 ? 'text-gray-400' : 'text-yellow-600'
                    }`} />}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default LeaderboardPage;
