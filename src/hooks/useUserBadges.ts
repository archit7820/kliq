
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "./useAuthStatus";

export function useUserBadges() {
  const { user } = useAuthStatus();
  const userId = user?.id;

  return useQuery({
    queryKey: ["user-badges", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("user_badges")
        .select("*, badge:badge_id(*)")
        .eq("user_id", userId);
      if (error) return [];
      return data.map((row: any) => row.badge);
    },
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
}
