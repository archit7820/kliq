import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ChallengeDetailsPage: React.FC = () => {
  const { challengeId } = useParams();
  const { user } = useAuthStatus();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: challenge } = useQuery({
    queryKey: ["challenge", challengeId],
    queryFn: async () => {
      if (!challengeId) return null;
      const { data } = await supabase
        .from("challenges")
        .select("id, title, description, reward_kelp_points, audience_scope, is_active, created_by")
        .eq("id", challengeId)
        .maybeSingle();
      return data;
    },
    enabled: !!challengeId,
  });

  const { data: participants = [] } = useQuery({
    queryKey: ["challenge-participants", challengeId],
    queryFn: async () => {
      if (!challengeId) return [] as any[];
      const { data } = await supabase
        .from("challenge_participants")
        .select("user_id, is_completed")
        .eq("challenge_id", challengeId);
      return data || [];
    },
    enabled: !!challengeId,
  });

  const joined = !!participants.find((p: any) => p.user_id === user?.id);

  const toggleJoin = async () => {
    if (!user || !challengeId) return;
    if (joined) {
      await supabase
        .from("challenge_participants")
        .delete()
        .eq("challenge_id", challengeId)
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("challenge_participants")
        .insert({ challenge_id: challengeId, user_id: user.id });
    }
    await qc.invalidateQueries({ queryKey: ["challenge-participants", challengeId] });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="p-3 border-b bg-card/60 backdrop-blur">
        <div className="max-w-screen-md mx-auto flex items-center gap-2">
          <Link to="/leaderboard" className="text-sm text-primary">← Back</Link>
          <h1 className="text-lg font-bold">Challenge Details</h1>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto p-4 space-y-4">
        {/* Cover */}
        <div className="h-40 rounded-2xl bg-gradient-to-r from-green-100 to-blue-100 border shadow-inner" />

        <Card>
          <CardContent className="p-4 space-y-2">
            <h2 className="text-xl font-bold">{challenge?.title || "Challenge"}</h2>
            <p className="text-sm text-muted-foreground">{challenge?.description}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border">{challenge?.audience_scope}</span>
              <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border">Reward: {challenge?.reward_kelp_points} pts</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">Participants: {participants.length}</div>
              <Button onClick={toggleJoin} className="rounded-full">
                {joined ? "Leave" : "Join"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="font-semibold mb-2">Live Posts</div>
            <div className="text-sm text-muted-foreground">No posts yet. Be the first to submit!</div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ChallengeDetailsPage;
