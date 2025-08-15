
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "./useAuthStatus";

// Returns global and friend leaderboard data
export function useLeaderboard() {
  const { user } = useAuthStatus();

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_leaderboard_profiles", { limit_count: 10 });
      if (error) return [];
      return data;
    },
    enabled: !!user,
  });

  const { data: friendsLeaderboard } = useQuery({
    queryKey: ["friends-leaderboard", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_leaderboard_profiles", { limit_count: 5 });
      if (error) return [];
      return data;
    },
    enabled: !!user,
  });

  return {
    leaderboard: leaderboard ?? [],
    isLoading,
    friendsLeaderboard: friendsLeaderboard ?? [],
    user,
  };
}
