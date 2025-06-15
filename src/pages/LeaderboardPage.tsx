
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import ImpactDashboard from "@/components/ImpactDashboard";
import BottomNav from "@/components/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileStats from "@/components/ProfileStats";
import EcoInsightsList from "@/components/EcoInsightsList";
import LeaderboardList from "@/components/LeaderboardList";
import { Button } from "@/components/ui/button";
import { useProfileWithStats } from "@/hooks/useProfileWithStats";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const useRealtimeSync = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    // Callback to selectively refetch relevant queries
    const triggerRefetch = () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["eco-insights", userId] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["friends-leaderboard", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-challenges", userId] });
      // Add more queryKeys here as needed (such as activities)
    };

    // Listen to changes on all relevant tables for the current user
    const tables = [
      { table: "profiles", filterKey: "id", userKey: userId },
      { table: "eco_insights", filterKey: "user_id", userKey: userId },
      { table: "activities", filterKey: "user_id", userKey: userId },
      { table: "challenge_participants", filterKey: "user_id", userKey: userId },
      { table: "challenges" }, // Any challenge update may affect rewards or activity
    ];

    const channels = tables.map(({ table, filterKey, userKey }) =>
      supabase
        .channel(`public:${table}-realtime`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table, ...(filterKey && userKey ? { filter: `${filterKey}=eq.${userKey}` } : {}) },
          payload => {
            // This will trigger on all changes to these tables, but only for rows relevant to the user when filter is set
            triggerRefetch();
          }
        )
        .subscribe()
    );

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [userId, queryClient]);
};

const LeaderboardPage = () => {
  const { profile, isProfileLoading, insights, user } = useProfileWithStats();
  const { leaderboard, isLoading, friendsLeaderboard } = useLeaderboard();
  useRealtimeSync(user?.id);

  const getUserRank = (userId: string) => {
    const index = leaderboard.findIndex((item: any) => item.id === userId);
    return index !== -1 ? `#${index + 1}` : "N/A";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-cyan-100 flex flex-col relative">
      <div className="bg-gradient-to-b from-green-700 via-green-700 to-green-500 text-white p-6 pb-2 relative rounded-b-3xl shadow-xl z-10">
        <div className="max-w-screen-md mx-auto flex flex-col items-center gap-2 animate-fade-in">
          <h1 className="text-3xl font-extrabold tracking-tight">🌊 Kelp Leaderboard!</h1>
          <p className="text-green-100 text-sm mb-2">Race to the top — earn points, inspire friends, and unlock new badges by making an eco difference every day!</p>
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold shadow">Your current rank: <span className="text-yellow-200">{user ? getUserRank(user.id) : "-"}</span></span>
          </div>
        </div>
      </div>
      <div className="max-w-screen-md mx-auto w-full px-0 pt-6 pb-20 relative z-20">
        <div className="rounded-2xl shadow-lg bg-white/90 px-2 py-4 mb-4 -mt-12 z-10 animate-fade-in">
          <ProfileStats profile={profile} user={user} getUserRank={getUserRank} />
        </div>

        <EcoInsightsList insights={insights} />

        <Tabs defaultValue="global">
          <div className="flex justify-center pt-2 pb-1 mb-1 gap-1">
            <TabsList className="w-fit rounded-full shadow bg-green-100">
              <TabsTrigger value="global" className="text-sm px-3 py-1 rounded-full !font-bold data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all">
                🌍 Global
              </TabsTrigger>
              <TabsTrigger value="friends" className="text-sm px-3 py-1 rounded-full !font-bold data-[state=active]:bg-yellow-400 data-[state=active]:text-green-900 transition-all">
                🧑‍🤝‍🧑 Friends
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="global" className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500 animate-pulse">Loading...</div>
            ) : (
              <LeaderboardList leaderboard={leaderboard} userId={user?.id} />
            )}
          </TabsContent>
          <TabsContent value="friends" className="p-0">
            {friendsLeaderboard.length ? (
              <LeaderboardList leaderboard={friendsLeaderboard} userId={user?.id} />
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p className="mb-4">No friends yet!</p>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow"
                >
                  Find Friends
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        {/* --- Impact Dashboard Preview --- */}
        <section className="max-w-screen-md mx-auto w-full mt-6 rounded-2xl shadow bg-white/60 animate-fade-in">
          <div className="flex flex-row items-center justify-between mb-1 pt-4 px-4">
            <h2 className="font-bold text-lg text-green-900">Your Kelp Points Impact</h2>
            <Link to="/impact-dashboard" className="text-green-700 hover:underline text-sm">
              View Full Dashboard
            </Link>
          </div>
          <ImpactDashboard />
        </section>
        <div className="w-full text-center my-4">
          <Link
            to="/challenges"
            className="inline-flex items-center gap-1 px-5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full font-semibold transition border shadow animate-fade-in"
          >
            🎯 Check Out This Week's Challenges!
          </Link>
        </div>
        <div className="my-4 text-center">
          <Link
            to="/create-challenge"
            className="inline-flex items-center gap-1 px-5 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-full font-semibold transition border shadow"
          >
            ➕ Create a New Challenge
          </Link>
        </div>
      </div>
      <BottomNav />
      {/* Fun motivational footer badge */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-white/80 rounded-full px-5 py-2 shadow-lg border-2 border-green-400 text-green-700 font-bold animate-fade-in">
          🚀 Level up your eco journey with Kelp!
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
