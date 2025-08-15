
import React, { useState } from "react";
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import { useImpactDashboardData } from "@/hooks/useImpactDashboardData";
import { useProfileWithStats } from "@/hooks/useProfileWithStats";
import { toast } from "@/components/ui/use-toast";
import { Target, Sparkles } from "lucide-react";

// Import new components
import ImpactMetricsGrid from "./dashboard/ImpactMetricsGrid";
import WeeklyGoalCard from "./dashboard/WeeklyGoalCard";
import ImpactVisualizationCard from "./dashboard/ImpactVisualizationCard";
import CategoryBreakdownCard from "./dashboard/CategoryBreakdownCard";
import SmartInsightsCard from "./dashboard/SmartInsightsCard";

export default function EnhancedImpactDashboard() {
  const [tab, setTab] = useState("week");
  const [loadingInsight, setLoadingInsight] = useState(false);
  const { profile, insights } = useProfileWithStats();
  
  const {
    weekChart, weekBreakdown,
    monthChart, monthBreakdown,
    yearChart, yearBreakdown,
    streak,
    milestones
  } = useImpactDashboardData();

  let chartData, chartType, xKey, yKey, breakdown;
  if (tab === "week") {
    chartData = weekChart;
    chartType = "area";
    xKey = "day";
    yKey = "savings";
    breakdown = weekBreakdown;
  } else if (tab === "month") {
    chartData = monthChart;
    chartType = "bar";
    xKey = "month";
    yKey = "savings";
    breakdown = monthBreakdown;
  } else {
    chartData = yearChart;
    chartType = "line";
    xKey = "year";
    yKey = "savings";
    breakdown = yearBreakdown;
  }

  const handleGenerateInsights = async () => {
    setLoadingInsight(true);
    try {
      const response = await fetch(
        "https://tdqdeddshvjlqmefxwzj.functions.supabase.co/generate_daily_eco_insights",
        { method: "POST" }
      );
      const result = await response.json();
      if (response.ok && result.ok) {
        toast({
          title: "Insights Generated",
          description: `${result.insightsCreated} new insights created!`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Generate Insights",
          description: result.error || "Something went wrong.",
        });
      }
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: e.message || "Failed to generate insights.",
      });
    }
    setLoadingInsight(false);
  };

  // Calculate impact metrics
  const totalSavings = chartData.reduce((sum: number, item: any) => sum + (item.savings || 0), 0);
  const averageDaily = chartData.length > 0 ? totalSavings / chartData.length : 0;
  const weeklyGoal = profile?.co2e_weekly_goal || 7;
  const weeklyProgress = profile?.co2e_weekly_progress || 0;
  const goalProgress = (weeklyProgress / weeklyGoal) * 100;

  // Impact scoring system
  const calculateImpactScore = () => {
    const streakScore = (streak?.current || 0) * 5;
    const activityScore = totalSavings * 10;
    const consistencyScore = chartData.filter((item: any) => item.savings > 0).length * 15;
    return Math.round(streakScore + activityScore + consistencyScore);
  };

  const impactScore = calculateImpactScore();

  // Get insights or generate default ones
  const getInsights = () => {
    if (insights.length > 0) {
      return insights[0].insight;
    }
    
    if (weeklyProgress > weeklyGoal) {
      return "Excellent work! You've exceeded your weekly CO₂e goal. Your consistent green choices are making a real difference for our planet.";
    } else if (weeklyProgress > weeklyGoal * 0.7) {
      return "Great progress! You're on track to meet your weekly goal. Keep up the sustainable habits – every action counts!";
    } else if (streak?.current && streak.current > 3) {
      return "Your activity streak is impressive! Consistency is key to maximizing environmental impact. You're building great eco-habits!";
    } else {
      return "Small daily actions create big environmental changes. Consider logging one eco-friendly activity today to start building your impact!";
    }
  };

  return (
    <div className="w-full space-y-4 md:space-y-6 px-4 md:px-0">
      {/* Header with Impact Score */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="space-y-1">
              <CardTitle className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                <div className="p-2 bg-primary/20 rounded-full">
                  <Target className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                Impact Dashboard
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Track your environmental impact and progress
              </p>
            </div>
            <div className="text-center md:text-right">
              <div className="flex items-center gap-2 md:flex-col md:gap-0">
                <Sparkles className="w-5 h-5 text-primary md:hidden" />
                <div className="text-2xl md:text-3xl font-bold text-primary">{impactScore}</div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Impact Score</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Grid */}
      <ImpactMetricsGrid
        totalSavings={totalSavings}
        streak={streak}
        averageDaily={averageDaily}
        goalProgress={goalProgress}
        tab={tab}
      />

      {/* Weekly Goal Progress */}
      <WeeklyGoalCard
        weeklyProgress={weeklyProgress}
        weeklyGoal={weeklyGoal}
        goalProgress={goalProgress}
      />

      {/* Chart Section */}
      <ImpactVisualizationCard
        tab={tab}
        setTab={setTab}
        chartData={chartData}
        chartType={chartType}
        xKey={xKey}
        yKey={yKey}
        handleGenerateInsights={handleGenerateInsights}
        loadingInsight={loadingInsight}
      />

      {/* Category Breakdown */}
      <CategoryBreakdownCard breakdown={breakdown} />

      {/* AI Insights */}
      <SmartInsightsCard insights={getInsights()} />
    </div>
  );
}
