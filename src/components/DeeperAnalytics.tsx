import React from "react";
import PremiumAnalyticsView from "./PremiumAnalyticsView";
import { useUserBadges } from "@/hooks/useUserBadges";
import { useProfileWithStats } from "@/hooks/useProfileWithStats";

interface DeeperAnalyticsProps {
  streakDays?: number;
  tip?: string;
}

const DeeperAnalytics: React.FC<DeeperAnalyticsProps> = ({ streakDays = 0, tip }) => {
  const { data: badges = [] } = useUserBadges();
  const { profile } = useProfileWithStats();

  // Generate mock trend data (in a real app, this would come from your backend)
  const mockTrendData = [
    { day: 'Mon', score: 85 },
    { day: 'Tue', score: 92 },
    { day: 'Wed', score: 78 },
    { day: 'Thu', score: 95 },
    { day: 'Fri', score: 88 },
    { day: 'Sat', score: 102 },
    { day: 'Sun', score: 110 }
  ];

  const totalImpact = {
    co2Saved: Number(profile?.co2e_weekly_progress) || 4.2,
    waterSaved: 127, // Mock data
    energySaved: 8.5  // Mock data
  };

  return (
    <PremiumAnalyticsView
      streakDays={streakDays}
      weeklyProgress={Number(profile?.co2e_weekly_progress) || 0}
      weeklyGoal={Number(profile?.co2e_weekly_goal) || 7}
      totalImpact={totalImpact}
      badgeCount={badges.length}
      trendData={mockTrendData}
      aiTip={tip || "Try biking short distances this week to save CO₂ and boost your streak!"}
    />
  );
};

export default DeeperAnalytics;
