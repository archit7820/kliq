
import React from "react";
import { Award, Trophy, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const isCurrentUser = profile.id === userId;
  const mainColor = badgeColors[rank] || "bg-green-50 text-green-700";
  // Responsive avatar size: smaller on mobile
  const rowAvatar = {
    desktop: 40,
    mobile: 32
  };
  return (
    <div
      className={`
        flex items-center gap-2 sm:gap-3 py-1.5 sm:py-2 px-1.5 sm:px-2 my-0.5 sm:my-1
        rounded-lg sm:rounded-xl shadow transition-all duration-200 relative ${mainColor}
        ${isCurrentUser ? "scale-102 sm:scale-105 ring-2 ring-green-500 bg-green-200 animate-pulse-fast" : "hover:bg-green-100"}
      `}
      style={{
        minHeight: 44,
      }}
    >
      <div className="text-base sm:text-xl font-extrabold shrink-0 w-6 sm:w-8 text-center select-none">
        #{rank + 1}
      </div>
      <div
        className={`rounded-full overflow-hidden border-2 border-white shadow ${isCurrentUser ? "animate-pulse" : ""}`}
        style={{
          width: `clamp(${rowAvatar.mobile}px, 8vw, ${rowAvatar.desktop}px)`,
          height: `clamp(${rowAvatar.mobile}px, 8vw, ${rowAvatar.desktop}px)`,
          minWidth: rowAvatar.mobile,
          minHeight: rowAvatar.mobile,
          maxWidth: rowAvatar.desktop,
          maxHeight: rowAvatar.desktop,
        }}
      >
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.username}
            className="object-cover w-full h-full"
            style={{
              width: "100%",
              height: "100%"
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-700">
            <UserIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className={`truncate font-extrabold text-xs sm:text-sm ${isCurrentUser ? "text-green-800" : ""}`}>
          {isCurrentUser ? "You" : profile.username || "Anonymous"}
          {isCurrentUser && (
            <Badge className="ml-1 bg-green-300 text-green-900 border-green-500 animate-pulse text-xs">
              🎉 You
            </Badge>
          )}
        </div>
        <span className="text-[11px] sm:text-xs text-gray-600 mt-0.5 font-semibold flex gap-1 items-center">
          <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" />
          {profile.kelp_points ?? 0} pts
        </span>
      </div>
      {/* Trophy icons */}
      <div className="flex flex-col items-center pr-1 sm:pr-2">
        {rank <= 2 ? (
          <Trophy className={`w-5 h-5 sm:w-6 sm:h-6 ${rank === 0 ? "text-yellow-400" : rank === 1 ? "text-gray-400" : "text-orange-400"} animate-bounce`}
            strokeWidth={2 + rank}
          />
        ) : null}
      </div>
    </div>
  );
};

export default LeaderboardRowGamified;
