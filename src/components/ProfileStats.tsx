import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import UserBadges from "./UserBadges";
import { useUserBadges } from "@/hooks/useUserBadges";

type ProfileStatsProps = {
  profile: {
    kelp_points: number;
    streak_count?: number;
    co2e_weekly_goal?: number;
    co2e_weekly_progress?: number;
  } | null;
  user: { id: string } | null;
  getUserRank?: (id: string) => string;
};

const ProfileStats: React.FC<ProfileStatsProps> = ({ profile, user, getUserRank }) => {
  const { data: badges = [], isLoading: loadingBadges } = useUserBadges();

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 border-b">
        <CardTitle className="text-lg">Your Stats</CardTitle>
      </div>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <p className="text-xs text-gray-500">Kelp Points</p>
            <p className="text-2xl font-bold text-green-700">
              {profile?.kelp_points ?? 0}
            </p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
            <p className="text-xs text-gray-500">Current Streak</p>
            <p className="text-2xl font-bold text-orange-700">
              {profile?.streak_count ?? 0}
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-xs text-gray-500">Global Rank</p>
            <p className="text-2xl font-bold text-blue-700">
              {user && getUserRank ? getUserRank(user.id) : "N/A"}
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
            <p className="text-xs text-gray-500">Weekly CO₂e Progress</p>
            <p className="text-2xl font-bold text-purple-700">
              {profile
                ? `${profile.co2e_weekly_progress ?? 0} / ${profile.co2e_weekly_goal ?? 0} kg`
                : <span className="text-base text-gray-400 italic">n/a</span>}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="font-semibold text-xs mb-1 text-gray-600">Badges & Milestones:</div>
          {loadingBadges ? (
            <div>Loading badges...</div>
          ) : (
            <UserBadges badges={badges} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileStats;
