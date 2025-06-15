
import React from "react";

interface JoinableChallengeCardProps {
  title: string;
  onJoin: () => void;
  isJoining: boolean;
}

const JoinableChallengeCard: React.FC<JoinableChallengeCardProps> = ({
  title,
  onJoin,
  isJoining,
}) => (
  <div className="bg-violet-50 border border-violet-200 rounded-2xl px-3 py-2 flex items-center justify-between mb-2 animate-fade-in w-full">
    <div className="text-violet-800 font-bold text-sm truncate">{title}</div>
    <button
      onClick={onJoin}
      disabled={isJoining}
      className="ml-2 px-3 py-1 text-xs bg-violet-600 text-white rounded-lg font-semibold shadow hover:bg-violet-700 transition"
      aria-label="Join Kelp Challenge"
    >
      {isJoining ? "Joining..." : "Join"}
    </button>
  </div>
);

export default JoinableChallengeCard;
