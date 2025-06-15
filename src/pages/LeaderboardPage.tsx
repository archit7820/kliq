
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import ImpactDashboard from "@/components/ImpactDashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, ArrowUp, ArrowDown } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useProfileWithStats } from "@/hooks/useProfileWithStats";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { supabase } from "@/integrations/supabase/client";

const LeaderboardPage = () => {
  const { profile, isProfileLoading, insights, user } = useProfileWithStats();
  const { leaderboard, isLoading, friendsLeaderboard } = useLeaderboard();

  // Real-time sync for Leaderboard (basic, listens for changes in 'profiles')
  useEffect(() => {
    const channel = supabase
      .channel("public:profiles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          // Optionally: refetch queries here using react-query
          // You can use queryClient.invalidateQueries here for robust pattern.
          window.location.reload(); // quick/dirty for demonstration
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getUserRank = (userId: string) => {
    const index = leaderboard.findIndex((item: any) => item.id === userId);
    return index !== -1 ? `#${index + 1}` : "N/A";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-gradient-to-b from-green-800 to-green-700 text-white p-4">
        <div className="max-w-screen-md mx-auto">
          <h1 className="text-2xl font-bold mb-2">Stats & Leaderboard</h1>
          <p className="text-green-100 text-sm">
            See how your actions compare to others
          </p>
        </div>
      </div>

      <div className="max-w-screen-md mx-auto w-full p-4 pb-20">

        {/* Your Stats */}
        <Card className="mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 border-b">
            <CardTitle className="text-lg">Your Stats</CardTitle>
          </div>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                <p className="text-xs text-gray-500">Kelp Points</p>
                <p className="text-2xl font-bold text-green-700">
                  {profile?.kelp_points ?? 0}
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                <p className="text-xs text-gray-500">Current Streak</p>
                <p className="text-2xl font-bold text-orange-700">
                  {profile?.streak_count ?? <span className="text-base text-gray-400 italic">0</span>}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-xs text-gray-500">Global Rank</p>
                <p className="text-2xl font-bold text-blue-700">
                  {user ? getUserRank(user.id) : "N/A"}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                <p className="text-xs text-gray-500">Weekly CO₂e Progress</p>
                <p className="text-2xl font-bold text-purple-700">
                  {profile
                    ? `${profile.co2e_weekly_progress ?? 0} / ${profile.co2e_weekly_goal ?? 0} kg`
                    : <span className="text-base text-gray-400 italic">n/a</span>}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eco Insights */}
        <Card className="mb-6">
          <div className="bg-gradient-to-r from-green-50 to-yellow-50 p-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              🌱 Eco Insights
            </CardTitle>
          </div>
          <CardContent className="p-4">
            {insights.length === 0 && (
              <div className="text-gray-400 text-sm">No eco insights yet. Log an activity or join challenges to get tips!</div>
            )}
            <ul>
              {insights.map(insight =>
                <li className="mb-1 text-green-700 font-medium" key={insight.id}>
                  {insight.insight}
                  <span className="block text-xs text-gray-400">{new Date(insight.created_at).toLocaleDateString()}</span>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="mb-6">
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Leaderboard
            </CardTitle>
          </div>
          <CardContent className="p-0">
            <Tabs defaultValue="global">
              <div className="px-4 pt-4">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="global" className="text-sm">
                    <Users className="h-4 w-4 mr-1" /> Global
                  </TabsTrigger>
                  <TabsTrigger value="friends" className="text-sm">
                    <Users className="h-4 w-4 mr-1" /> Friends
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="global" className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : (
                  <div className="divide-y">
                    {leaderboard.map((profile: any, index: number) => (
                      <div key={profile.id}
                        className={`flex items-center p-3 ${
                          profile.id === user?.id
                            ? "bg-green-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="w-8 font-bold text-gray-500">
                          #{index + 1}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                          {profile.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt={profile.username || "User"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-green-200 text-green-800 font-bold">
                              {profile.username?.[0]?.toUpperCase() || "?"}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {profile.username || "Anonymous"}
                            {profile.id === user?.id && (
                              <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">
                                You
                              </Badge>
                            )}
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <span>{profile.kelp_points ?? 0} pts</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center">
                            {index > 0 ? (
                              <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                            ) : (
                              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                            )}
                            <span className="text-xs text-gray-500">
                              {index === 0 ? "+2" : "-1"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="friends" className="p-0">
                {friendsLeaderboard.length ? (
                  <div className="divide-y">
                    {friendsLeaderboard.map((profile: any, index: number) => (
                      <div
                        key={profile.id}
                        className={`flex items-center p-3 ${
                          profile.id === user?.id
                            ? "bg-green-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="w-8 font-bold text-gray-500">
                          #{index + 1}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                          {profile.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt={profile.username || "User"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-green-200 text-green-800 font-bold">
                              {profile.username?.[0]?.toUpperCase() || "?"}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {profile.username || "Anonymous"}
                            {profile.id === user?.id && (
                              <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">
                                You
                              </Badge>
                            )}
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <span>{profile.kelp_points ?? 0} pts</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <p className="mb-4">No friends yet!</p>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Find Friends
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* --- Impact Dashboard Preview --- */}
        <section className="max-w-screen-md mx-auto w-full mt-6">
          <div className="flex flex-row items-center justify-between mb-1">
            <h2 className="font-bold text-lg">Your Kelp Points Impact</h2>
            <Link to="/impact-dashboard" className="text-green-700 hover:underline text-sm">
              View Full Dashboard
            </Link>
          </div>
          <ImpactDashboard />
        </section>

        {/* --- Micro-interaction: Jump to Challenges --- */}
        <div className="w-full text-center my-4">
          <Link
            to="/challenges"
            className="inline-flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full font-medium transition border shadow animate-fade-in"
          >
            🎯 Check Out This Week's Challenges!
          </Link>
        </div>
        <div className="my-4 text-center">
          <Link
            to="/create-challenge"
            className="inline-flex items-center gap-1 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-full font-medium transition border shadow"
          >
            ➕ Create a New Challenge
          </Link>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default LeaderboardPage;
