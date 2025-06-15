
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import ChallengeVerificationDialog from "./ChallengeVerificationDialog";
import { CheckCircle2, Clock, RefreshCw } from "lucide-react";

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

function ChallengeCard({
  row,
  onVerified
}: {
  row: ChallengeParticipant;
  onVerified: () => void;
}) {
  return (
    <div
      className={`animate-fade-in bg-white border border-purple-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between shadow-sm group transition hover:scale-[1.02] hover:shadow-lg focus-within:scale-[1.02] active:scale-[0.98] outline-none`}
      tabIndex={0}
      role="group"
    >
      <div>
        <div className="font-bold text-purple-900 text-base flex items-center gap-2">
          {row.challenge.title}
          {row.is_completed && (
            <span className="inline-flex ml-2 text-green-700 items-center gap-1">
              <CheckCircle2 className="w-5 h-5 animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
            </span>
          )}
        </div>
        <div className="text-xs text-purple-700 mb-2">{row.challenge.description}</div>
        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 font-mono text-[11px] px-2 py-0.5 rounded-full mt-1">
          Reward: {row.challenge.reward_kelp_points} Kelp Points
        </span>
      </div>
      <div className="flex flex-row gap-2 items-center mt-3 md:mt-0 transition-all min-w-[130px] justify-end">
        {!row.is_completed ? (
          <ChallengeVerificationDialog
            challenge={{
              id: row.challenge.id,
              title: row.challenge.title,
              description: row.challenge.description || "",
              reward: row.challenge.reward_kelp_points,
            }}
            participantId={row.id}
            onFinish={onVerified}
          />
        ) : (
          <span className="inline-flex items-center text-green-700 text-base px-3 py-1.5 rounded-lg bg-green-50 font-semibold ml-2 transition-all animate-fade-in">
            <CheckCircle2 className="w-5 h-5 mr-1" /> Completed!
          </span>
        )}
      </div>
    </div>
  );
}

export default function UserChallengesList() {
  const { user } = useAuthStatus();
  const [subscribing, setSubscribing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
      return (data ?? []).filter((row: any) => !!row.challenge);
    },
    enabled: !!user,
  });

  // Real-time sync: listen for changes to user's challenge_participants
  useEffect(() => {
    if (!user) return;
    setSubscribing(true);
    const channel = supabase
      .channel('challenge-realtime')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenge_participants',
          filter: `user_id=eq.${user.id}`
        },
        (_payload) => {
          refetch();
        }
      )
      .subscribe();
    setSubscribing(false);
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);

  if (!user) return null;

  return (
    <section className="mt-4 animate-fade-in" id="user-my-current-challenges">
      <h2 className="text-base sm:text-lg font-bold mb-4 flex gap-2 items-center text-purple-800 tracking-tight">
        <Clock className="w-5 h-5 text-purple-400" />
        My Current Challenges
        <button
          aria-label="refresh"
          className="ml-2 text-purple-400 hover:text-purple-700 transition"
          onClick={async () => {
            setRefreshing(true);
            await refetch();
            setRefreshing(false);
          }}
        >
          <RefreshCw className={refreshing ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
        </button>
      </h2>
      {isLoading && (
        <div className="text-gray-400 py-4 animate-pulse">Loading your challenges...</div>
      )}
      {userChallenges && userChallenges.length === 0 && (
        <div className="text-gray-400 py-6 rounded-xl text-center bg-purple-50 border border-purple-100">
          You haven't joined any challenges yet.
        </div>
      )}
      <div className="flex flex-col gap-3 sm:gap-4">
        {userChallenges && userChallenges.map((row: ChallengeParticipant) => (
          <ChallengeCard
            key={row.id}
            row={row}
            onVerified={refetch}
          />
        ))}
      </div>
    </section>
  );
}
