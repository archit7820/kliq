
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
  const [completingId, setCompletingId] = useState<string | null>(null);

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

  // Handle completion - simplified verification
  const handleComplete = async (challengeId: string, challengeTitle: string, participantId: string, rewardPoints: number) => {
    if (!user || completingId) return;
    setCompletingId(challengeId);
    
    try {
      // 1. Mark challenge as completed
      const { error: updateError } = await supabase
        .from("challenge_participants")
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("id", participantId);
      
      if (updateError) throw updateError;

      // 2. Add activity to feed
      const { error: activityError } = await supabase.from("activities").insert({
        user_id: user.id,
        activity: `Completed challenge: ${challengeTitle}`,
        caption: "Challenge completed successfully!",
        category: "challenge",
        explanation: "Challenge completion verified",
        carbon_footprint_kg: 0,
        emoji: "🏆",
      });
      
      if (activityError) throw activityError;

      // 3. Reward kelp points
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("kelp_points")
        .eq("id", user.id)
        .single();
      
      if (profileError) throw profileError;
      
      const currentPoints = Number(profile?.kelp_points ?? 0);
      const { error: pointsError } = await supabase.from("profiles").update({
        kelp_points: currentPoints + rewardPoints,
      }).eq("id", user.id);
      
      if (pointsError) throw pointsError;

      await queryClient.invalidateQueries({ queryKey: ["user-challenges"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      
      toast({
        title: "Challenge Completed! 🎉",
        description: `Congratulations! You earned ${rewardPoints} Kelp Points.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCompletingId(null);
    }
  };

  // Handle real-world actions
  const handleRealWorldAction = (challengeTitle: string) => {
    let actionMessage = "";
    
    if (challengeTitle.toLowerCase().includes("mission")) {
      actionMessage = `Mission "${challengeTitle}" accepted! Complete your real-world action and mark as completed.`;
    } else if (challengeTitle.toLowerCase().includes("streak") || challengeTitle.toLowerCase().includes("action")) {
      actionMessage = `Action logged for "${challengeTitle}"! Keep up the great work.`;
    } else if (challengeTitle.toLowerCase().includes("tree") || challengeTitle.toLowerCase().includes("event")) {
      actionMessage = `Successfully joined event: "${challengeTitle}"! Details will be shared soon.`;
    } else {
      actionMessage = `Action taken for "${challengeTitle}"! Progress recorded.`;
    }
    
    toast({
      title: "Action Recorded! 🎯",
      description: actionMessage,
    });
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
              onJoin={() => {
                if (!joined) {
                  handleJoin(ch.id);
                } else {
                  handleRealWorldAction(ch.title);
                }
              }}
              onComplete={joined && !completed ? () => handleComplete(ch.id, ch.title, participation.id, ch.reward_kelp_points) : undefined}
              actionLabel={getActionLabel(ch.title, joined, completed)}
            />
          );
        })}
      </div>
    </section>
  );
}
