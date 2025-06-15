import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoaderCircle, Users, Star } from "lucide-react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import CommunityChat from "@/components/CommunityChat";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import CommunityMembersManager from "@/components/CommunityMembersManager";

const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

const CommunityPage = () => {
  const { user } = useAuthStatus();
  const { communityId } = useParams();

  // If we're on /communities/create or the id is invalid, show "Not found"
  if (!communityId || communityId === "create" || !isValidUUID(communityId)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-500">
        Community not found.
      </div>
    );
  }

  const { data: community, isLoading, error } = useQuery({
    queryKey: ["community", communityId],
    queryFn: async () => {
      const { data } = await supabase.from("communities").select("*").eq("id", communityId).maybeSingle();
      return data;
    },
    enabled: !!communityId
  });

  // Get my membership row
  const { data: myMembership, refetch: refetchMembership } = useQuery({
    queryKey: ["community-membership", user?.id, communityId],
    queryFn: async () => {
      if (!user || !communityId) return null;
      const { data } = await supabase
        .from("community_memberships")
        .select("*")
        .eq("user_id", user.id)
        .eq("community_id", communityId)
        .maybeSingle();
      return data;
    },
    enabled: !!user && !!communityId,
  });

  // Request membership (or join instantly for open)
  const handleRequestJoin = async () => {
    if (!user || !communityId) return;
    const { error } = await supabase.from("community_memberships").insert({
      user_id: user.id,
      community_id: communityId,
      status: "pending"
    });
    if (error) {
      toast({ title: "Could not request to join", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Join request sent.", description: "Wait for approval from community owner." });
    refetchMembership();
  };

  // Leave (delete membership row)
  const handleLeave = async () => {
    if (!user || !communityId || !myMembership) return;
    const { error } = await supabase
      .from("community_memberships")
      .delete()
      .eq("id", myMembership.id);
    if (error) {
      toast({ title: "Could not leave", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "You have left the community." });
    refetchMembership();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <LoaderCircle className="w-8 h-8 animate-spin text-green-600" />
        <span className="text-green-700 mt-3">Loading community...</span>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-500">
        Community not found.
      </div>
    );
  }

  // Only owner of community can see the membership requests
  const amOwner = user && user.id === community.created_by;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white py-4 px-4 border-b flex items-center gap-2">
        <Link to="/communities" className="text-blue-700 hover:underline">&larr; Back</Link>
        <Users className="w-6 h-6 text-blue-700" />
        <span className="text-xl font-bold text-blue-900">{community.name}</span>
        {community.is_official && (
          <Star className="w-5 h-5 text-yellow-400 ml-2" />
        )}
      </div>
      <div className="max-w-screen-md mx-auto pt-6 px-2">
        <p className="text-lg font-semibold text-blue-700">{community.description}</p>
        {/* Membership actions */}
        {user && !amOwner && (
          <div className="my-5">
            {!myMembership ? (
              <Button className="bg-blue-700 text-white hover:bg-blue-800" onClick={handleRequestJoin}>
                Request to Join
              </Button>
            ) : myMembership.status === "pending" ? (
              <Button variant="outline" disabled>
                Pending Approval
              </Button>
            ) : myMembership.status === "approved" ? (
              <Button variant="destructive" onClick={handleLeave}>
                Leave Community
              </Button>
            ) : myMembership.status === "rejected" ? (
              <span className="bg-red-100 text-red-600 px-3 py-1 rounded">
                Request Rejected
              </span>
            ) : null}
          </div>
        )}

        {amOwner && (
          <CommunityMembersManager communityId={communityId!} />
        )}

        <div className="my-6">
          {user && myMembership && myMembership.status === "approved" && (
            <CommunityChat user={user} communityId={communityId!} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
