import React from "react";
import { Trophy, Medal, Flame } from "lucide-react";


interface GamifiedUserSummaryProps {
  kelpPoints?: number;
  streakCount?: number;
  weeklyImpact?: number;
  level?: number;
  globalRank?: string | number;
  bestBadge?: string;
}

// Very simple XP/level algorithm for demo
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
  weeklyImpact = 0,
  globalRank = "—",
  bestBadge = "Kelp Sprout"
}) => {
  const xp = pointsToLevel(kelpPoints);

  return (
    <section className="w-full p-3 rounded-2xl border bg-card shadow-sm animate-fade-in">
      <div className="w-full flex items-center justify-between gap-3">
        {/* Level medallion */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border grid place-items-center text-sm font-semibold">
            L{xp.level}
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{bestBadge}</span>
        </div>

        {/* Stats row */}
        <div className="flex-1 flex justify-end gap-2">
          <div className="rounded-xl border bg-background px-2 py-1.5 flex flex-col items-center min-w-[64px]">
            <Trophy size={18} className="text-muted-foreground" />
            <span className="font-semibold text-sm">{kelpPoints}</span>
            <span className="text-[11px] text-muted-foreground">Points</span>
          </div>
          <div className="rounded-xl border bg-background px-2 py-1.5 flex flex-col items-center min-w-[64px]">
            <Flame size={18} className="text-muted-foreground" />
            <span className="font-semibold text-sm">{streakCount}</span>
            <span className="text-[11px] text-muted-foreground">Streak</span>
          </div>
          <div className="rounded-xl border bg-background px-2 py-1.5 flex flex-col items-center min-w-[64px]">
            <span className="font-semibold text-sm">{weeklyImpact}</span>
            <span className="text-[11px] text-muted-foreground">Weekly Impact</span>
          </div>
          <div className="rounded-xl border bg-background px-2 py-1.5 flex flex-col items-center min-w-[64px]">
            <Medal size={18} className="text-muted-foreground" />
            <span className="font-semibold text-sm">{globalRank}</span>
            <span className="text-[11px] text-muted-foreground">Rank</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-3">
        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
          <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${xp.curr}%` }} />
        </div>
        <span className="text-[11px] text-muted-foreground mt-1 block">{xp.nextLevel} points to next level</span>
      </div>
    </section>
  );
};

export default GamifiedUserSummary;
