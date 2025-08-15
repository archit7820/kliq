
import React, { useState } from "react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import CommunityCardMinimal, { Community } from "./CommunityCardMinimal";
import CommunityJoinModal from "./CommunityJoinModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const CATEGORIES = ["all", "fitness", "outdoors", "climate", "social"] as const;

type Scope = 'local' | 'national' | 'global';

export default function CommunityDiscover() {
  const { user } = useAuthStatus();
  const queryClient = useQueryClient();
  const [scope, setScope] = React.useState<Scope>('local');
  const [category, setCategory] = React.useState<typeof CATEGORIES[number]>('all');
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const { data: myCommunities = [] } = useQuery({
    queryKey: ["discover-my-communities", user?.id],
    queryFn: async (): Promise<{ id: string }[]> => {
      if (!user) return [] as { id: string }[];
      const { data } = await supabase
        .from("community_memberships")
        .select("communities(id)")
        .eq("user_id", user.id)
        .eq("status", "approved");
      return (data || []).map((r: any) => r.communities as { id: string });
    },
    enabled: !!user,
  });

  const { data: communities = [], isLoading } = useQuery({
    queryKey: ["discover-communities", scope, category],
    queryFn: async (): Promise<Community[]> => {
      const { data, error } = await supabase.rpc("get_discoverable_communities", {
        p_scope: scope,
        p_category: category === 'all' ? null : category
      });
      if (error) throw error;
      return (data || []) as any as Community[];
    },
  });

  const isJoined = (id: string) => !!myCommunities.find((c: any) => c.id === id);

  const handleJoin = async (communityId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to join communities.",
        variant: "destructive"
      });
      return;
    }

    const community = communities.find(c => c.id === communityId);
    if (!community) {
      toast({
        title: "Community not found",
        description: "The community you're trying to join could not be found.",
        variant: "destructive"
      });
      return;
    }

    // For now, we'll assume all communities are public for direct join
    // In the future, you might want to check community privacy_type here
    try {
      const { error } = await supabase
        .from('community_memberships')
        .insert({
          user_id: user.id,
          community_id: communityId,
          status: 'approved' // Assuming public communities auto-approve
        });

      if (error) {
        if (error.code === '23505') { // Duplicate key error
          toast({
            title: "Already a member",
            description: "You're already a member of this community.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Failed to join",
            description: error.message,
            variant: "destructive"
          });
        }
        return;
      }

      toast({
        title: "Successfully joined!",
        description: `Welcome to ${community.name}!`,
      });

      // Refresh the communities list
      queryClient.invalidateQueries({ queryKey: ["discover-my-communities"] });
      
      // Navigate to the community page
      window.location.href = `/communities/${communityId}`;
    } catch (error) {
      console.error('Error joining community:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleOpen = (id: string) => {
    window.location.href = `/communities/${id}`;
  };

  const handleJoinClick = (communityId: string) => {
    const community = communities.find(c => c.id === communityId);
    if (community) {
      setSelectedCommunity(community);
      setIsJoinModalOpen(true);
    }
  };

  const handleJoinSuccess = () => {
    // Refresh the communities list
    queryClient.invalidateQueries({ queryKey: ["discover-my-communities"] });
    setIsJoinModalOpen(false);
    setSelectedCommunity(null);
    
    // Navigate to the community page if we have a selected community
    if (selectedCommunity) {
      setTimeout(() => {
        window.location.href = `/communities/${selectedCommunity.id}`;
      }, 1000); // Small delay to let the success message show
    }
  };

  return (
    <>
      <section className="w-full space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-sm font-semibold text-foreground">Discover Communities</h2>
        </div>
        
        <Tabs value={scope} onValueChange={(v) => setScope(v as Scope)}>
          <TabsList className="grid grid-cols-3 w-full rounded-lg bg-muted/60 h-8">
            <TabsTrigger value="local" className="data-[state=active]:bg-background text-xs py-1">
              Local
            </TabsTrigger>
            <TabsTrigger value="national" className="data-[state=active]:bg-background text-xs py-1">
              National
            </TabsTrigger>
            <TabsTrigger value="global" className="data-[state=active]:bg-background text-xs py-1">
              Global
            </TabsTrigger>
          </TabsList>
          
          <TabsContent className="mt-2" value={scope}>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2">
              {CATEGORIES.map((c) => (
                <Button
                  key={c}
                  size="sm"
                  variant={category === c ? "secondary" : "outline"}
                  className="rounded-full whitespace-nowrap text-xs py-1 px-2.5 h-6 flex-shrink-0"
                  onClick={() => setCategory(c)}
                >
                  {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
                </Button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 gap-2 mt-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                  <span className="ml-2 text-xs text-muted-foreground">Loading communities…</span>
                </div>
              ) : communities.length > 0 ? (
                communities.map((community) => (
                  <CommunityCardMinimal
                    key={community.id}
                    community={community}
                    joined={isJoined(community.id)}
                    onJoin={handleJoin}
                    onOpen={handleOpen}
                  />
                ))
              ) : (
                <div className="text-center py-6 bg-card rounded-lg border border-dashed border-border">
                  <p className="text-xs text-muted-foreground">No communities found</p>
                  <p className="text-xs text-muted-foreground mt-1">Try a different category or scope</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {selectedCommunity && (
        <CommunityJoinModal
          community={{
            id: selectedCommunity.id,
            name: selectedCommunity.name,
            description: selectedCommunity.description || undefined,
            privacy_type: 'public', // Assuming public for now
          }}
          isOpen={isJoinModalOpen}
          onClose={() => {
            setIsJoinModalOpen(false);
            setSelectedCommunity(null);
          }}
          onSuccess={handleJoinSuccess}
          userId={user?.id || ''}
        />
      )}
    </>
  );
}
