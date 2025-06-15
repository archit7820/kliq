import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import ChallengeVerificationDialog from "./ChallengeVerificationDialog";
import { Wallet } from "lucide-react";

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
  onVerified,
  highlight,
}: {
  row: ChallengeParticipant;
  onVerified: () => void;
  highlight?: boolean;
}) {
  // Determine owner type & style
  const isKelpTeam =
    !row.challenge ||
    row.challenge.description?.toLowerCase().includes("kelp team") ||
    row.challenge.title?.toLowerCase().includes("kelp") ||
    row.challenge.reward_kelp_points > 30;

  return (
    <div
      className={`
        animate-fade-in bg-white
        ${highlight ? "ring-2 ring-violet-400 shadow-lg" : "border border-violet-100 shadow-sm"}
        rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3
        group transition-all hover:scale-[1.01] focus-within:scale-[1.01] active:scale-[0.98] outline-none
      `}
      tabIndex={0}
      role="group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-2">
          <span className="font-bold text-violet-900 text-lg">{row.challenge.title}</span>
          {isKelpTeam ? (
            <span className="inline-flex items-center text-xs px-3 py-1 bg-violet-100 text-violet-800 rounded-full gap-1 border border-violet-200 font-semibold">
              <Wallet className="w-4 h-4" />
              Kelp Team
            </span>
          ) : (
            <span className="inline-flex items-center text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full border border-gray-200">
              User
            </span>
          )}
        </div>
        <div className="text-[13px] text-purple-700 mt-1 mb-1.5">{row.challenge.description}</div>
        <span className={`inline-flex items-center gap-1 ${isKelpTeam ? "bg-cyan-50 text-cyan-800 border-cyan-100" : "bg-green-50 text-green-700 border-green-100"} font-mono text-[11px] px-2 py-0.5 rounded-full border`}>
          Reward: {row.challenge.reward_kelp_points} Kelp Points
        </span>
      </div>
      <div className="flex flex-row gap-2 items-center sm:mt-0 mt-3 min-w-[120px] justify-end">
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
            ✓ Completed!
          </span>
        )}
      </div>
    </div>
  );
}

// NEW: Show available global challenges user can join at top
function JoinableChallenges({ onJoin }: { onJoin: () => void }) {
  const { user } = useAuthStatus();
  const [joiningId, setJoiningId] = useState<string | null>(null);
  // Fetch all global (Kelp team) challenges
  const { data: globalChallenges } = useQuery({
    queryKey: ["global-challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("id, title, description, reward_kelp_points, audience_scope")
        .eq("audience_scope", "world")
        .eq("is_active", true);
      if (error) return [];
      return data || [];
    },
    refetchInterval: 10_000, // polling as backup for realtime
  });

  // My joined challenge ids
  const { data: myParticipants } = useQuery({
    queryKey: ["user-challenges-ids", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("challenge_participants")
        .select("challenge_id")
        .eq("user_id", user.id);
      if (error) return [];
      return data?.map((c: any) => c.challenge_id) || [];
    },
    enabled: !!user,
  });

  const queryClient = useQueryClient();

  const handleJoin = async (challenge: any) => {
    if (!user || joiningId) return;
    if (myParticipants && myParticipants.includes(challenge.id)) return; // Prevent duplicate join
    setJoiningId(challenge.id);
    // Only allow user-created challenge rewards up to 30
    if (
      challenge.audience_scope !== "world" &&
      challenge.reward_kelp_points > 30
    ) {
      alert(
        "Only Kelp team can offer more than 30 Kelp Points as a reward for a challenge."
      );
      setJoiningId(null);
      return;
    }
    const { error } = await supabase
      .from("challenge_participants")
      .insert({ challenge_id: challenge.id, user_id: user.id });
    setJoiningId(null);
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ["user-challenges"] });
      queryClient.invalidateQueries({ queryKey: ["global-challenges"] });
      if (onJoin) onJoin();
    }
  };

  if (!user || !globalChallenges) return null;
  const notJoined = globalChallenges.filter(
    (ch: any) => !(myParticipants || []).includes(ch.id)
  );

  if (notJoined.length === 0) return null;

  return (
    <div className="mb-2">
      {notJoined.map((ch: any) => (
        <div
          key={ch.id}
          className="bg-violet-50 border border-violet-200 rounded-2xl px-3 py-2 flex items-center justify-between mb-2 animate-fade-in"
        >
          <div className="text-violet-800 font-bold text-sm">{ch.title}</div>
          <button
            onClick={() => handleJoin(ch)}
            disabled={joiningId === ch.id}
            className="ml-2 px-3 py-1 text-xs bg-violet-600 text-white rounded-lg font-semibold shadow hover:bg-violet-700 transition"
            aria-label="Join Kelp Challenge"
          >
            {joiningId === ch.id ? "Joining..." : "Join"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default function UserChallengesList({ highlightCurrent = false }: { highlightCurrent?: boolean }) {
  const { user } = useAuthStatus();
  const [subscribing, setSubscribing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Main fetch: My participating challenges
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
        return [];
      }
      return (data ?? []).filter((row: any) => !!row.challenge);
    },
    enabled: !!user,
    refetchInterval: 10000,
  });

  // Real-time sync for user's challenges
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
          filter: `user_id=eq.${user.id}`,
        },
        (_payload) => {
          refetch();
        }
      )
      // Listen to newly joinable (Kelp/global) challenges appearing
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenges',
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

  let highlightId: string | null = null;
  if (highlightCurrent && userChallenges && userChallenges.length > 0) {
    const active = userChallenges.find((row: any) => !row.is_completed);
    highlightId = active?.id ?? null;
  }

  return (
    <section className="mt-2 animate-fade-in" id="user-my-current-challenges">
      <h2 className="text-base sm:text-lg font-bold mb-3 flex gap-2 items-center text-violet-800 tracking-tight">
        <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeDasharray="4 2" />
        </svg>
        My Current Challenges
        <button
          aria-label="refresh"
          className="ml-2 text-violet-400 hover:text-violet-700 transition"
          onClick={async () => {
            setRefreshing(true);
            await refetch();
            setRefreshing(false);
          }}
        >
          <svg className={refreshing ? "w-4 h-4 animate-spin" : "w-4 h-4"} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 4v5h.582M20 20v-5h-.581" />
            <path d="M5.582 9A7.962 7.962 0 0 1 12 4c3.042 0 5.824 1.721 7.418 4.286" />
            <path d="M18.418 15A7.962 7.962 0 0 1 12 20c-3.042 0-5.824-1.721-7.418-4.286" />
          </svg>
        </button>
      </h2>
      {/* Show joinable Kelp team challenges (global) at the top */}
      <JoinableChallenges onJoin={refetch} />

      {isLoading && (
        <div className="text-gray-400 py-4 animate-pulse">Loading your challenges...</div>
      )}
      {userChallenges && userChallenges.length === 0 && (
        <div className="text-gray-400 py-5 rounded-xl text-center bg-purple-50 border border-purple-100">
          You haven't joined any challenges yet.
        </div>
      )}
      <div className="flex flex-col gap-2 sm:gap-3">
        {userChallenges && userChallenges.map((row: ChallengeParticipant) => (
          <ChallengeCard
            key={row.id}
            row={row}
            onVerified={refetch}
            highlight={highlightCurrent && row.id === highlightId}
          />
        ))}
      </div>
    </section>
  );
}
