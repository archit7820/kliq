
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfileWithStats } from "@/hooks/useProfileWithStats";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import LeaderboardFilters from "@/components/LeaderboardFilters";
import LeaderboardList from "@/components/LeaderboardList";
import ChallengesSection from "@/components/ChallengesSection";
import { Trophy, Target, Plus } from "lucide-react";

const useRealtimeSync = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!userId) return;
    const triggerRefetch = () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["friends-leaderboard", userId] });
      queryClient.invalidateQueries({ queryKey: ["user-challenges", userId] });
    };
    const tables = [
      { table: "profiles", filterKey: "id", userKey: userId },
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

const LeaderboardPage = () => {
  const { profile, user } = useProfileWithStats();
  const { leaderboard, isLoading, friendsLeaderboard } = useLeaderboard();
  const navigate = useNavigate();
  useRealtimeSync(user?.id);

  const [scope, setScope] = useState<"global" | "national" | "local" | "friends">("global");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const getUserRank = (userId: string) => {
    const currentLeaderboard = scope === "friends" ? friendsLeaderboard : leaderboard;
    const index = currentLeaderboard.findIndex((item: any) => item.id === userId);
    return index !== -1 ? `#${index + 1}` : "Unranked";
  };

  const currentLeaderboard = scope === "friends" ? friendsLeaderboard : leaderboard;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile-First Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded min-w-[28px] text-center">70</div>
              <div className="bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded min-w-[28px] text-center">98</div>
              <div className="bg-purple-500 text-white text-xs font-bold px-1.5 py-0.5 rounded min-w-[28px] text-center">71</div>
              <div className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded min-w-[28px] text-center">99</div>
              <div className="bg-indigo-500 text-white text-xs font-bold px-1.5 py-0.5 rounded min-w-[28px] text-center">74</div>
            </div>
          </div>
          
          {user && (
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-muted-foreground">Rank</p>
              <p className="text-sm font-semibold text-foreground">{getUserRank(user.id)}</p>
            </div>
          )}
        </div>

        <div className="px-3 pb-2">
          <Tabs defaultValue="leaderboard" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-9">
              <TabsTrigger value="leaderboard" className="flex items-center gap-1.5 text-xs">
                <Trophy className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Leaderboard</span>
                <span className="xs:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="challenges" className="flex items-center gap-1.5 text-xs">
                <Target className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Challenges</span>
                <span className="xs:hidden">Goals</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-3">
              <TabsContent value="leaderboard" className="space-y-3 mt-0">
                {/* Mobile-Optimized Leaderboard Filters */}
                <Card className="border-border/50">
                  <CardContent className="p-3">
                    <LeaderboardFilters
                      scope={scope}
                      onScopeChange={setScope}
                      selectedCategory={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                    />
                  </CardContent>
                </Card>

                {/* Mobile-Optimized Leaderboard */}
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Trophy className="w-4 h-4" />
                      <span className="truncate">
                        {scope === "friends" ? "Friends" : "Global"} Rankings
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                        <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                      </div>
                    ) : currentLeaderboard.length > 0 ? (
                      <LeaderboardList 
                        leaderboard={currentLeaderboard} 
                        userId={user?.id}
                        selectedCategory={selectedCategory}
                        onProfileClick={(userId) => navigate(`/profile/${userId}`)}
                      />
                    ) : scope === "friends" ? (
                      <div className="text-center py-8">
                        <Trophy className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground mb-3">No friends on the leaderboard yet</p>
                        <Button 
                          size="sm"
                          onClick={() => navigate('/friends')}
                          aria-label="Find friends to compete with"
                        >
                          Find Friends
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Trophy className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No leaderboard data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="challenges" className="space-y-3 mt-0">
                <div className="px-0">
                  <ChallengesSection />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </header>

      <BottomNav />
    </div>
  );
};

export default LeaderboardPage;
