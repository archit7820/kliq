
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import ChallengeCard from "./ChallengeCard";

// No longer renders global (Kelp) challenges; now handled in CurrentChallenges for full sync

export default function UserChallengesList({ highlightCurrent = false }: { highlightCurrent?: boolean }) {
  const { user } = useAuthStatus();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch main user-specific challenge participations
  // Excludes rendering global Kelp challenges, which are displayed in CurrentChallenges for unified status
  const [userChallenges, setUserChallenges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    supabase
      .from("challenge_participants")
      .select(`
        id, challenge_id, completed_at, is_completed, joined_at,
        challenge:challenge_id (
          id, title, description, reward_kelp_points
        )
      `)
      .eq("user_id", user.id)
      .order("joined_at", { ascending: false })
      .then(({ data, error }) => {
        setIsLoading(false);
        if (error) return;
        setUserChallenges((data ?? []).filter((row: any) => !!row.challenge));
      });
  }, [user]);

  let highlightId: string | null = null;
  if (highlightCurrent && userChallenges && userChallenges.length > 0) {
    const active = userChallenges.find((row: any) => !row.is_completed);
    highlightId = active?.id ?? null;
  }

  if (!user) return null;

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
            // re-fetch challenges
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
            setRefreshing(false);
            if (!error) setUserChallenges((data ?? []).filter((row: any) => !!row.challenge));
          }}
        >
          <svg className={refreshing ? "w-4 h-4 animate-spin" : "w-4 h-4"} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 4v5h.582M20 20v-5h-.581" />
            <path d="M5.582 9A7.962 7.962 0 0 1 12 4c3.042 0 5.824 1.721 7.418 4.286" />
            <path d="M18.418 15A7.962 7.962 0 0 1 12 20c-3.042 0-5.824-1.721-7.418-4.286" />
          </svg>
        </button>
      </h2>
      {isLoading && (
        <div className="text-gray-400 py-4 animate-pulse">Loading your challenges...</div>
      )}
      {userChallenges && userChallenges.length === 0 && (
        <div className="text-gray-400 py-5 rounded-xl text-center bg-purple-50 border border-purple-100">
          You haven't joined any challenges yet.
        </div>
      )}
      <div className="flex flex-col gap-2 sm:gap-3">
        {userChallenges && userChallenges.map((row: any) => (
          <ChallengeCard
            key={row.id}
            row={row}
            onVerified={() => {/* fetch on completion handled above */}}
            highlight={highlightCurrent && row.id === highlightId}
          />
        ))}
      </div>
    </section>
  );
}
