
import React from 'react';
import BottomNav from '@/components/BottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown } from 'lucide-react';

const dummyLeaderboard = [
  { rank: 1, name: 'Eco Warrior', points: 2580, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { rank: 2, name: 'Green Giant', points: 2410, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704e' },
  { rank: 3, name: 'Captain Planet', points: 2350, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704f' },
  { rank: 4, name: 'Recycle Queen', points: 2100, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704a' },
  { rank: 5, name: 'Solar Sam', points: 1980, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704b' },
  { rank: 6, name: 'You', points: 1850, avatar: '', isCurrentUser: true },
  { rank: 7, name: 'Windy Wendy', points: 1700, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704c' },
];

const LeaderboardPage = () => {
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
            <ul className="space-y-4">
              {dummyLeaderboard.map((user, index) => (
                <li key={user.rank} className={`flex items-center p-3 rounded-lg ${user.isCurrentUser ? 'bg-green-100 border border-green-300' : 'bg-white'}`}>
                  <div className="w-8 text-lg font-bold text-gray-500">{user.rank}</div>
                  <Avatar className="w-10 h-10 mx-4">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.points} Kelp Points</p>
                  </div>
                  {index < 3 && <Crown className={`w-6 h-6 ${
                      index === 0 ? 'text-yellow-400' : 
                      index === 1 ? 'text-gray-400' : 'text-yellow-600'
                  }`} />}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
};

export default LeaderboardPage;
