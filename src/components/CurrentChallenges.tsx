
import React, { useState } from "react";
import { Trophy } from "lucide-react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ChallengeStatusCard from "@/components/ChallengeStatusCard";
import { toast } from "@/hooks/use-toast";

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
        .select("id, challenge_id, is_completed")
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
    
    try {
      const { error } = await supabase.from("challenge_participants").insert({
        challenge_id: challengeId,
        user_id: user.id,
      });
      
      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: ["user-challenges"] });
      toast({
        title: "Challenge Joined! 🎯",
        description: "You've successfully joined the challenge. Start working towards completion!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setJoiningId(null);
    }
  };

  // Handle real-world actions (for mission logs)
  const handleRealWorldAction = async (challengeId: string, challengeTitle: string) => {
    if (!user) return;
    
    try {
      // Insert a mission log activity
      const { error } = await supabase.from("activities").insert({
        user_id: user.id,
        activity: `Accepted mission: ${challengeTitle}`,
        carbon_footprint_kg: 0,
        explanation: "Mission accepted and logged to activity feed",
        emoji: "🚀",
        category: "mission-log"
      });

      if (error) throw error;

      toast({
        title: "Mission Logged! 🚀",
        description: `"${challengeTitle}" has been logged to your activity feed. Complete your real-world action and mark as completed.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log mission. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get action label based on challenge type
  const getActionLabel = (challengeTitle: string, joined: boolean, completed: boolean) => {
    if (completed) return "Completed!";
    if (!joined) {
      if (challengeTitle.toLowerCase().includes("mission")) return "Accept Mission";
      if (challengeTitle.toLowerCase().includes("tree") || challengeTitle.toLowerCase().includes("event")) return "Join Event";
      if (challengeTitle.toLowerCase().includes("streak") || challengeTitle.toLowerCase().includes("action")) return "Start Tracking";
      return "Accept Challenge";
    }
    return "Mark as Completed";
  };

  // Handle completion refresh
  const handleCompletionRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["user-challenges"] });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
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
          const joined = !!participation;
          const completed = joined && participation.is_completed;

          return (
            <ChallengeStatusCard
              key={ch.id}
              title={ch.title}
              description={ch.description}
              reward={ch.reward_kelp_points}
              joined={joined}
              completed={completed}
              joining={joiningId === ch.id}
              challengeId={ch.id}
              participantId={participation?.id}
              onJoin={() => {
                if (!joined) {
                  handleJoin(ch.id);
                } else {
                  handleRealWorldAction(ch.id, ch.title);
                }
              }}
              onComplete={handleCompletionRefresh}
              actionLabel={getActionLabel(ch.title, joined, completed)}
            />
          );
        })}
      </div>
    </section>
  );
}
