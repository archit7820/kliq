
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
    if (!user || !current) return;
    await supabase.from("challenge_participants").insert({
      challenge_id: current.id,
      user_id: user.id,
    });
    refetchParticipant();
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
    <div className="flex items-center justify-between rounded-2xl px-4 py-3 bg-[#F8F5FF] border border-[#ece6fa] mt-1 shadow-sm animate-fade-in transition-all">
      <div className="flex flex-col gap-0.5">
        <span className="flex items-center gap-2 font-bold text-violet-800 text-base">
          <Globe className="h-5 w-5 text-violet-500" />
          Current Challenge
        </span>
        <span className="text-[14px] text-violet-700 font-medium leading-snug mt-0.5 block">
          &ldquo;{current.title}&rdquo;
        </span>
        <span className="text-xs text-gray-500">{current.description}</span>
        {!participant && user && (
          <Button
            size="sm"
            className="mt-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold px-4 py-1 shadow"
            onClick={onJoin}
          >
            Join Challenge
          </Button>
        )}
        {participant && !participant.is_completed && (
          <span className="inline-flex items-center text-green-800 text-xs mt-2">
            🎉 Joined! Mark as complete in "My Challenges" below.
          </span>
        )}
        {participant && participant.is_completed && (
          <span className="inline-flex items-center text-green-700 text-xs mt-2">
            ✅ Completed!
          </span>
        )}
      </div>
      {/* Compact leaderboard as avatars + label */}
      <div className="flex flex-col items-end gap-1 min-w-[70px]">
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
  );
};

export default CurrentChallengeCard;
