
import React from "react";
import { Trophy, Award, User as UserIcon } from "lucide-react";

type TopPodiumProps = {
  podium: any[];
  userId?: string;
};

const trophyColors = [
  "from-yellow-400 to-yellow-200",
  "from-gray-300 to-gray-100",
  "from-orange-400 to-orange-200",
];

const iconBg = [
  "bg-yellow-200",
  "bg-gray-200",
  "bg-orange-100"
];

const bling = [
  "🥇",
  "🥈",
  "🥉"
];

// Mobile-first responsive podium
const TopPodium: React.FC<TopPodiumProps> = ({ podium, userId }) => {
  // Pad to always show 3 slots
  const padded = [...podium];
  while (padded.length < 3) padded.push(null);

  return (
    <div className="flex flex-row justify-center items-end gap-2 sm:gap-4 w-full px-2 mt-1 mb-4 animate-fade-in">
      {/* 2nd place */}
      <div className="order-1 flex-1 flex flex-col items-center">
        <PodiumSpot profile={padded[1]} position={1} userId={userId} />
      </div>
      {/* 1st place - center */}
      <div className="order-2 flex-1 flex flex-col items-center z-20">
        <PodiumSpot profile={padded[0]} position={0} userId={userId} winner />
      </div>
      {/* 3rd place */}
      <div className="order-3 flex-1 flex flex-col items-center">
        <PodiumSpot profile={padded[2]} position={2} userId={userId} />
      </div>
    </div>
  );
};

const PodiumSpot = ({
  profile,
  position,
  userId,
  winner = false,
}: {
  profile: any;
  position: number;
  userId?: string;
  winner?: boolean;
}) => {
  const isCurrentUser = !!profile && profile.id === userId;
  // Mobile-first responsive sizes
  const baseSize = winner ? 64 : 48; // Mobile sizes
  const ringClass = winner ? "border-4 border-yellow-400 animate-pulse-fast" : "border-2 border-gray-300";

  return (
    <div className={`relative flex flex-col items-center ${winner ? "scale-110" : ""}`}>
      <div
        className={`relative z-20 rounded-full ${iconBg[position]} mb-2 drop-shadow-lg ${ringClass}`}
        style={{
          width: baseSize,
          height: baseSize,
        }}>
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="rounded-full object-cover w-full h-full border-2 border-white"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full text-sm font-bold text-green-700">
            <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        )}
        {/* Crown for 1st */}
        {position === 0 && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl pointer-events-none select-none animate-bounce drop-shadow-glow">
            👑
          </span>
        )}
        {/* Bling for all */}
        <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-lg select-none pointer-events-none animate-scale-in">{bling[position]}</span>
      </div>
      {/* Mobile-optimized Name, Level, Points */}
      <div className="mt-1 flex flex-col items-center w-full min-w-0">
        <span className={`font-bold text-center ${isCurrentUser ? "text-green-700" : "text-gray-700"} text-xs truncate max-w-[60px]`}>
          {(profile && (isCurrentUser ? "You" : profile.username)) || "—"}
        </span>
        <span className="text-xs flex items-center gap-1 text-yellow-900">
          <Trophy className="inline-block w-3 h-3 text-yellow-400" strokeWidth={2.5} />
          <span className="font-semibold text-xs">
            {profile?.kelp_points ?? "0"}
          </span>
        </span>
        {isCurrentUser && (
          <span className="text-xs font-semibold text-green-600 bg-green-100 rounded-full px-1.5 py-0.5 mt-1 animate-pulse">
            You!
          </span>
        )}
      </div>
      {/* Mobile-optimized Podium base */}
      <div className={`mt-2 rounded-t-lg rounded-b-xl transition border-2 shadow-md py-0.5 w-8 sm:w-10 text-center 
          bg-gradient-to-t ${trophyColors[position]} ${winner ? "h-4" : "h-3"}
        `}
      >
        <span className="text-xs font-bold text-gray-700 tracking-widest">
          #{position + 1}
        </span>
      </div>
      {/* Winner confetti */}
      {winner && <ConfettiLight />}
    </div>
  );
};

function ConfettiLight() {
  return (
    <span className="absolute -top-4 left-1/2 -translate-x-1/2 animate-fade-in z-30">
      <span className="text-sm">🎉 🎉 🎉</span>
    </span>
  );
}

export default TopPodium;
