
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";

interface CommunityListProps {
  user: User | null;
}

const CommunityList: React.FC<CommunityListProps> = ({ user }) => {
  // My communities (joined)
  const { data: myCommunities, isLoading: loadingMy } = useQuery({
    queryKey: ["myCommunities", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: memberships } = await supabase
        .from("community_memberships")
        .select("community_id");
      if (!memberships) return [];
      const communityIds = memberships.map((m) => m.community_id);
      if (communityIds.length === 0) return [];
      const { data: communities } = await supabase
        .from("communities")
        .select("*")
        .in("id", communityIds)
        .order("created_at", { ascending: false });
      return communities || [];
    },
    enabled: !!user,
  });

  // Official communities (not joined)
  const { data: officialCommunities, isLoading: loadingOfficial } = useQuery({
    queryKey: ["officialCommunities", user?.id],
    queryFn: async () => {
      const { data: communities } = await supabase
        .from("communities")
        .select("*")
        .eq("is_official", true)
        .order("created_at", { ascending: false });
      return communities || [];
    },
  });

  // Discover more (not joined, not official)
  const { data: discoverCommunities } = useQuery({
    queryKey: ["discoverCommunities", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: memberships } = await supabase
        .from("community_memberships")
        .select("community_id");
      const { data: communities } = await supabase
        .from("communities")
        .select("*")
        .order("created_at", { ascending: false });
      // Filter out joined
      const joinedIds = memberships ? memberships.map((m) => m.community_id) : [];
      return (
        communities?.filter(
          (c) => !joinedIds.includes(c.id) && !c.is_official
        ) || []
      );
    },
    enabled: !!user,
  });

  return (
    <div className="space-y-7">
      <section>
        <h2 className="font-semibold text-lg mb-3">My Communities</h2>
        {loadingMy ? (
          <p className="text-gray-500">Loading...</p>
        ) : myCommunities && myCommunities.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
            {myCommunities.map((community) => (
              <Link
                key={community.id}
                to={`/communities/${community.id}`}
                className="shrink-0"
              >
                <Card className="w-44 p-3 min-w-[11rem] flex flex-col items-center gap-2 bg-white border shadow-md rounded-xl">
                  <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">
                    {community.name}
                  </span>
                  <span className="text-xs text-gray-500 max-w-full text-center">
                    {community.description}
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-sm">You haven&apos;t joined any communities yet.</div>
        )}
      </section>
      <section>
        <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" /> Official Communities
        </h2>
        {loadingOfficial ? (
          <p className="text-gray-500">Loading...</p>
        ) : officialCommunities && officialCommunities.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
            {officialCommunities.map((community) => (
              <Link
                key={community.id}
                to={`/communities/${community.id}`}
                className="shrink-0"
              >
                <Card className="w-44 p-3 min-w-[11rem] flex flex-col items-center gap-2 bg-white border shadow-md rounded-xl">
                  <span className="bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full text-xs">
                    {community.name}
                  </span>
                  <span className="text-xs text-gray-500 max-w-full text-center">
                    {community.description}
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-sm">No official communities yet.</div>
        )}
      </section>
      <section>
        <h2 className="font-semibold text-lg mb-3">Discover More</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
          {discoverCommunities && discoverCommunities.length > 0 ? (
            discoverCommunities.map((community) => (
              <Link
                key={community.id}
                to={`/communities/${community.id}`}
                className="shrink-0"
              >
                <Card className="w-44 p-3 min-w-[11rem] flex flex-col items-center gap-2 bg-white border shadow-md rounded-xl">
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {community.name}
                  </span>
                  <span className="text-xs text-gray-500 max-w-full text-center">
                    {community.description}
                  </span>
                </Card>
              </Link>
            ))
          ) : (
            <div className="text-gray-500 text-sm">No more communities to discover.</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CommunityList;
