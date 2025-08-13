import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useProfileWithStats } from "@/hooks/useProfileWithStats";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import LeaderboardFilters from "@/components/LeaderboardFilters";
import LeaderboardList from "@/components/LeaderboardList";
import ChallengesHub from "@/components/ChallengesHub";
import DeeperAnalytics from "@/components/DeeperAnalytics";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { Trophy, Target, Crown } from "lucide-react";

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
  const { profile, user } = useProfileWithStats();
  const { leaderboard, isLoading, friendsLeaderboard } = useLeaderboard();
  const { subscribed: isPremium } = useSubscriptionStatus();
  const navigate = useNavigate();
  useRealtimeSync(user?.id);

  const [scope, setScope] = useState<"global" | "national" | "local" | "friends">("global");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAnalytics, setShowAnalytics] = useState(false);

  const getUserRank = (userId: string) => {
    const currentLeaderboard = scope === "friends" ? friendsLeaderboard : leaderboard;
    const index = currentLeaderboard.findIndex((item: any) => item.id === userId);
    return index !== -1 ? `#${index + 1}` : "N/A";
  };

  const currentLeaderboard = scope === "friends" ? friendsLeaderboard : leaderboard;

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50 to-sky-50 flex flex-col">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Stats & Challenges</h1>
                <p className="text-emerald-100 text-sm">Track progress, compete, and grow</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-emerald-100 text-xs">Your Rank</p>
              <div className="flex items-center gap-1">
                <Crown className="w-4 h-4 text-yellow-300" />
                <span className="text-white font-bold">{user ? getUserRank(user.id) : "-"}</span>
              </div>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="leaderboard" className="w-full">
            <TabsList className="bg-white/20 backdrop-blur-sm border-0 p-1 rounded-xl">
              <TabsTrigger 
                value="leaderboard" 
                className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-all"
              >
                <Trophy className="w-4 h-4" />
                Leaderboard
              </TabsTrigger>
              <TabsTrigger 
                value="challenges" 
                className="text-white data-[state=active]:bg-white/20 data-[state=active]:text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-all"
              >
                <Target className="w-4 h-4" />
                Challenges
              </TabsTrigger>
            </TabsList>

            <TabsContent value="leaderboard" className="mt-0">
              <div className="space-y-4">
                {/* Leaderboard Filters */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <LeaderboardFilters
                    scope={scope}
                    onScopeChange={setScope}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                  />
                </div>

                {/* Premium Analytics Toggle */}
                {isPremium && (
                  <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-xl p-3 border border-yellow-300/30">
                    <button
                      onClick={() => setShowAnalytics(!showAnalytics)}
                      className="w-full flex items-center justify-between text-white"
                    >
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-300" />
                        <span className="font-medium">Deeper Analytics</span>
                      </div>
                      <div className="text-xs bg-yellow-300/20 px-2 py-1 rounded-full">
                        {showAnalytics ? "Hide" : "Show"}
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="challenges" className="mt-0">
              <div className="text-white/80 text-sm text-center">
                Explore weekly challenges and community competitions
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-6">
        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsContent value="leaderboard" className="space-y-6">
            {/* Premium Analytics */}
            {isPremium && showAnalytics && (
              <div className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <DeeperAnalytics 
                  streakDays={profile?.streak_count || 0}
                  tip="Keep up your eco-streak! Try biking short distances this week to save CO₂ and boost your impact."
                />
              </div>
            )}

            {/* Leaderboard */}
            <div className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <LeaderboardList 
                  leaderboard={currentLeaderboard} 
                  userId={user?.id}
                  selectedCategory={selectedCategory}
                  onProfileClick={(userId) => navigate(`/profile/${userId}`)}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            <div className="bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <ChallengesHub />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default LeaderboardPage;
