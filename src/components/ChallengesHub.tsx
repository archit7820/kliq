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
    <div className="w-full space-y-6">
      {/* Kelp Challenges */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Trophy className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Challenges of the Week by Kelp</h3>
            <p className="text-sm text-gray-600">Official eco-challenges curated for impact</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {loadingKelp ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
            </div>
          ) : kelpChallenges.length > 0 ? (
            renderList(kelpChallenges)
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p>New challenges coming soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Community Challenges */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Community Challenges</h3>
            <p className="text-sm text-gray-600">Created by users like you</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {loadingCommunity ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
            </div>
          ) : communityChallenges.length > 0 ? (
            renderList(communityChallenges)
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p>Be the first to create a community challenge!</p>
            </div>
          )}
        </div>
      </section>

      {/* Floating Action Button */}
      <Dialog>
        <DialogTrigger asChild>
          <button
            className="fixed bottom-24 right-6 z-40 btn-green btn-bounce btn-glow w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shadow-xl"
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
