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
      if (category === 'all') {
        const { data } = await sb
          .from("communities")
          .select("*")
          .eq("scope", scope)
          .order("created_at", { ascending: false });
        return (data || []) as any as Community[];
      }
      const { data } = await sb
        .from("communities")
        .select("*")
        .eq("scope", scope)
        .eq("category", category)
        .order("created_at", { ascending: false });
      return (data || []) as any as Community[];
    },
  });

  const isJoined = (id: string) => !!myCommunities.find((c: any) => c.id === id);

  const handleJoin = async (communityId: string) => {
    if (!user) return;
    await supabase.from('community_memberships').insert({ user_id: user.id, community_id: communityId });
    // Optimistic refresh
    await Promise.all([
      supabase.from('community_memberships').select('id').eq('user_id', user.id),
    ]);
    window.location.href = `/communities/${communityId}`;
  };

  const handleOpen = (id: string) => {
    window.location.href = `/communities/${id}`;
  };

  return (
    <section className="w-full space-y-3">
      <Tabs value={scope} onValueChange={(v) => setScope(v as Scope)}>
        <TabsList className="grid grid-cols-3 w-full rounded-2xl bg-muted/60">
          <TabsTrigger value="local" className="data-[state=active]:bg-background">Local</TabsTrigger>
          <TabsTrigger value="national" className="data-[state=active]:bg-background">National</TabsTrigger>
          <TabsTrigger value="global" className="data-[state=active]:bg-background">Global</TabsTrigger>
        </TabsList>
        <TabsContent className="mt-2" value={scope}>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={category === c ? "secondary" : "outline"}
                className="rounded-full whitespace-nowrap"
                onClick={() => setCategory(c)}
              >
                {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading communities…</div>
            ) : (
              communities.map((community) => (
                <CommunityCardMinimal
                  key={community.id}
                  community={community}
                  joined={isJoined(community.id)}
                  onJoin={handleJoin}
                  onOpen={handleOpen}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
