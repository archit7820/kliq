
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
    <section className="w-full bg-gradient-to-r from-green-50 via-green-100 to-yellow-50 rounded-2xl shadow-lg px-3 py-4 mb-2 flex flex-row gap-3 items-center animate-fade-in">
      {/* Big XP/Level badge */}
      <div className="flex flex-col items-center justify-center pr-2">
        <div className="relative flex items-center justify-center">
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-yellow-500 text-xl animate-bounce">🏅</span>
          <div className="bg-gradient-to-br from-yellow-200 to-yellow-50 border-2 border-yellow-400 rounded-full flex flex-col items-center justify-center w-14 h-14 text-yellow-900 shadow-lg font-extrabold text-2xl animate-scale-in">
            {xp.level}
            <span className="text-xs font-semibold text-yellow-700 tracking-tight -mt-1">Lvl</span>
          </div>
        </div>
        <span className="mt-1 text-xs font-semibold text-yellow-700 bg-yellow-50 rounded-full px-2 py-0.5">{bestBadge}</span>
      </div>
      {/* Stats tiles */}
      <div className="flex flex-1 flex-row flex-wrap gap-2">
        <div className="bg-green-100 rounded-xl p-3 flex flex-col items-center min-w-[62px] shadow hover:scale-105 transition group animate-fade-in">
          <Trophy className="h-5 w-5 text-yellow-500 group-hover:scale-110" />
          <span className="font-bold text-green-900 text-base">{kelpPoints}</span>
          <span className="text-xs text-green-700 font-medium">Points</span>
        </div>
        <div className="bg-orange-100 rounded-xl p-3 flex flex-col items-center min-w-[62px] shadow hover:scale-110 transition group animate-fade-in">
          <Flame className="h-5 w-5 text-orange-500 animate-pulse" />
          <span className="font-bold text-orange-900 text-base">{streakCount}</span>
          <span className="text-xs text-orange-700 font-medium">Streak</span>
        </div>
        <div className="bg-cyan-100 rounded-xl p-3 flex flex-col items-center min-w-[62px] shadow hover:scale-110 transition group animate-fade-in">
          <Leaf className="h-5 w-5 text-green-700" />
          <span className="font-bold text-cyan-900 text-base">{weeklyImpact}</span>
          <span className="text-xs text-cyan-700 font-medium">CO₂e kg</span>
        </div>
        <div className="bg-blue-100 rounded-xl p-3 flex flex-col items-center min-w-[62px] shadow hover:scale-110 transition group animate-fade-in">
          <Award className="h-5 w-5 text-blue-600 animate-bounce" />
          <span className="font-bold text-blue-900 text-base">{globalRank}</span>
          <span className="text-xs text-blue-700 font-medium">Rank</span>
        </div>
      </div>
      {/* XP Bar */}
      <div className="absolute left-0 right-0 bottom-[-18px] flex flex-col items-center w-full">
        <div className="w-4/5 bg-gray-200 h-2.5 rounded-full relative overflow-hidden shadow animate-scale-in">
          <div
            className="bg-gradient-to-r from-yellow-300 to-green-400 h-full rounded-full transition-all"
            style={{ width: `${xp.curr}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 mt-1 font-medium">
          {xp.nextLevel} points to next level!
        </span>
      </div>
    </section>
  );
};

export default GamifiedUserSummary;
