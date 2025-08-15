
import React from "react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
const sb: any = supabase;
import CommunityCardMinimal, { Community } from "./CommunityCardMinimal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["all", "fitness", "outdoors", "climate", "social"] as const;

type Scope = 'local' | 'national' | 'global';

export default function CommunityDiscover() {
  const { user } = useAuthStatus();
  const [scope, setScope] = React.useState<Scope>('local');
  const [category, setCategory] = React.useState<typeof CATEGORIES[number]>('all');

  const { data: myCommunities = [] } = useQuery({
    queryKey: ["discover-my-communities", user?.id],
    queryFn: async (): Promise<{ id: string }[]> => {
      if (!user) return [] as { id: string }[];
      const { data } = await sb
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
    if (!user) return;
    await supabase.from('community_memberships').insert({ user_id: user.id, community_id: communityId });
    window.location.href = `/communities/${communityId}`;
  };

  const handleOpen = (id: string) => {
    window.location.href = `/communities/${id}`;
  };

  return (
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
  );
}
