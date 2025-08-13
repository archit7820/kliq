import React, { useState } from "react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ChallengeStatusCard from "@/components/ChallengeStatusCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ChallengeCreate from "@/components/ChallengeCreate";
import { Users, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChallengesHub: React.FC = () => {
  const { user } = useAuthStatus();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const { data: kelpChallenges = [], isLoading: loadingKelp } = useQuery({
    queryKey: ["kelp-week-challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("id, title, description, reward_kelp_points, audience_scope, is_active, created_by")
        .eq("audience_scope", "world")
        .eq("is_active", true)
        .limit(10);
      if (error) return [];
      return data || [];
    },
    refetchInterval: 10000,
  });

  const { data: communityChallenges = [], isLoading: loadingCommunity } = useQuery({
    queryKey: ["community-challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("id, title, description, reward_kelp_points, audience_scope, is_active, created_by")
        .neq("audience_scope", "world")
        .eq("is_active", true)
        .limit(20);
      if (error) return [];
      return data || [];
    },
    refetchInterval: 10000,
  });

  const { data: myParticipation = [] } = useQuery({
    queryKey: ["user-challenges", user?.id],
    queryFn: async () => {
      if (!user) return [] as any[];
      const { data, error } = await supabase
        .from("challenge_participants")
        .select("challenge_id, is_completed")
        .eq("user_id", user.id);
      if (error) return [];
      return data || [];
    },
    enabled: !!user,
  });

  const handleJoin = async (challengeId: string) => {
    if (!user || joiningId) return;
    setJoiningId(challengeId);
    await supabase.from("challenge_participants").insert({ challenge_id: challengeId, user_id: user.id });
    await qc.invalidateQueries({ queryKey: ["user-challenges"] });
    setJoiningId(null);
  };

  const renderList = (list: any[]) => (
    <div className="flex flex-col gap-2">
      {list.map((ch: any) => {
        const participation = (myParticipation || []).find((p: any) => p.challenge_id === ch.id);
        return (
          <div key={ch.id} onClick={() => navigate(`/challenges/${ch.id}`)} className="cursor-pointer">
            <ChallengeStatusCard
              title={ch.title}
              description={ch.description}
              reward={ch.reward_kelp_points}
              joined={!!participation}
              completed={!!participation && participation.is_completed}
              joining={joiningId === ch.id}
              onJoin={() => handleJoin(ch.id)}
            />
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full space-y-5">
      <section>
        <h3 className="text-lg font-bold flex items-center gap-2 mb-3"><Trophy className="w-5 h-5 text-yellow-500" /> Challenges of the Week by Kelp</h3>
        {loadingKelp ? <div className="text-muted-foreground">Loading...</div> : renderList(kelpChallenges)}
      </section>
      <section>
        <h3 className="text-lg font-bold flex items-center gap-2 mb-3"><Users className="w-5 h-5 text-primary" /> Community Challenges</h3>
        {loadingCommunity ? <div className="text-muted-foreground">Loading...</div> : renderList(communityChallenges)}
      </section>

      {/* Floating Action Button */}
      <Dialog>
        <DialogTrigger asChild>
          <button
            className="fixed bottom-24 right-5 z-30 rounded-full shadow-lg border bg-primary text-primary-foreground w-14 h-14 flex items-center justify-center hover:opacity-90"
            aria-label="Create New Challenge"
          >
            +
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Challenge</DialogTitle>
          </DialogHeader>
          <ChallengeCreate />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChallengesHub;
