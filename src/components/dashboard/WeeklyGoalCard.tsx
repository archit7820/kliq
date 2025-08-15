
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

interface WeeklyGoalCardProps {
  weeklyProgress: number;
  weeklyGoal: number;
  goalProgress: number;
}

const WeeklyGoalCard: React.FC<WeeklyGoalCardProps> = ({
  weeklyProgress,
  weeklyGoal,
  goalProgress
}) => {
  return (
    <Card className="border border-primary/10 bg-gradient-to-r from-primary/5 to-secondary/5">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-primary/20 rounded-full">
              <Target className="w-3 h-3 text-primary" />
            </div>
            <h3 className="font-semibold text-xs">Weekly CO₂e Goal</h3>
          </div>
          <Badge 
            variant={goalProgress >= 100 ? "default" : "secondary"}
            className="text-xs px-2 py-0.5"
          >
            {weeklyProgress.toFixed(1)} / {weeklyGoal} kg
          </Badge>
        </div>
        <Progress 
          value={Math.min(goalProgress, 100)} 
          className="h-2 mb-2 bg-muted/50" 
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{goalProgress.toFixed(0)}% complete</span>
          <span className="text-primary font-medium">
            {goalProgress >= 100 ? "Goal achieved! 🎉" : `${(weeklyGoal - weeklyProgress).toFixed(1)} kg to go`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyGoalCard;
