
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, Users, UserPlus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
        <h2 className="font-semibold text-lg mb-3 flex gap-2 items-center text-green-700">
          <Users className="w-5 h-5 text-green-400" />
          Your Communities
        </h2>
        {loadingMy ? (
          <div>Loading...</div>
        ) : (
          <div className="flex flex-col gap-3">
            {myCommunities && myCommunities.length > 0 ? (
              myCommunities.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-xl border p-4 flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {c.is_official && (
                      <Star className="w-4 h-4 text-yellow-400" />
                    )}
                    <span className="font-bold text-green-800 text-lg">
                      {c.name}
                    </span>
                  </div>
                  <span className="block text-gray-500 text-sm mb-2">
                    {c.description}
                  </span>
                  <Button
                    className="rounded-lg text-xs bg-green-600 hover:bg-green-700 mt-auto self-end flex gap-1 items-center"
                    size="sm"
                    onClick={() => navigate(`/communities/${c.id}`)}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Open Chat
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
        <h2 className="font-semibold text-lg mb-3 flex gap-2 items-center text-blue-700">
          <UserPlus className="w-5 h-5 text-blue-400" />
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
                  <div
                    key={c.id}
                    className="bg-gradient-to-tr from-green-50 to-blue-50 rounded-xl border p-4 flex flex-col"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {c.is_official && (
                        <Star className="w-4 h-4 text-yellow-400" />
                      )}
                      <span className="font-bold text-green-800 text-lg">
                        {c.name}
                      </span>
                    </div>
                    <span className="block text-gray-500 text-sm mb-2">
                      {c.description}
                    </span>
                    <Button
                      variant="secondary"
                      className="rounded-lg text-xs bg-blue-600 hover:bg-blue-700 text-white mt-auto self-end"
                      size="sm"
                      onClick={() => handleJoin(c.id)}
                    >
                      Join Community
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
