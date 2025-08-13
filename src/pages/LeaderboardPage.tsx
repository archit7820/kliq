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
    <div className="min-h-screen bg-background">
      {/* Clean Header */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-lg border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4">
              <div className="bg-green-500 text-white text-sm font-bold px-2 py-1 rounded">70</div>
              <div className="bg-blue-500 text-white text-sm font-bold px-2 py-1 rounded">98</div>
              <div className="bg-purple-500 text-white text-sm font-bold px-2 py-1 rounded">71</div>
              <div className="bg-orange-500 text-white text-sm font-bold px-2 py-1 rounded">99</div>
              <div className="bg-indigo-500 text-white text-sm font-bold px-2 py-1 rounded">74</div>
            </div>
          </div>
          
          {user && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Rank</p>
              <p className="text-sm font-semibold text-foreground">{getUserRank(user.id)}</p>
            </div>
          )}
        </div>

        <div className="px-4 pb-3">
          <Tabs defaultValue="leaderboard" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Leaderboard
              </TabsTrigger>
              <TabsTrigger value="challenges" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Challenges
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <TabsContent value="leaderboard" className="space-y-4 px-4">
                {/* Leaderboard Filters */}
                <Card>
                  <CardContent className="pt-4">
                    <LeaderboardFilters
                      scope={scope}
                      onScopeChange={setScope}
                      selectedCategory={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                    />
                  </CardContent>
                </Card>

                {/* Leaderboard */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      {scope === "friends" ? "Friends" : "Global"} Leaderboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                        <span className="ml-3 text-muted-foreground">Loading leaderboard...</span>
                      </div>
                    ) : currentLeaderboard.length > 0 ? (
                      <LeaderboardList 
                        leaderboard={currentLeaderboard} 
                        userId={user?.id}
                        selectedCategory={selectedCategory}
                        onProfileClick={(userId) => navigate(`/profile/${userId}`)}
                      />
                    ) : scope === "friends" ? (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">No friends on the leaderboard yet</p>
                        <Button 
                          onClick={() => navigate('/friends')}
                          aria-label="Find friends to compete with"
                        >
                          Find Friends
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No leaderboard data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="challenges" className="space-y-4 px-4">
                <ChallengesSection />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </header>
      
      <div className="pb-20"></div>

      <BottomNav />
    </div>
  );
};

export default LeaderboardPage;
