
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
        .from("profiles")
        .select("id, username, avatar_url, kelp_points")
        .order("kelp_points", { ascending: false })
        .limit(10);
      if (error) return [];
      return data;
    },
    enabled: !!user,
  });

  const { data: friendsLeaderboard } = useQuery({
    queryKey: ["friends-leaderboard", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, kelp_points")
        .order("kelp_points", { ascending: false })
        .limit(5); // TODO: Replace with only friends
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
