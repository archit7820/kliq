
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

// Real-time sync for profiles and challenges using Supabase channels
const useRealtimeSync = () => {
  useEffect(() => {
    const profilesChannel = supabase
      .channel("public:profiles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => window.location.reload()
      )
      .subscribe();
    const challengesChannel = supabase
      .channel("public:challenges")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "challenges" },
        () => window.location.reload()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(challengesChannel);
    };
  }, []);
};

const LeaderboardPage = () => {
  useRealtimeSync();

  const { profile, isProfileLoading, insights, user } = useProfileWithStats();
  const { leaderboard, isLoading, friendsLeaderboard } = useLeaderboard();

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
        <ProfileStats profile={profile} user={user} getUserRank={getUserRank} />
        <EcoInsightsList insights={insights} />

        <Tabs defaultValue="global">
          <div className="px-4 pt-4">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="global" className="text-sm">
                Global
              </TabsTrigger>
              <TabsTrigger value="friends" className="text-sm">
                Friends
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="global" className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
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
                  className="bg-green-600 hover:bg-green-700"
                >
                  Find Friends
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
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

