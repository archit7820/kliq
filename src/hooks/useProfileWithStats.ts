
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "./useAuthStatus";

export function useProfileWithStats() {
  const { user } = useAuthStatus();

  // Fetch profile data for logged-in user
  const userId = user?.id;
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, kelp_points, streak_count, co2e_weekly_goal, co2e_weekly_progress")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Fetch eco insights for this user
  const { data: insights } = useQuery({
    queryKey: ["eco-insights", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("eco_insights")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) return [];
      return data;
    },
    enabled: !!userId,
  });

  return {
    profile,
    isProfileLoading: isLoading,
    insights: insights ?? [],
    user,
  };
}
