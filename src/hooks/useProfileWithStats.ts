
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "./useAuthStatus";

// Updated to select all fields from profiles
export function useProfileWithStats() {
  const { user } = useAuthStatus();

  // Fetch profile data for logged-in user
  const userId = user?.id;
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      // Select * to get all available profile fields for type safety
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
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
