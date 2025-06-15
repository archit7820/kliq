
import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoaderCircle, Users } from "lucide-react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import CommunityChat from "@/components/CommunityChat";

const CommunityPage = () => {
  const { user } = useAuthStatus();
  const { communityId } = useParams();

  const { data: community, isLoading, error } = useQuery({
    queryKey: ["community", communityId],
    queryFn: async () => {
      const { data } = await supabase.from("communities").select("*").eq("id", communityId).maybeSingle();
      return data;
    },
    enabled: !!communityId
  });

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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white py-4 px-4 border-b flex items-center gap-2">
        <Link to="/communities" className="text-blue-700 hover:underline">&larr; Back</Link>
        <Users className="w-6 h-6 text-green-700" />
        <span className="text-xl font-bold text-green-900">{community.name}</span>
      </div>
      <div className="max-w-screen-md mx-auto pt-6 px-2">
        <p className="text-lg font-semibold text-green-700">{community.description}</p>
        <div className="my-6">
          {user && communityId && (
            <CommunityChat user={user} communityId={communityId} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
