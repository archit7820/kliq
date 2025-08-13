import React from "react";
import { Trophy, Medal, Flame, Droplet, Leaf, Zap, Recycle } from "lucide-react";

interface GamifiedUserSummaryProps {
  kelpPoints?: number;
  streakCount?: number;
  weeklyImpact?: {
    co2Saved: number;
    waterSaved: number; // liters
    wasteReduced: number; // kg
    energySaved: number; // kWh
  };
  level?: number;
  globalRank?: string | number;
  bestBadge?: string;
}

// Simple XP/level algorithm for demo
function pointsToLevel(points: number) {
  if (!points) return { level: 1, nextLevel: 100, curr: 0 };
  const level = Math.floor(points / 100) + 1;
  const curr = points % 100;
  const nextLevel = 100 - curr;
  return { level, curr, nextLevel };
}

const GamifiedUserSummary: React.FC<GamifiedUserSummaryProps> = ({
  kelpPoints = 0,
  streakCount = 0,
  weeklyImpact = { co2Saved: 0, waterSaved: 0, wasteReduced: 0, energySaved: 0 },
  globalRank = "—",
  bestBadge = "Kelp Sprout"
}) => {
  const xp = pointsToLevel(kelpPoints);

  return (
    <section className="w-full p-4 bg-gradient-to-r from-primary/5 to-mint-100 rounded-2xl border animate-fade-in">
      {/* Top Section - Points & Level */}
      <div className="bg-primary/10 rounded-xl p-3 mb-4 text-center">
        <div className="text-2xl font-bold text-primary mb-1">
          {kelpPoints.toLocaleString()} Kelp Points
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm border border-primary/20">
            L{xp.level}
          </div>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
            {bestBadge}
          </span>
        </div>
      </div>

      {/* Impact Grid - Mobile First */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-card rounded-xl p-3 text-center border border-green-200">
          <Leaf className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <div className="font-semibold text-sm text-foreground">
            {weeklyImpact.co2Saved.toFixed(1)}kg
          </div>
          <div className="text-xs text-muted-foreground">CO₂ Saved</div>
        </div>

        <div className="bg-card rounded-xl p-3 text-center border border-blue-200">
          <Droplet className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <div className="font-semibold text-sm text-foreground">
            {weeklyImpact.waterSaved.toFixed(0)}L
          </div>
          <div className="text-xs text-muted-foreground">Water Saved</div>
        </div>

        <div className="bg-card rounded-xl p-3 text-center border border-purple-200">
          <Recycle className="w-5 h-5 text-purple-600 mx-auto mb-1" />
          <div className="font-semibold text-sm text-foreground">
            {weeklyImpact.wasteReduced.toFixed(1)}kg
          </div>
          <div className="text-xs text-muted-foreground">Waste Reduced</div>
        </div>

        <div className="bg-card rounded-xl p-3 text-center border border-blue-200">
          <Zap className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <div className="font-semibold text-sm text-foreground">
            {weeklyImpact.energySaved.toFixed(0)}kWh
          </div>
          <div className="text-xs text-muted-foreground">Energy Saved</div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-card rounded-xl p-2 text-center border border-red-200">
          <Flame className="w-4 h-4 text-red-600 mx-auto mb-1" />
          <div className="font-semibold text-sm">{streakCount}</div>
          <div className="text-xs text-muted-foreground">Day Streak</div>
        </div>
        
        <div className="bg-card rounded-xl p-2 text-center border border-blue-200">
          <Medal className="w-4 h-4 text-blue-600 mx-auto mb-1" />
          <div className="font-semibold text-sm">{globalRank}</div>
          <div className="text-xs text-muted-foreground">Global Rank</div>
        </div>

        <div className="bg-card rounded-xl p-2 text-center border border-primary/20">
          <Trophy className="w-4 h-4 text-primary mx-auto mb-1" />
          <div className="font-semibold text-sm">L{xp.level}</div>
          <div className="text-xs text-muted-foreground">Impact Level</div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="bg-card rounded-xl p-3 border border-border">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            Level {xp.level} Progress
          </span>
          <span className="text-xs text-muted-foreground">
            {xp.nextLevel} points to next level
          </span>
        </div>
        <div className="w-full bg-muted h-2 rounded-full overflow-hidden border border-muted">
          <div 
            className="bg-primary h-full rounded-full transition-all duration-500" 
            style={{ width: `${xp.curr}%` }} 
          />
        </div>
      </div>
    </section>
  );
};

export default GamifiedUserSummary;
