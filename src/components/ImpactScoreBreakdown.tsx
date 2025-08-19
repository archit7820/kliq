
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Trophy, Star, Zap, Target, Users, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

type Dimensions = {
  adventure_intensity: number;
  social_connection: number;
  environmental_impact: number;
  economic_impact: number;
  learning_growth: number;
};

const friendly: Record<keyof Dimensions, { name: string; icon: React.ComponentType<any>; color: string }> = {
  adventure_intensity: { name: "Adventure", icon: Zap, color: "text-orange-600" },
  social_connection: { name: "Social", icon: Users, color: "text-blue-600" },
  environmental_impact: { name: "Environmental", icon: Leaf, color: "text-green-600" },
  economic_impact: { name: "Economic", icon: Target, color: "text-purple-600" },
  learning_growth: { name: "Growth", icon: Star, color: "text-yellow-600" },
};

const encouragementMessages = [
  "Amazing adventure! You're making a real difference! 🌟",
  "Incredible impact! You're inspiring positive change! 💚",
  "Outstanding effort! Your actions matter! 🚀",
  "Fantastic work! You're building a better world! ✨",
  "Brilliant adventure! Keep up the amazing impact! 🎉",
  "Superb choices! You're a true change-maker! 🌱",
  "Excellent journey! Your impact is truly inspiring! 💫",
  "Remarkable adventure! You're leading by example! 🏆"
];

const getScoreLevel = (score: number) => {
  if (score >= 90) return { level: "Legendary", emoji: "🏆", color: "text-yellow-500" };
  if (score >= 80) return { level: "Epic", emoji: "⭐", color: "text-purple-500" };
  if (score >= 70) return { level: "Awesome", emoji: "🌟", color: "text-blue-500" };
  if (score >= 60) return { level: "Great", emoji: "💚", color: "text-green-500" };
  if (score >= 50) return { level: "Good", emoji: "👍", color: "text-orange-500" };
  return { level: "Getting Started", emoji: "🌱", color: "text-gray-500" };
};

interface ImpactScoreBreakdownProps {
  dimensions: Dimensions;
  impactScore?: number;
  compact?: boolean;
}

export default function ImpactScoreBreakdown({
  dimensions,
  impactScore,
  compact = false
}: ImpactScoreBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!dimensions) return null;

  const score = Math.round(impactScore ?? 0);
  const scoreLevel = getScoreLevel(score);
  const randomEncouragement = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
  
  // Calculate average for overall progress
  const avgScore = Object.values(dimensions).reduce((sum, val) => sum + (Number(val) || 0), 0) / Object.keys(dimensions).length;

  // Compact mobile version for SwipeCard
  if (compact) {
    return (
      <div className="space-y-2">
        {/* Compact Impact Score Bar */}
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-2 h-auto hover:bg-muted/50 rounded-xl"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/20 rounded-full">
                <Trophy className="w-3 h-3 text-primary" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-sm">Impact Score</span>
                  <span className={cn("text-xs font-medium", scoreLevel.color)}>
                    {scoreLevel.emoji}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-lg font-bold text-primary">{score}</div>
              </div>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </div>
          </div>
        </Button>
        
        {/* Compact progress bar */}
        <Progress value={Math.max(0, Math.min(100, avgScore))} className="h-1.5" />

        {/* AI Encouragement Message - Compact */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-2">
          <div className="flex items-start gap-2">
            <div className="p-1 bg-green-100 rounded-full flex-shrink-0">
              <Zap className="w-3 h-3 text-green-600" />
            </div>
            <div>
              <div className="text-xs font-medium text-green-800">AI Analysis</div>
              <div className="text-xs text-green-700 line-clamp-2">{randomEncouragement}</div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown - Expandable */}
        {isExpanded && (
          <Card className="border mt-2">
            <CardContent className="p-3 space-y-2">
              <div className="grid gap-2">
                {Object.entries(dimensions).map(([key, val]) => {
                  const dimension = friendly[key as keyof Dimensions];
                  const score = Math.round(Number(val) || 0);
                  const IconComponent = dimension.icon;
                  
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className={cn("w-3 h-3", dimension.color)} />
                          <span className="text-xs font-medium">{dimension.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold">{score}/100</span>
                          {score >= 80 && <span className="text-xs">🔥</span>}
                        </div>
                      </div>
                      <Progress value={Math.max(0, Math.min(100, score))} className="h-1" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Full version for other use cases
  return (
    <div className="space-y-3">
      {/* Main Impact Score Bar - Always Visible */}
      <Card className="border bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="p-4">
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full p-0 h-auto hover:bg-transparent"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-full">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-base">Impact Score</span>
                    <span className={cn("text-sm font-medium", scoreLevel.color)}>
                      {scoreLevel.emoji} {scoreLevel.level}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">Tap to view breakdown</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{score}</div>
                  <div className="text-xs text-muted-foreground">/ 100</div>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </Button>
          
          {/* Progress bar */}
          <div className="mt-3">
            <Progress value={Math.max(0, Math.min(100, avgScore))} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* AI Encouragement Message */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-100 rounded-full flex-shrink-0">
            <Zap className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-green-800 mb-1">AI Impact Analysis</div>
            <div className="text-sm text-green-700">{randomEncouragement}</div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown - Expandable */}
      {isExpanded && (
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              Detailed Impact Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {Object.entries(dimensions).map(([key, val]) => {
                const dimension = friendly[key as keyof Dimensions];
                const score = Math.round(Number(val) || 0);
                const IconComponent = dimension.icon;
                
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className={cn("w-4 h-4", dimension.color)} />
                        <span className="text-sm font-medium">{dimension.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{score}/100</span>
                        {score >= 80 && <span className="text-xs">🔥</span>}
                        {score >= 90 && <span className="text-xs">⭐</span>}
                      </div>
                    </div>
                    <Progress value={Math.max(0, Math.min(100, score))} className="h-2" />
                  </div>
                );
              })}
            </div>
            
            {/* Gamification Footer */}
            <div className="mt-4 pt-4 border-t bg-muted/30 rounded-lg p-3">
              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Impact Score Formula
                </div>
                <div className="text-xs text-muted-foreground">
                  Adventures are measured across effort, social, planet, economic, and growth dimensions — converted into social currency.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
