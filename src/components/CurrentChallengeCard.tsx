
import React from "react";
import { Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { Button } from "@/components/ui/button";

// Show the *current* highest-priority global challenge by Kelp team
const topUsers = [
  { avatar: "https://randomuser.me/api/portraits/men/1.jpg", alt: "Top user 1" },
  { avatar: "https://randomuser.me/api/portraits/women/2.jpg", alt: "Top user 2" },
  { avatar: "https://randomuser.me/api/portraits/men/3.jpg", alt: "Top user 3" }
];

const CurrentChallengeCard = () => {
  const { user } = useAuthStatus();
  // Fetch current (active, world) challenge
  const { data: current, isLoading, refetch } = useQuery({
    queryKey: ["current-challenge-card"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("audience_scope", "world")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return error ? null : data;
    },
    refetchInterval: 10_000,
  });

  // See if user has joined this challenge (ignore if still loading challenge)
  const { data: participant, refetch: refetchParticipant } = useQuery({
    queryKey: ["challenge-participant", user?.id, current?.id],
    queryFn: async () => {
      if (!current || !user) return null;
      const { data, error } = await supabase
        .from("challenge_participants")
        .select("id,is_completed")
        .eq("challenge_id", current.id)
        .eq("user_id", user.id)
        .maybeSingle();
      return error ? null : data;
    },
    enabled: !!current && !!user,
    refetchInterval: 10_000,
  });

  // Handler for join action
  const onJoin = async () => {
    if (!user || !current) {
      return;
    }
    try {
      const { error, data } = await supabase.from("challenge_participants").insert({
        challenge_id: current.id,
        user_id: user.id,
      });
      refetchParticipant();
    } catch (e) {
      // Error handling can be improved
    }
  };

  // Handle loading state
  if (isLoading || !current) {
    return (
      <div className="flex items-center justify-between rounded-2xl px-4 py-3 bg-[#F8F5FF] border border-[#ece6fa] mt-1 shadow-sm min-h-[78px] animate-pulse">
        <span className="w-1/2 h-4 bg-violet-100 rounded"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl px-4 py-3 bg-[#F8F5FF] border border-[#ece6fa] mt-1 shadow-sm animate-fade-in transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5 flex-1">
          <span className="flex items-center gap-2 font-bold text-violet-800 text-base">
            <Globe className="h-5 w-5 text-violet-500" />
            Current Challenge
          </span>
          <span className="text-[15px] text-violet-700 font-semibold leading-snug mt-1 block">
            &ldquo;{current.title}&rdquo;
          </span>
          <span className="text-xs text-gray-500 mt-1">{current.description}</span>
        </div>
        {/* Compact leaderboard as avatars + label */}
        <div className="flex flex-col items-end gap-1 min-w-[70px] mt-2 sm:mt-0">
          <span className="font-normal text-[13px] text-gray-500 mb-1 pr-1">
            Top Users
          </span>
          <div className="flex -space-x-2">
            {topUsers.map((user, i) => (
              <img
                key={i}
                src={user.avatar}
                alt={user.alt}
                className="rounded-full w-7 h-7 border-2 border-violet-200 bg-white shadow hover:scale-105 transition-transform duration-150"
              />
            ))}
          </div>
        </div>
      </div>
      {/* Join button at the bottom */}
      <div className="mt-4 flex w-full">
        {!participant && user && (
          <Button
            size="lg"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-base shadow"
            onClick={onJoin}
          >
            Join Challenge
          </Button>
        )}
        {participant && !participant.is_completed && (
          <Button
            size="lg"
            className="w-full bg-gray-300 text-gray-600 font-bold rounded-lg text-base"
            disabled
          >
            Already Joined
          </Button>
        )}
        {participant && participant.is_completed && (
          <span className="w-full inline-flex items-center justify-center text-green-700 text-base font-semibold bg-green-50 px-5 py-3 rounded-lg">
            ✅ Completed!
          </span>
        )}
      </div>
    </div>
  );
};

export default CurrentChallengeCard;

