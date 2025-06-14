
import React from 'react';
import BottomNav from '@/components/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, LoaderCircle, AlertTriangle, Users, Trophy, GroupIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { Link } from "react-router-dom";

const challengeCards = [
  {
    title: "Green Streak 🌱",
    description: "Log an activity every day for 7 days!",
    progress: 4,
    total: 7,
    color: "from-green-200 via-green-100 to-teal-50"
  },
  {
    title: "Eco Hero 🚀",
    description: "Offset 50kg of CO₂ this month.",
    progress: 22,
    total: 50,
    color: "from-emerald-300 via-green-200 to-yellow-100"
  }
];

const communityLists = [
  {
    name: "Sustainability Champs",
    description: "A group of eco-enthusiasts making a difference.",
    members: 132,
    color: "from-green-100 via-blue-100 to-emerald-50"
  },
  {
    name: "Veggie Lovers",
    description: "Share recipes and plant-based wins!",
    members: 98,
    color: "from-pink-100 via-green-100 to-yellow-50"
  }
];

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
        <Card className="mb-3">
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
                  <li key={u.rank} className={`flex items-center p-3 rounded-lg ${u.isCurrentUser ? 'bg-gradient-to-r from-green-100 via-green-50 to-white border-2 border-green-400' : 'bg-white'} transition shadow`}>
                    <div className="w-8 text-lg font-bold text-gray-500">{u.rank}</div>
                    <Avatar className="w-10 h-10 mx-4 shadow">
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

        {/* Challenges Section */}
        <div className="space-y-3">
          <h2 className="font-bold text-lg text-primary">Challenges</h2>
          <div className="flex flex-col gap-3">
            {challengeCards.map((challenge, i) => (
              <div key={challenge.title} className={`rounded-2xl shadow-lg bg-gradient-to-br ${challenge.color} p-4 flex items-center justify-between gap-4`}>
                <div>
                  <h3 className="font-semibold text-base text-green-900 mb-1">{challenge.title}</h3>
                  <p className="text-xs text-green-800 mb-1">{challenge.description}</p>
                  <div className="h-2 w-36 bg-green-200 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(challenge.progress / challenge.total) * 100}%` }} />
                  </div>
                  <span className="text-xs text-green-600 font-bold">{challenge.progress} / {challenge.total}</span>
                </div>
                <Trophy className="w-10 h-10 text-yellow-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Communities Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-primary">Communities</h2>
            <Link to="/communities" className="text-xs text-primary hover:underline">See all</Link>
          </div>
          <div className="flex flex-col gap-3">
            {communityLists.map(community => (
              <div key={community.name} className={`rounded-2xl shadow-lg bg-gradient-to-br ${community.color} px-4 py-3 flex items-center gap-4`}>
                <GroupIcon className="w-9 h-9 text-indigo-400" />
                <div>
                  <h3 className="font-semibold text-base text-indigo-900">{community.name}</h3>
                  <p className="text-xs text-gray-700">{community.description}</p>
                  <span className="block mt-1 text-xs text-gray-500">{community.members} members</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default LeaderboardPage;
