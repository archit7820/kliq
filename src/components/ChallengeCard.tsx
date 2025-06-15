
import React from "react";
import { Wallet } from "lucide-react";
import ChallengeVerificationDialog from "./ChallengeVerificationDialog";

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

interface ChallengeCardProps {
  row: ChallengeParticipant;
  onVerified: () => void;
  highlight?: boolean;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  row,
  onVerified,
  highlight
}) => {
  const isKelpTeam =
    !row.challenge ||
    row.challenge.description?.toLowerCase().includes("kelp team") ||
    row.challenge.title?.toLowerCase().includes("kelp") ||
    row.challenge.reward_kelp_points > 30;

  return (
    <div
      className={`
        animate-fade-in bg-white w-full
        ${highlight ? "ring-2 ring-violet-400 shadow-lg" : "border border-violet-100 shadow-sm"}
        rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3
        group transition-all hover:scale-[1.01] focus-within:scale-[1.01] active:scale-[0.98] outline-none
      `}
      tabIndex={0}
      role="group"
    >
      <div className="flex-1 min-w-0 flex flex-col gap-1">
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
        {row.challenge.description && (
          <div className="text-[13px] text-purple-700">{row.challenge.description}</div>
        )}
        <span className={`inline-flex items-center gap-1 mt-2 w-fit ${isKelpTeam ? "bg-cyan-50 text-cyan-800 border-cyan-100" : "bg-green-50 text-green-700 border-green-100"} font-mono text-[11px] px-2 py-0.5 rounded-full border`}>
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
};

export default ChallengeCard;
