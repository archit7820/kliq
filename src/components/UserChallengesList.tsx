
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Button } from "@/components/ui/button";
import ChallengeVerificationDialog from "./ChallengeVerificationDialog";
import { CheckCircle2, Clock } from "lucide-react";

// Define types for clarity
type ChallengeParticipant = {
  id: string;
  challenge_id: string;
  completed_at: string | null;
  is_completed: boolean;
  joined_at: string;
  challenge: {
    id: string;
    title: string;
    description: string | null;
    reward_kelp_points: number;
  };
};

export default function UserChallengesList() {
  const { user } = useAuthStatus();

  const { data: userChallenges, isLoading, refetch } = useQuery({
    queryKey: ["user-challenges", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("challenge_participants")
        .select(`
          id, challenge_id, completed_at, is_completed, joined_at,
          challenge:challenge_id (
            id, title, description, reward_kelp_points
          )
        `)
        .eq("user_id", user.id)
        .order("joined_at", { ascending: false });
      if (error) {
        console.error("Error fetching user challenges:", error);
        return [];
      }
      // filter out if no attached challenge (data error)
      return (data ?? []).filter((row: any) => !!row.challenge);
    },
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold mb-2 flex gap-2 items-center text-purple-800">
        <Clock className="w-5 h-5 text-purple-400" />
        My Current Challenges
      </h2>
      {isLoading && (
        <div className="text-gray-500 py-4">Loading your current challenges...</div>
      )}
      {userChallenges && userChallenges.length === 0 && (
        <div className="text-gray-500 py-4">
          You haven't joined any challenges yet.
        </div>
      )}
      <div className="flex flex-col gap-3">
        {userChallenges && userChallenges.map((row: ChallengeParticipant) => (
          <div
            key={row.id}
            className="bg-purple-50 border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between shadow transition"
          >
            <div>
              <div className="font-medium text-purple-900">{row.challenge.title}</div>
              <div className="text-xs text-purple-700 mb-2">
                {row.challenge.description}
              </div>
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 font-mono text-[11px] px-2 py-0.5 rounded-full">
                Reward: {row.challenge.reward_kelp_points} Kelp Points
              </span>
            </div>
            <div className="flex flex-row gap-2 items-center mt-2 md:mt-0">
              {row.is_completed ? (
                <span className="inline-flex items-center text-green-700 text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5 mr-1" /> Completed!
                </span>
              ) : (
                <ChallengeVerificationDialog
                  challenge={{
                    id: row.challenge.id,
                    title: row.challenge.title,
                    description: row.challenge.description || "",
                    reward: row.challenge.reward_kelp_points,
                  }}
                  participantId={row.id}
                  onFinish={refetch}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
