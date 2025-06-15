
import React from "react";
import { Trophy, Award, User as UserIcon } from "lucide-react";

type TopPodiumProps = {
  podium: any[];
  userId?: string;
};

const trophyColors = [
  "from-yellow-400 to-yellow-200", // 1st
  "from-gray-300 to-gray-100",     // 2nd
  "from-orange-400 to-orange-200", // 3rd
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

// Large podium display, horizontally on desktop, stacked on mobile
const TopPodium: React.FC<TopPodiumProps> = ({ podium, userId }) => {
  // Pad to always show 3 slots
  const padded = [...podium];
  while (padded.length < 3) padded.push(null);

  return (
    <div className="flex flex-col sm:flex-row justify-center items-end sm:gap-5 gap-2 w-full px-2 mt-1 mb-4 animate-fade-in">
      {/* 2nd place (shown left on desktop, top on mobile) */}
      <div className="sm:order-1 order-2 flex-1 flex flex-col items-center">
        <PodiumSpot
          profile={padded[1]}
          position={1}
          userId={userId}
        />
      </div>
      {/* 1st place (center, oversized) */}
      <div className="sm:order-2 order-1 flex-1 flex flex-col items-center z-20">
        <PodiumSpot
          profile={padded[0]}
          position={0}
          userId={userId}
          winner={true}
        />
      </div>
      {/* 3rd place (shown right on desktop, bottom on mobile) */}
      <div className="sm:order-3 order-3 flex-1 flex flex-col items-center">
        <PodiumSpot
          profile={padded[2]}
          position={2}
          userId={userId}
        />
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
  return (
    <div className={`relative flex flex-col items-center ${winner ? "scale-110" : ""}`}>
      <div className={`relative z-20 rounded-full ${iconBg[position]} mb-2 drop-shadow-lg ${winner ? "border-4 border-yellow-400 animate-pulse-fast" : "border-2 border-gray-300"}`}
        style={{
          width: winner ? 90 : 72,
          height: winner ? 90 : 66,
          minWidth: winner ? 90 : 66,
          minHeight: winner ? 90 : 66,
        }}>
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.username} className="rounded-full object-cover w-full h-full border-2 border-white" />
        ) : (
          <div className="flex items-center justify-center h-full w-full text-xl font-bold text-green-700">
            <UserIcon className="h-8 w-8" />
          </div>
        )}
        {/* Crown for 1st */}
        {position === 0 && (
          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-4xl pointer-events-none select-none animate-bounce drop-shadow-glow">
            👑
          </span>
        )}
        {/* Bling for all */}
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-2xl select-none pointer-events-none animate-scale-in">{bling[position]}</span>
      </div>
      {/* Name, Level, Points */}
      <div className="mt-1 flex flex-col items-center w-full min-w-0">
        <span className={`font-extrabold text-center ${isCurrentUser ? "text-green-700" : "text-gray-700"} text-base truncate w-24`}>
          {(profile && (isCurrentUser ? "You" : profile.username)) || "—"}
        </span>
        <span className="text-xs flex items-center gap-2 text-yellow-900">
          <Trophy className="inline-block w-4 h-4 text-yellow-400" strokeWidth={2.5} />
          <span className="font-bold">
            {profile?.kelp_points ?? "0"} pts
          </span>
        </span>
        {isCurrentUser && (
          <span className="text-xs font-semibold text-green-600 bg-green-100 rounded-full px-2 py-0.5 mt-1 animate-pulse">
            That’s you!
          </span>
        )}
      </div>
      {/* Podium base */}
      <div className={`mt-2 rounded-t-lg rounded-b-xl transition border-2 shadow-md py-1 w-14 text-center 
          bg-gradient-to-t ${trophyColors[position]} ${winner ? "h-5 sm:h-7" : "h-4 sm:h-5"}
        `}
      >
        <span className={`text-xs font-bold text-gray-700 tracking-widest`}>
          #{position + 1}
        </span>
      </div>
      {/* Winner confetti */}
      {winner && <ConfettiLight />}
    </div>
  );
};

function ConfettiLight() {
  // Simple playful confetti animation
  return (
    <span className="absolute -top-7 left-1/2 -translate-x-1/2 animate-fade-in z-30">
      <span className="text-lg">🎉 🎉 🎉</span>
    </span>
  );
}

export default TopPodium;
