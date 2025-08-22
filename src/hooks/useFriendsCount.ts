
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "./useAuthStatus";

export function useFriendsCount() {
  const { user } = useAuthStatus();

  const { data: friendsCount = 0, isLoading } = useQuery({
    queryKey: ["friends-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      
      const { data, error } = await supabase
        .from("friends")
        .select("id", { count: "exact" })
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (error) {
        console.error("Error fetching friends count:", error);
        return 0;
      }

      return data?.length || 0;
    },
    enabled: !!user,
  });

  return { friendsCount, isLoading };
}
