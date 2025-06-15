
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, ArrowUpRight, ArrowDownRight, User } from "lucide-react";

type LeaderboardListProps = {
  leaderboard: any[];
  userId?: string;
};

const podiumColors = [
  "bg-yellow-300",
  "bg-gray-300",
  "bg-orange-300"
];

const PodiumRow = ({
  profile,
  position,
  isCurrentUser,
}: {
  profile: any,
  position: number,
  isCurrentUser: boolean
}) => {
  const podiumColor = podiumColors[position] || "bg-gray-200";
  return (
    <div
      className={`flex flex-col items-center mx-2 relative py-3 px-3 rounded-xl ${podiumColor} ${
        isCurrentUser ? "ring-2 ring-green-600 scale-105 z-10" : "shadow-sm"
      } animate-fade-in`}
      style={{ width: 90, minHeight: 145 }}
    >
      <div className="flex items-center justify-center mb-2">
        {position === 0 ? (
          <Trophy className="text-yellow-600 w-7 h-7 drop-shadow-lg" />
        ) : (
          <Star className="text-orange-500 w-6 h-6" />
        )}
      </div>
      <div className={`rounded-full border-4 border-white ${isCurrentUser ? "ring-4 ring-green-500" : ""} shadow-lg mb-2`}>
        <div className="w-16 h-16 overflow-hidden rounded-full bg-white">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-700 font-bold text-2xl">
              {profile.username?.[0]?.toUpperCase() || <User />}
            </div>
          )}
        </div>
      </div>
      <div className="text-center flex flex-col items-center -mt-2">
        <span className={`font-bold ${isCurrentUser ? "text-green-800" : "text-gray-800"} text-sm truncate max-w-full`}>
          {isCurrentUser ? "You" : profile.username || "Anonymous"}
        </span>
        <span className="text-xs text-gray-600">{profile.kelp_points ?? 0} pts</span>
        <span className={`absolute top-1 left-1 text-xs font-bold bg-white/70 rounded-full px-2 py-0.5 text-gray-700 shadow`}>
          #{position + 1}
        </span>
      </div>
    </div>
  );
};

const LeaderboardRow = ({
  profile,
  index,
  isCurrentUser,
}: {
  profile: any;
  index: number;
  isCurrentUser: boolean;
}) => (
  <div
    className={`flex items-center gap-4 py-2 px-2 transition rounded-lg my-1 relative ${
      isCurrentUser
        ? "bg-green-100 border-2 border-green-500 scale-100 animate-pulse-fast"
        : "hover:bg-gray-50"
    }`}
  >
    <div className="shrink-0 w-7 text-center font-bold text-lg text-gray-400 select-none">
      #{index + 1}
    </div>
    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow">
      {profile.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={profile.username}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-green-200 text-green-800 font-bold">
          {profile.username?.[0]?.toUpperCase() || <User />}
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0 flex flex-col justify-center">
      <div className={`truncate font-semibold text-md ${isCurrentUser ? "text-green-800" : ""}`}>
        {isCurrentUser ? "You" : profile.username || "Anonymous"}
        {isCurrentUser && <Badge className="ml-2 bg-green-200 text-green-800 border-green-300">You</Badge>}
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
        <span className="font-semibold">{profile.kelp_points ?? 0} pts</span>
        {/* Future: add trend here if backend supports it */}
      </div>
    </div>
    <div className="flex flex-col items-end gap-1 pr-2">
      {index <= 2 ? (
        <Trophy className={`w-5 h-5 ${index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : "text-orange-400"}`} />
      ) : (
        <ArrowUpRight className="text-green-400 w-4 h-4 animate-bounce" />
      )}
    </div>
  </div>
);

const LeaderboardList: React.FC<LeaderboardListProps> = ({ leaderboard, userId }) => {
  // Split into podium (top 3) and others
  const podium = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="py-2">
      {/* Podium display for top 3 */}
      <div className="flex justify-center items-end gap-2 mb-6 mt-2">
        {podium.map((profile, i) => (
          <PodiumRow
            key={profile.id}
            profile={profile}
            position={i}
            isCurrentUser={profile.id === userId}
          />
        ))}
      </div>
      {/* Fun divider */}
      <div className="w-full text-center mb-2 font-semibold text-gray-500 text-sm tracking-widest">
        <span className="inline-block bg-green-200 rounded-full px-3 py-0.5 shadow animate-in animate-fade-in">Leaderboard</span>
      </div>
      {/* Ranks 4+ */}
      <div>
        {rest.length === 0 && (
          <div className="py-6 text-center text-gray-400">No more players... join in!</div>
        )}
        {rest.map((profile, i) => (
          <LeaderboardRow
            key={profile.id}
            profile={profile}
            index={i + 3}
            isCurrentUser={profile.id === userId}
          />
        ))}
      </div>
    </div>
  );
};

export default LeaderboardList;
