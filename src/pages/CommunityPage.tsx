import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoaderCircle, Users, Star, ArrowLeft, MessageCircle, Target, TrendingUp, Clock } from "lucide-react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import CommunityChat from "@/components/CommunityChat";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import CommunityMembersManager from "@/components/CommunityMembersManager";
import CommunityChallengeManager from "@/components/CommunityChallengeManager";
import CommunityProgressTracker from "@/components/CommunityProgressTracker";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

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

  const isMobile = useIsMobile();
  const isApprovedMember = myMembership?.status === "approved";
  const canViewContent = user && (amOwner || isApprovedMember);

  // Debug logging
  console.log('🚀 NEW COMMUNITY PAGE LOADING! 🚀');
  console.log('CommunityPage Debug:', {
    user: user?.id,
    community: community?.name,
    myMembership: myMembership?.status,
    amOwner,
    canViewContent,
    isMobile,
    currentUrl: window.location.href
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Debug Banner - Remove this later */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
        ✨ New Enhanced Community Interface ✨ - Check console for debug info
      </div>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/95 border-b">
        <div className="flex items-center gap-3 p-4">
          <Link 
            to="/communities" 
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Users className="w-6 h-6 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-foreground truncate">
                  {community.name}
                </h1>
                {community.is_official && (
                  <Star className="w-4 h-4 text-yellow-500 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs capitalize">
                  {community.scope || 'local'}
                </Badge>
                {community.category && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    {community.category}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Community Description */}
        {community.description && (
          <div className="px-4 pb-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {community.description}
            </p>
          </div>
        )}

        {/* Membership Actions */}
        {user && !amOwner && (
          <div className="px-4 pb-4">
            {!myMembership ? (
              <Button 
                onClick={handleRequestJoin}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Request to Join
              </Button>
            ) : myMembership.status === "pending" ? (
              <Button variant="outline" disabled className="w-full">
                Pending Approval
              </Button>
            ) : myMembership.status === "approved" ? (
              <Button variant="outline" onClick={handleLeave} className="w-full">
                Leave Community
              </Button>
            ) : myMembership.status === "rejected" ? (
              <div className="bg-destructive/10 text-destructive text-center px-3 py-2 rounded-lg text-sm font-medium">
                Request Rejected
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {!canViewContent ? (
          <div className="p-4">
            {!user ? (
              <div className="bg-card border rounded-lg p-6 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <h3 className="font-semibold text-foreground mb-2">Sign In Required</h3>
                <p className="text-muted-foreground text-sm">
                  Please sign in to view community content.
                </p>
              </div>
            ) : myMembership?.status === "pending" ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <Clock className="w-12 h-12 mx-auto mb-3 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800 mb-2">Pending Approval</h3>
                <p className="text-yellow-700 text-sm">
                  Your join request is pending approval. You'll get access once approved by the admin.
                </p>
              </div>
            ) : myMembership?.status === "rejected" ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-destructive/50" />
                <h3 className="font-semibold text-destructive mb-2">Request Rejected</h3>
                <p className="text-destructive/80 text-sm">
                  Your join request was rejected by the community admin.
                </p>
              </div>
            ) : (
              <div className="bg-card border rounded-lg p-6 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <h3 className="font-semibold text-foreground mb-2">Join Community</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Request to join this community to view content and participate.
                </p>
                <Button onClick={handleRequestJoin} className="bg-primary hover:bg-primary/90">
                  Request to Join
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className={`grid w-full ${amOwner ? 'grid-cols-4' : 'grid-cols-3'} bg-muted/50 mx-4 mt-4`}>
              <TabsTrigger value="chat" className="flex items-center gap-1 text-xs">
                <MessageCircle className="w-3 h-3" />
                {!isMobile && "Chat"}
              </TabsTrigger>
              {amOwner && (
                <TabsTrigger value="members" className="flex items-center gap-1 text-xs">
                  <Users className="w-3 h-3" />
                  {!isMobile && "Members"}
                </TabsTrigger>
              )}
              <TabsTrigger value="challenges" className="flex items-center gap-1 text-xs">
                <Target className="w-3 h-3" />
                {!isMobile && "Challenges"}
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-1 text-xs">
                <TrendingUp className="w-3 h-3" />
                {!isMobile && "Progress"}
              </TabsTrigger>
            </TabsList>

            <div className="p-4">
              <TabsContent value="chat" className="mt-0">
                <CommunityChat user={user!} communityId={communityId!} />
              </TabsContent>

              {amOwner && (
                <TabsContent value="members" className="mt-0">
                  <CommunityMembersManager communityId={communityId!} />
                </TabsContent>
              )}

              <TabsContent value="challenges" className="mt-0">
                <CommunityChallengeManager 
                  communityId={communityId!}
                  userId={user!.id}
                  isOwner={amOwner}
                />
              </TabsContent>

              <TabsContent value="progress" className="mt-0">
                <CommunityProgressTracker communityId={communityId!} />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
