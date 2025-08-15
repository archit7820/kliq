
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Zap, Award, BarChart3 } from "lucide-react";

interface ImpactMetricsGridProps {
  totalSavings: number;
  streak: { current: number; best: number } | null;
  averageDaily: number;
  goalProgress: number;
  tab: string;
}

const ImpactMetricsGrid: React.FC<ImpactMetricsGridProps> = ({
  totalSavings,
  streak,
  averageDaily,
  goalProgress,
  tab
}) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200/50">
        <CardContent className="p-2">
          <div className="flex items-center gap-1 mb-1">
            <div className="p-1 bg-green-200/50 rounded-full">
              <Leaf className="w-3 h-3 text-green-700" />
            </div>
            <span className="text-xs font-medium text-green-700">Total Saved</span>
          </div>
          <div className="text-base font-bold text-green-800">
            {totalSavings.toFixed(1)} kg
          </div>
          <div className="text-xs text-green-600">CO₂e this {tab}</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200/50">
        <CardContent className="p-2">
          <div className="flex items-center gap-1 mb-1">
            <div className="p-1 bg-orange-200/50 rounded-full">
              <Zap className="w-3 h-3 text-orange-700" />
            </div>
            <span className="text-xs font-medium text-orange-700">Streak</span>
          </div>
          <div className="text-base font-bold text-orange-800">
            {streak?.current || 0}
          </div>
          <div className="text-xs text-orange-600">days active</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200/50">
        <CardContent className="p-2">
          <div className="flex items-center gap-1 mb-1">
            <div className="p-1 bg-blue-200/50 rounded-full">
              <BarChart3 className="w-3 h-3 text-blue-700" />
            </div>
            <span className="text-xs font-medium text-blue-700">Daily Avg</span>
          </div>
          <div className="text-base font-bold text-blue-800">
            {averageDaily.toFixed(1)} kg
          </div>
          <div className="text-xs text-blue-600">per day</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200/50">
        <CardContent className="p-2">
          <div className="flex items-center gap-1 mb-1">
            <div className="p-1 bg-purple-200/50 rounded-full">
              <Award className="w-3 h-3 text-purple-700" />
            </div>
            <span className="text-xs font-medium text-purple-700">Goal</span>
          </div>
          <div className="text-base font-bold text-purple-800">
            {goalProgress.toFixed(0)}%
          </div>
          <div className="text-xs text-purple-600">completed</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImpactMetricsGrid;
