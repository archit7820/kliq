import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star, Users, UserPlus, MessageCircle, Lock, Key, Globe, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Badge } from "@/components/ui/badge";
import CommunityJoinModal from "./CommunityJoinModal";

const CommunityList = ({ user }: { user: any }) => {
  const navigate = useNavigate();
  const [joinModal, setJoinModal] = useState<{ isOpen: boolean; community: any }>({ 
    isOpen: false, 
    community: null 
  });

  // Fetch communities the user is a member of
  const { data: myCommunities, isLoading: loadingMy } = useQuery({
    queryKey: ["myCommunities", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("community_memberships")
        .select("community_id, status, communities(name, description, is_official, id, privacy_type, created_by)")
        .eq("user_id", user.id);
      return data || [];
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
        .eq("privacy_type", "public")
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

  // Helper: returns membership info if user has joined this community
  const getMembershipInfo = (communityId: string) =>
    myCommunities?.find((m) => m.communities?.id === communityId);

  // Join handler
  const handleJoinClick = (community: any) => {
    setJoinModal({ isOpen: true, community });
  };

  const handleJoinSuccess = () => {
    // Refresh communities data
    window.location.reload();
  };

  const getPrivacyIcon = (privacyType: string) => {
    switch (privacyType) {
      case 'private': return <Lock className="w-4 h-4 text-orange-500" />;
      case 'invite_only': return <Key className="w-4 h-4 text-red-500" />;
      default: return <Globe className="w-4 h-4 text-green-500" />;
    }
  };

  return (
    <div className="space-y-9">
      <section>
        <h2 className="font-medium text-sm mb-2 text-muted-foreground flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          Your Communities
        </h2>
        {loadingMy ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-3">
            {myCommunities && myCommunities.length > 0 ? (
              myCommunities.map((membership) => {
                const community = membership.communities;
                if (!community) return null;
                
                return (
                  <div key={community.id} className="rounded-xl border bg-card p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {community.is_official && (
                            <Star className="w-4 h-4 text-primary" />
                          )}
                          {community.created_by === user?.id && (
                            <Crown className="w-4 h-4 text-primary" />
                          )}
                          <span className="font-medium text-foreground">
                            {community.name}
                          </span>
                          {getPrivacyIcon(community.privacy_type)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {community.description}
                        </p>
                        
                        {/* Status badges */}
                        <div className="flex items-center gap-2">
                          {membership.status === 'pending' && (
                            <Badge variant="secondary">Pending Approval</Badge>
                          )}
                          {pendingCounts && pendingCounts[community.id] > 0 && (
                            <Badge variant="destructive">{pendingCounts[community.id]} requests</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/communities/${community.id}`)}
                      disabled={membership.status === 'pending'}
                    >
                      {membership.status === 'pending' ? 'Waiting for Approval' : 'Open Community'}
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Not a member of any community yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Join communities below to get started!</p>
              </div>
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
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-3">
            {allCommunities
              .filter((c) => !getMembershipInfo(c.id))
              .map((community) => (
                <div key={community.id} className="rounded-xl border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {community.is_official && (
                          <Star className="w-4 h-4 text-primary" />
                        )}
                        <span className="font-medium text-foreground">
                          {community.name}
                        </span>
                        {getPrivacyIcon(community.privacy_type)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {community.description}
                      </p>
                      {community.category && (
                        <Badge variant="outline" className="text-xs">
                          {community.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => handleJoinClick(community)}
                    className="w-full"
                  >
                    {community.privacy_type === 'invite_only' ? 'Join with Code' :
                     community.privacy_type === 'private' ? 'Request to Join' : 'Join'}
                  </Button>
                </div>
              ))}
          </div>
        )}
      </section>
      
      {/* Join Modal */}
      {joinModal.community && (
        <CommunityJoinModal
          community={joinModal.community}
          isOpen={joinModal.isOpen}
          onClose={() => setJoinModal({ isOpen: false, community: null })}
          onSuccess={handleJoinSuccess}
          userId={user?.id}
        />
      )}
    </div>
  );
};

export default CommunityList;
