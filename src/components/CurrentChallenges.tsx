
import React, { useState } from "react";
import { Trophy } from "lucide-react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ChallengeStatusCard from "@/components/ChallengeStatusCard";
import ChallengeVerificationDialog from "./ChallengeVerificationDialog";

export default function CurrentChallenges() {
  const { user } = useAuthStatus();
  const queryClient = useQueryClient();
  const [joiningId, setJoiningId] = useState<string | null>(null);

  // Fetch all global (Kelp) challenges
  const { data: challenges, isLoading } = useQuery({
    queryKey: ["global-challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("id, title, description, reward_kelp_points, audience_scope, is_active")
        .eq("audience_scope", "world")
        .eq("is_active", true);
      if (error) return [];
      return data || [];
    },
    refetchInterval: 10_000,
  });

  // Fetch my participation
  const { data: myParticipation } = useQuery({
    queryKey: ["user-challenges", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("challenge_participants")
        .select("challenge_id, is_completed")
        .eq("user_id", user.id);
      if (error) return [];
      return data || [];
    },
    enabled: !!user,
    refetchInterval: 10_000,
  });

  // Join handler
  const handleJoin = async (challengeId: string) => {
    if (!user || joiningId) return;
    setJoiningId(challengeId);
    await supabase.from("challenge_participants").insert({
      challenge_id: challengeId,
      user_id: user.id,
    });
    await queryClient.invalidateQueries({ queryKey: ["user-challenges"] });
    setJoiningId(null);
  };

  // Render
  return (
    <section className="mt-4 animate-fade-in">
      <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
        <Trophy className="w-5 h-5 text-yellow-500" />
        Current Challenges
      </h2>
      <div className="flex flex-col gap-2">
        {isLoading && (
          <div className="text-gray-300 py-5">Loading challenges...</div>
        )}
        {challenges && challenges.length === 0 && (
          <div className="text-gray-400 py-5 text-center rounded-xl bg-purple-50 border">
            No live challenges right now.
          </div>
        )}
        {challenges && challenges.map((ch: any) => {
          const participation = (myParticipation || []).find(
            (p: any) => p.challenge_id === ch.id
          );
          return (
            <ChallengeStatusCard
              key={ch.id}
              title={ch.title}
              description={ch.description}
              reward={ch.reward_kelp_points}
              joined={!!participation}
              completed={!!participation && participation.is_completed}
              joining={joiningId === ch.id}
              onJoin={() => handleJoin(ch.id)}
              onComplete={() => {/* Intentionally left out: handled by ChallengeVerificationDialog elsewhere */}}
            />
          );
        })}
      </div>
    </section>
  );
}
