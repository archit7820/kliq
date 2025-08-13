import React from "react";
import StreakTracker from "./StreakTracker";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useUserBadges } from "@/hooks/useUserBadges";
import UserBadges from "@/components/UserBadges";
import { Link } from "react-router-dom";

interface DeeperAnalyticsProps {
  streakDays?: number;
  tip?: string;
}

const DeeperAnalytics: React.FC<DeeperAnalyticsProps> = ({ streakDays = 0, tip }) => {
  const { data: badges = [], isLoading } = useUserBadges();

  return (
    <section className="w-full space-y-3 animate-fade-in">
      <div className="rounded-2xl bg-gradient-to-r from-green-50 to-blue-50 border p-4 shadow">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-base">Deeper Analytics</CardTitle>
          <Link to="/impact-dashboard" className="text-sm text-primary underline">Full Dashboard</Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-card">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Streak</div>
              <StreakTracker days={streakDays} />
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground mb-1">Milestones</div>
              {isLoading ? (
                <div className="text-xs text-muted-foreground">Loading...</div>
              ) : (
                <UserBadges badges={badges} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-card">
        <CardContent className="p-4">
          <div className="text-sm font-semibold mb-1">Daily Green Thought by AI</div>
          <p className="text-sm text-muted-foreground">
            {tip || "Try biking short distances this week to save CO₂ and boost your streak!"}
          </p>
        </CardContent>
      </Card>
    </section>
  );
};

export default DeeperAnalytics;
