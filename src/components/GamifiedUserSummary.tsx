
import React from "react";
import { Trophy, Award, Flame, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
// You can adjust these as needed:
const COLOR_PALETTE = [
  "from-green-200 via-green-100 to-green-50",
  "from-yellow-200 via-yellow-100 to-yellow-50",
  "from-cyan-200 via-cyan-100 to-cyan-50"
];

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
    <section className="relative w-full animate-fade-in p-2 sm:p-3 rounded-3xl min-h-[142px] flex flex-col items-center justify-between bg-gradient-to-tr from-green-100 via-yellow-50 to-cyan-50 shadow-md">
      <div className="w-full flex justify-between items-center gap-2">
        {/* Big level/avatar medallion */}
        <div className="flex flex-col items-center justify-center min-w-[80px]">
          <div className="relative flex items-center justify-center">
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-yellow-500 text-xl animate-bounce">🏅</span>
            <div className="bg-gradient-to-br from-yellow-200 to-yellow-50 border-2 border-yellow-400 rounded-full w-14 h-14 flex flex-col items-center justify-center text-yellow-900 shadow-lg font-extrabold text-2xl animate-scale-in">
              {xp.level}
              <span className="text-xs font-semibold text-yellow-700 tracking-tight -mt-1">Lvl</span>
            </div>
          </div>
          <span className="mt-1 text-xs font-semibold text-yellow-700 bg-yellow-50 rounded-full px-2 py-0.5 shadow">{bestBadge}</span>
        </div>
        {/* Stats cards row */}
        <div className="flex-1 flex flex-wrap gap-2 justify-end">
          <div className="rounded-xl bg-white/80 px-4 py-2 flex flex-col items-center min-w-[66px] shadow-sm">
            <span className="text-yellow-500 text-xl">🏆</span>
            <span className="font-bold text-green-900 text-base">{kelpPoints}</span>
            <span className="text-xs text-green-700 font-medium">Points</span>
          </div>
          <div className="rounded-xl bg-white/80 px-4 py-2 flex flex-col items-center min-w-[66px] shadow-sm">
            <span className="text-orange-400 text-xl">🔥</span>
            <span className="font-bold text-orange-900 text-base">{streakCount}</span>
            <span className="text-xs text-orange-700 font-medium">Streak</span>
          </div>
          <div className="rounded-xl bg-white/80 px-4 py-2 flex flex-col items-center min-w-[66px] shadow-sm">
            <span className="text-cyan-600 text-xl">🍃</span>
            <span className="font-bold text-cyan-900 text-base">{weeklyImpact}</span>
            <span className="text-xs text-cyan-700 font-medium">CO₂e kg</span>
          </div>
          <div className="rounded-xl bg-blue-50 px-4 py-2 flex flex-col items-center min-w-[66px] shadow-sm">
            <span className="text-blue-500 text-xl">🎖️</span>
            <span className="font-bold text-blue-900 text-base">{globalRank}</span>
            <span className="text-xs text-blue-700 font-medium">Rank</span>
          </div>
        </div>
      </div>
      {/* Playful XP bar at bottom */}
      <div className="absolute left-0 right-0 bottom-[-18px] flex flex-col items-center w-full pointer-events-none">
        <div className="w-4/5 bg-gray-200 h-2.5 rounded-full relative overflow-hidden shadow animate-scale-in">
          <div
            className="bg-gradient-to-r from-yellow-300 to-green-400 h-full rounded-full transition-all"
            style={{ width: `${xp.curr}%` }}
          />
        </div>
        <span className="text-[11px] text-gray-500 mt-1 font-medium">
          {xp.nextLevel} points to next level!
        </span>
      </div>
    </section>
  );
};

export default GamifiedUserSummary;

