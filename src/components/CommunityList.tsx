
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CommunityCardMinimal from "./CommunityCardMinimal";

interface CommunityListProps {
  user: any;
}

const CommunityList: React.FC<CommunityListProps> = ({ user }) => {
  const { data: userCommunities = [], isLoading } = useQuery({
    queryKey: ["user-communities", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("community_memberships")
        .select(`
          communities (
            id,
            name,
            description,
            is_official,
            scope,
            category,
            cover_image_url
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "approved");
      
      if (error) throw error;
      return data?.map(item => item.communities).filter(Boolean) || [];
    },
    enabled: !!user,
  });

  const handleOpen = (id: string) => {
    window.location.href = `/communities/${id}`;
  };

  if (isLoading) {
    return (
      <section className="w-full space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-sm font-semibold text-foreground">My Communities</h2>
        </div>
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
          <span className="ml-2 text-xs text-muted-foreground">Loading...</span>
        </div>
      </section>
    );
  }

  if (userCommunities.length === 0) {
    return (
      <section className="w-full space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-sm font-semibold text-foreground">My Communities</h2>
        </div>
        <div className="text-center py-4 bg-card rounded-lg border border-dashed border-border">
          <p className="text-xs text-muted-foreground mb-2">No communities joined yet</p>
          <p className="text-xs text-muted-foreground">Discover communities below to get started!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-foreground">My Communities</h2>
        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
          {userCommunities.length}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {userCommunities.map((community: any) => (
          <CommunityCardMinimal
            key={community.id}
            community={community}
            joined={true}
            onJoin={() => {}}
            onOpen={handleOpen}
          />
        ))}
      </div>
    </section>
  );
};

export default CommunityList;
