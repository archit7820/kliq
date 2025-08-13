import React, { useState } from "react";
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useImpactDashboardData } from "@/hooks/useImpactDashboardData";
import { useProfileWithStats } from "@/hooks/useProfileWithStats";
import { toast } from "@/components/ui/use-toast";
import ImpactChart from "./ImpactChart";
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  BarChart3, 
  Leaf, 
  Zap,
  Award,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const tabOptions = [
  { value: "week", label: "Week", icon: Calendar },
  { value: "month", label: "Month", icon: BarChart3 },
  { value: "year", label: "Year", icon: TrendingUp }
];

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
      return "Excellent work! You've exceeded your weekly CO₂e goal. Your consistent green choices are making a real difference.";
    } else if (weeklyProgress > weeklyGoal * 0.7) {
      return "Great progress! You're on track to meet your weekly goal. Keep up the sustainable habits!";
    } else if (streak?.current && streak.current > 3) {
      return "Your activity streak is impressive! Consistency is key to maximizing environmental impact.";
    } else {
      return "Small daily actions create big environmental changes. Consider logging one eco-friendly activity today!";
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with Impact Score */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" />
                Impact Dashboard
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Track your environmental impact and progress
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{impactScore}</div>
              <div className="text-xs text-muted-foreground">Impact Score</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">Total Saved</span>
            </div>
            <div className="text-lg font-bold text-green-800">{totalSavings.toFixed(1)} kg</div>
            <div className="text-xs text-green-600">CO₂e this {tab}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-700">Streak</span>
            </div>
            <div className="text-lg font-bold text-orange-800">{streak?.current || 0}</div>
            <div className="text-xs text-orange-600">days active</div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Daily Avg</span>
            </div>
            <div className="text-lg font-bold text-blue-800">{averageDaily.toFixed(1)} kg</div>
            <div className="text-xs text-blue-600">per day</div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-700">Goal</span>
            </div>
            <div className="text-lg font-bold text-purple-800">{goalProgress.toFixed(0)}%</div>
            <div className="text-xs text-purple-600">completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Goal Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Weekly CO₂e Goal</h3>
            <Badge variant={goalProgress >= 100 ? "default" : "secondary"}>
              {weeklyProgress.toFixed(1)} / {weeklyGoal} kg
            </Badge>
          </div>
          <Progress value={Math.min(goalProgress, 100)} className="h-3 mb-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{goalProgress.toFixed(0)}% complete</span>
            <span>{goalProgress >= 100 ? "Goal achieved! 🎉" : `${(weeklyGoal - weeklyProgress).toFixed(1)} kg to go`}</span>
          </div>
        </CardContent>
      </Card>

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-lg">Impact Visualization</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateInsights}
              disabled={loadingInsight}
            >
              {loadingInsight ? "Generating..." : "Generate AI Insights"}
            </Button>
          </div>
          <div className="flex gap-2">
            {tabOptions.map(opt => (
              <Button
                key={opt.value}
                variant={tab === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setTab(opt.value)}
                className="flex items-center gap-2"
              >
                <opt.icon className="w-4 h-4" />
                {opt.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ width: "100%", height: 250 }}>
            <ImpactChart data={chartData} chartType={chartType} xKey={xKey} yKey={yKey}/>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {breakdown && Object.keys(breakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(breakdown).map(([category, value]: [string, any]) => (
                <div key={category} className="p-3 rounded-lg border bg-muted/30">
                  <div className="text-sm font-medium capitalize mb-1">{category}</div>
                  <div className="text-lg font-bold text-primary">{typeof value === 'number' ? value.toFixed(1) : value} kg</div>
                  <div className="text-xs text-muted-foreground">CO₂e saved</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Smart Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-800">
            {getInsights()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}