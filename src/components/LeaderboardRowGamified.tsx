import React from "react";
import { Award, Trophy, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

type RowProps = {
  profile: any;
  rank: number;
  userId?: string;
  categoryTag?: string;
  onClick?: () => void;
};

const badgeColors = [
  "bg-yellow-200 text-yellow-700",
  "bg-gray-200 text-gray-700",
  "bg-orange-100 text-orange-800"
];

const LeaderboardRowGamified: React.FC<RowProps> = ({ profile, rank, userId, categoryTag, onClick }) => {
  const isMobile = useIsMobile();
  const isCurrentUser = profile.id === userId;
  const mainColor = badgeColors[rank] || "bg-green-50 text-green-700";
  
  console.log("LeaderboardRowGamified - isMobile:", isMobile, "rank:", rank + 1);
  
  if (isMobile) {
    // Mobile: Compact horizontal card layout
    return (
      <div
        onClick={onClick}
        className={`
          flex flex-col items-center gap-2 p-3 rounded-xl shadow-lg
          border-2 border-white/50 min-h-[140px] w-[260px] ${mainColor}
          ${isCurrentUser ? "ring-2 ring-green-500 bg-green-200 animate-pulse-fast" : ""}
          ${onClick ? "cursor-pointer" : ""}
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
            width: 32,
            height: 32,
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
          <div className={`font-bold text-xs truncate max-w-[200px] ${isCurrentUser ? "text-green-800" : ""}`}>
            {isCurrentUser ? "You" : profile.username || "Anonymous"}
          </div>
          {isCurrentUser && (
            <Badge className="mt-1 bg-green-300 text-green-900 border-green-500 text-[10px] px-1 py-0">
              🎉
            </Badge>
          )}
        </div>
        
        {/* Ripple Score */}
        <div className="text-[11px] text-gray-600 font-semibold flex items-center gap-1">
          <Award className="w-3 h-3 text-orange-400" />
          Ripple Score: {profile.kelp_points ?? 0}
        </div>
        {/* Category tag */}
        {categoryTag && categoryTag !== 'All' && (
          <Badge className="mt-1 bg-secondary text-secondary-foreground border px-2 py-0 text-[10px]">
            {categoryTag}
          </Badge>
        )}
        
        {/* Trophy for top ranks */}
        {rank <= 2 && (
          <Trophy className={`w-3 h-3 ${rank === 0 ? "text-yellow-400" : "text-gray-400"} animate-bounce`} />
        )}
      </div>
    );
  }

  // Desktop: Original row layout
  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-3 py-2 px-2 my-1
        rounded-xl shadow-md transition-all duration-200 relative ${mainColor}
        ${isCurrentUser ? "scale-105 ring-2 ring-green-500 bg-green-200 animate-pulse-fast" : "hover:bg-green-100"}
        min-h-[44px]
        ${onClick ? "cursor-pointer" : ""}
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
          Ripple Score: {profile.kelp_points ?? 0}
        </span>
        {categoryTag && categoryTag !== 'All' && (
          <Badge className="mt-1 w-fit bg-secondary text-secondary-foreground border px-2 py-0 text-[10px]">
            {categoryTag}
          </Badge>
        )}
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
