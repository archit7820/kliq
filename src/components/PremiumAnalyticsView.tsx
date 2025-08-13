import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Flame, Award, Lightbulb } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PremiumAnalyticsViewProps {
  streakDays: number;
  weeklyProgress: number;
  weeklyGoal: number;
  totalImpact: {
    co2Saved: number;
    waterSaved: number;
    energySaved: number;
  };
  badgeCount: number;
  trendData: Array<{ day: string; score: number }>;
  aiTip: string;
}

const PremiumAnalyticsView: React.FC<PremiumAnalyticsViewProps> = ({
  streakDays,
  weeklyProgress,
  weeklyGoal,
  totalImpact,
  badgeCount,
  trendData,
  aiTip
}) => {
  const progressPercentage = (weeklyProgress / weeklyGoal) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold">Premium Analytics</h3>
        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black">
          Premium
        </Badge>
      </div>

      {/* Impact Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-lg">🌱</span>
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">CO₂ Saved</p>
                <p className="text-xl font-bold text-green-800">{totalImpact.co2Saved.toFixed(1)} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-lg">💧</span>
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Water Saved</p>
                <p className="text-xl font-bold text-blue-800">{totalImpact.waterSaved.toFixed(0)} L</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-lg">⚡</span>
              </div>
              <div>
                <p className="text-sm text-orange-600 font-medium">Energy Saved</p>
                <p className="text-xl font-bold text-orange-800">{totalImpact.energySaved.toFixed(1)} kWh</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Streak & Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Flame className="w-4 h-4 text-orange-500" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-orange-600">{streakDays}</div>
              <div className="text-sm text-muted-foreground">days</div>
            </div>
            <div className="mt-2 text-xs text-orange-600">
              Keep it up! 🔥
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{weeklyProgress.toFixed(1)} kg</span>
                <span className="text-muted-foreground">{weeklyGoal} kg goal</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="text-xs text-green-600">
                {progressPercentage >= 100 ? "Goal achieved! 🎉" : `${(100 - progressPercentage).toFixed(0)}% to go`}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Award className="w-4 h-4 text-yellow-500" />
            Milestones & Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-yellow-600">{badgeCount}</div>
              <div className="text-sm text-muted-foreground">badges earned</div>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(badgeCount, 5) }, (_, i) => (
                <div key={i} className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-xs">🏆</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-primary" />
            Ripple Score Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis 
                  dataKey="day" 
                  className="text-xs fill-muted-foreground" 
                />
                <YAxis className="text-xs fill-muted-foreground" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* AI Tip */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Lightbulb className="w-4 h-4 text-purple-500" />
            Daily Green Thought by AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-purple-700 leading-relaxed">
            {aiTip}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumAnalyticsView;