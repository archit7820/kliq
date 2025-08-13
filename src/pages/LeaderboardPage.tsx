import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import LeaderboardFilters from "@/components/LeaderboardFilters";
import ChallengesHub from "@/components/ChallengesHub";
import DeeperAnalytics from "@/components/DeeperAnalytics";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

const useRealtimeSync = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!userId) return;
    const triggerRefetch = () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["eco-insights", userId] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["friends-leaderboard", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-challenges", userId] });
    };
    const tables = [
      { table: "profiles", filterKey: "id", userKey: userId },
      { table: "eco_insights", filterKey: "user_id", userKey: userId },
      { table: "activities", filterKey: "user_id", userKey: userId },
      { table: "challenge_participants", filterKey: "user_id", userKey: userId },
      { table: "challenges" },
    ];
    const channels = tables.map(({ table, filterKey, userKey }) =>
      supabase
        .channel(`public:${table}-realtime`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table, ...(filterKey && userKey ? { filter: `${filterKey}=eq.${userKey}` } : {}) },
          payload => { triggerRefetch(); }
        )
        .subscribe()
    );
    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [userId, queryClient]);
};

const FALLBACK_LOGO_EMOJI = "🌱";

const LeaderboardPage = () => {
  const { profile, isProfileLoading, insights, user } = useProfileWithStats();
  const { leaderboard, isLoading, friendsLeaderboard } = useLeaderboard();
  useRealtimeSync(user?.id);

  const [logoBroken, setLogoBroken] = React.useState(false);

  const getUserRank = (userId: string) => {
    const index = leaderboard.findIndex((item: any) => item.id === userId);
    return index !== -1 ? `#${index + 1}` : "N/A";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-cyan-100 flex flex-col relative">
      {/* Header/Top + Logo fix */}
      <div className="
        bg-gradient-to-b from-green-700 via-green-700 to-green-500 rounded-b-3xl shadow-xl z-10
        flex flex-col items-center w-full pb-4 pt-6 px-0 sm:p-6
      ">
        <div className="flex flex-row items-center justify-center gap-2 w-full mb-1 px-2">
          {!logoBroken ? (
            <img
              src="/kelp-logo.svg"
              alt="Logo"
              className="w-8 h-8 object-contain min-w-[32px] min-h-[32px] flex-shrink-0"
              onError={(e) => {
                setLogoBroken(true);
              }}
            />
          ) : (
            <span className="w-8 h-8 flex items-center justify-center text-2xl select-none" aria-label="kelp logo">
              {FALLBACK_LOGO_EMOJI}
            </span>
          )}
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center mb-0" style={{ lineHeight: 1.1 }}>
            Kelp Leaderboard!
            <span className="ml-2 animate-bounce text-2xl sm:text-3xl" role="img" aria-label="trophy">🏆</span>
          </h1>
        </div>
        <p className="text-green-100 text-xs leading-5 font-medium sm:text-md text-center w-full max-w-xs px-2 mt-1">
          Race to the top — earn points, inspire friends, and unlock new badges by making an eco difference every day!
        </p>
        {/* Tabs - perfectly centered and with increased margin below for mobile */}
        <div className="w-full flex justify-center pt-3 pb-2 z-20">
          <Tabs defaultValue="global" className="w-full max-w-md flex flex-col items-center">
            <TabsList className="
              w-fit rounded-full shadow bg-green-100 overflow-hidden flex items-center mx-auto px-1
            ">
              <TabsTrigger value="global" className="
                text-[15px] px-4 py-1.5 rounded-full !font-bold data-[state=active]:bg-green-600 data-[state=active]:text-white
                transition-all select-none
              ">
                🌍 Global
              </TabsTrigger>
              <TabsTrigger value="friends" className="
                text-[15px] px-4 py-1.5 rounded-full !font-bold data-[state=active]:bg-yellow-400 data-[state=active]:text-green-900
                transition-all select-none
              ">
                🧑‍🤝‍🧑 Friends
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {/* "Your Rank" badge */}
        <div className="relative w-full flex justify-center z-10 mt-1 px-3">
          <span className="
            bg-white/15 text-green-50 px-4 py-1 rounded-full text-sm font-semibold shadow
            sm:text-md text-center w-full max-w-xs backdrop-blur border border-white/10
          ">
            Your rank:{" "}
            <span className="text-yellow-200 drop-shadow">{user ? getUserRank(user.id) : "-"}</span>
          </span>
        </div>
      </div>

      {/* MAIN - Responsive: items centered always! */}
      <main className="flex flex-col items-center w-full max-w-screen-md mx-auto px-0 pt-1 pb-20 z-20 gap-y-2">
        {/* ProfileStats Card */}
        <div className="rounded-2xl shadow-lg bg-white/90 px-2 sm:px-4 py-2 sm:py-4 mb-2 w-full animate-fade-in animate-scale-in mt-[-14px] sm:mt-0">
          <ProfileStats profile={profile} user={user} getUserRank={getUserRank} />
        </div>
        {/* Podium/Leaderboard aligned and centered */}
        <div className="flex flex-col items-center w-full px-0 sm:px-2">
          <Tabs defaultValue="global" className="w-full max-w-md flex flex-col items-center">
            <TabsContent value="global" className="p-0 w-full flex flex-col items-center">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500 animate-pulse">Loading...</div>
              ) : (
                <div className="flex flex-col items-center w-full">
                  <LeaderboardList leaderboard={leaderboard} userId={user?.id} />
                </div>
              )}
            </TabsContent>
            <TabsContent value="friends" className="p-0 w-full flex flex-col items-center">
              {friendsLeaderboard.length ? (
                <div className="flex flex-col items-center w-full">
                  <LeaderboardList leaderboard={friendsLeaderboard} userId={user?.id} />
                </div>
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
        </div>
        {/* Insights */}
        <EcoInsightsList insights={insights} />
        {/* Impact Dashboard */}
        <section className="max-w-screen-md mx-auto w-full mt-5 rounded-2xl shadow bg-white/60 animate-fade-in">
          <div className="flex flex-row items-center justify-between mb-1 pt-4 px-4">
            <h2 className="font-bold text-lg text-green-900">Your Kelp Points Impact</h2>
            <Link to="/impact-dashboard" className="text-green-700 hover:underline text-sm">View Full Dashboard</Link>
          </div>
          <ImpactDashboard />
        </section>
        {/* Challenges */}
        <div className="w-full text-center my-3">
          <Link
            to="/challenges"
            className="inline-flex items-center gap-1 px-5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full font-semibold transition border shadow animate-fade-in"
          >
            🎯 Check Out This Week's Challenges!
          </Link>
        </div>
        <div className="my-3 text-center w-full">
          <Link
            to="/create-challenge"
            className="inline-flex items-center gap-1 px-5 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-full font-semibold transition border shadow"
          >
            ➕ Create a New Challenge
          </Link>
        </div>
      </main>
      {/* BottomNav + motivational badge */}
      <BottomNav />
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 w-full flex justify-center pointer-events-none">
        <div className="bg-white/90 rounded-full px-5 py-2 shadow-lg border-2 border-green-400 text-green-700 font-bold animate-fade-in max-w-xs w-full text-center pointer-events-auto text-sm sm:text-base">
          🚀 Level up your eco journey with Kelp!
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
