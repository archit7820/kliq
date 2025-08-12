import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, Users, UserPlus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Badge } from "@/components/ui/badge";

const CommunityList = ({ user }: { user: any }) => {
  const navigate = useNavigate();

  // Fetch communities the user is a member of
  const { data: myCommunities, isLoading: loadingMy } = useQuery({
    queryKey: ["myCommunities", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("community_memberships")
        .select("community_id, communities(name, description, is_official, id)")
        .eq("user_id", user.id);
      return data ? data.map((m) => m.communities) : [];
    },
    enabled: !!user,
  });

  // Fetch all communities (user can join these)
  const { data: allCommunities, isLoading: loadingAll } = useQuery({
    queryKey: ["allCommunities"],
    queryFn: async () => {
      const { data } = await supabase
        .from("communities")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  // Added: Fetch my owned (admin) communities' pending membership count
  const { data: pendingCounts } = useQuery({
    queryKey: ["ownedCommunitiesPendingCounts", user?.id],
    queryFn: async () => {
      if (!user) return {};
      // Get all my (owner) communities
      const { data: communities } = await supabase
        .from("communities")
        .select("id")
        .eq("created_by", user.id);

      const counts: Record<string, number> = {};
      for (const c of communities || []) {
        const { count } = await supabase
          .from("community_memberships")
          .select("*", { count: "exact", head: true })
          .eq("community_id", c.id)
          .eq("status", "pending");
        if (count && count > 0) counts[c.id] = count;
      }
      return counts;
    },
    enabled: !!user,
  });

  // Helper: returns true if user has joined this community
  const isJoined = (communityId: string) =>
    !!myCommunities?.find((c) => c.id === communityId);

  // Join handler
  const handleJoin = async (communityId: string) => {
    if (!user) return;
    await supabase.from("community_memberships").insert({
      user_id: user.id,
      community_id: communityId,
    });
    window.location.reload();
  };

  return (
    <div className="space-y-9">
      <section>
        <h2 className="font-medium text-sm mb-2 text-muted-foreground flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          Your Communities
        </h2>
        {loadingMy ? (
          <div>Loading...</div>
        ) : (
          <div className="flex flex-col gap-3">
            {myCommunities && myCommunities.length > 0 ? (
              myCommunities.map((c) => (
                  <div className="rounded-xl border bg-card p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      {c.is_official && (
                        <Star className="w-4 h-4 text-primary" />
                      )}
                      <span className="font-medium text-foreground">
                        {c.name}
                      </span>
                      {pendingCounts && pendingCounts[c.id] > 0 && (
                        <Badge variant="destructive" className="ml-2">{pendingCounts[c.id]} pending</Badge>
                      )}
                    </div>
                    <span className="block text-sm text-muted-foreground mb-2">
                      {c.description}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="self-end"
                      onClick={() => navigate(`/communities/${c.id}`)}
                    >
                      Open
                    </Button>
                  </div>
              ))
            ) : (
              <span className="text-gray-400 text-base">
                Not a member of any community yet.
              </span>
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-medium text-sm mb-2 text-muted-foreground flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-muted-foreground" />
          Discover Communities
        </h2>
        {loadingAll ? (
          <div>Loading...</div>
        ) : (
          <div className="flex flex-col gap-3">
            {allCommunities &&
              allCommunities
                .filter((c) => !isJoined(c.id))
                .map((c) => (
                  <div className="rounded-xl border bg-card p-4 flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      {c.is_official && (
                        <Star className="w-4 h-4 text-primary" />
                      )}
                      <span className="font-medium text-foreground">
                        {c.name}
                      </span>
                    </div>
                    <span className="block text-sm text-muted-foreground mb-2">
                      {c.description}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleJoin(c.id)}
                      className="self-end"
                    >
                      Join
                    </Button>
                  </div>
                ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CommunityList;
