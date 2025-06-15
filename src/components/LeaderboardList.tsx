
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Trophy, ArrowUp, ArrowDown } from "lucide-react";

type LeaderboardListProps = {
  leaderboard: any[];
  userId?: string;
};

const LeaderboardList: React.FC<LeaderboardListProps> = ({ leaderboard, userId }) => (
  <div className="divide-y">
    {leaderboard.map((profile: any, index: number) => (
      <div key={profile.id}
        className={`flex items-center p-3 ${
          profile.id === userId
            ? "bg-green-50"
            : "hover:bg-gray-50"
        }`}
      >
        <div className="w-8 font-bold text-gray-500">
          #{index + 1}
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-green-200 text-green-800 font-bold">
              {profile.username?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium">
            {profile.username || "Anonymous"}
            {profile.id === userId && (
              <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">You</Badge>
            )}
          </p>
          <div className="flex items-center text-sm text-gray-500">
            <span>{profile.kelp_points ?? 0} pts</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center">
            {index > 0 ? (
              <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
            ) : (
              <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
            )}
            <span className="text-xs text-gray-500">
              {index === 0 ? "+2" : "-1"}
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default LeaderboardList;
