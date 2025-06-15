
import React from "react";
import { Award, Trophy, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

type RowProps = {
  profile: any;
  rank: number;
  userId?: string;
};

const badgeColors = [
  "bg-yellow-200 text-yellow-700",
  "bg-gray-200 text-gray-700",
  "bg-orange-100 text-orange-800"
];

const LeaderboardRowGamified: React.FC<RowProps> = ({ profile, rank, userId }) => {
  const isMobile = useIsMobile();
  const isCurrentUser = profile.id === userId;
  const mainColor = badgeColors[rank] || "bg-green-50 text-green-700";
  
  if (isMobile) {
    // Mobile: Compact card layout
    return (
      <div
        className={`
          flex flex-col items-center gap-1 p-3 m-1 rounded-xl shadow-lg
          border border-white/50 min-h-[120px] w-full ${mainColor}
          ${isCurrentUser ? "ring-2 ring-green-500 bg-green-200 animate-pulse-fast" : ""}
        `}
      >
        {/* Rank */}
        <div className="text-lg font-extrabold text-center">
          #{rank + 1}
        </div>
        
        {/* Avatar */}
        <div
          className={`rounded-full overflow-hidden border-2 border-white shadow ${isCurrentUser ? "animate-pulse" : ""}`}
          style={{
            width: 36,
            height: 36,
          }}
        >
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-700">
              <UserIcon className="w-4 h-4" />
            </div>
          )}
        </div>
        
        {/* Name */}
        <div className="text-center">
          <div className={`font-bold text-sm truncate max-w-[80px] ${isCurrentUser ? "text-green-800" : ""}`}>
            {isCurrentUser ? "You" : profile.username || "Anonymous"}
          </div>
          {isCurrentUser && (
            <Badge className="mt-1 bg-green-300 text-green-900 border-green-500 text-xs">
              🎉
            </Badge>
          )}
        </div>
        
        {/* Points */}
        <div className="text-xs text-gray-600 font-semibold flex items-center gap-1">
          <Award className="w-3 h-3 text-orange-400" />
          {profile.kelp_points ?? 0} pts
        </div>
        
        {/* Trophy for top ranks */}
        {rank <= 2 && (
          <Trophy className={`w-4 h-4 ${rank === 0 ? "text-yellow-400" : "text-gray-400"} animate-bounce`} />
        )}
      </div>
    );
  }

  // Desktop: Original row layout
  return (
    <div
      className={`
        flex items-center gap-3 py-2 px-2 my-1
        rounded-xl shadow-md transition-all duration-200 relative ${mainColor}
        ${isCurrentUser ? "scale-105 ring-2 ring-green-500 bg-green-200 animate-pulse-fast" : "hover:bg-green-100"}
        min-h-[44px]
      `}
    >
      <div className="text-xl font-extrabold shrink-0 w-8 text-center select-none">
        #{rank + 1}
      </div>
      <div
        className={`rounded-full overflow-hidden border-2 border-white shadow ${isCurrentUser ? "animate-pulse" : ""}`}
        style={{
          width: 40,
          height: 40,
        }}
      >
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.username}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-700">
            <UserIcon className="w-6 h-6" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className={`truncate font-extrabold text-sm ${isCurrentUser ? "text-green-800" : ""}`}>
          {isCurrentUser ? "You" : profile.username || "Anonymous"}
          {isCurrentUser && (
            <Badge className="ml-1 bg-green-300 text-green-900 border-green-500 animate-pulse text-xs">
              🎉 You
            </Badge>
          )}
        </div>
        <span className="text-xs text-gray-600 mt-0.5 font-semibold flex gap-1 items-center">
          <Award className="w-4 h-4 text-orange-400" />
          {profile.kelp_points ?? 0} pts
        </span>
      </div>
      <div className="flex flex-col items-center pr-2">
        {rank <= 2 ? (
          <Trophy className={`w-6 h-6 ${rank === 0 ? "text-yellow-400" : rank === 1 ? "text-gray-400" : "text-orange-400"} animate-bounce`}
            strokeWidth={2 + rank}
          />
        ) : null}
      </div>
    </div>
  );
};

export default LeaderboardRowGamified;
