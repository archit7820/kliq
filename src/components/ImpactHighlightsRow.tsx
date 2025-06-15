
import React from "react";
import { Flame, Trophy, BadgeDollarSign } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Milestone = {
  label: string;
  description: string;
  achieved: boolean;
};
type ImpactHighlightsRowProps = {
  breakdown: Record<string, number>;
  streak: { current: number; best: number };
  milestones: Milestone[];
};

const ImpactHighlightsRow: React.FC<ImpactHighlightsRowProps> = ({ breakdown, streak, milestones }) => {
  const showBreakdown = Object.keys(breakdown || {}).length > 0;
  return (
    <div className="flex flex-col md:flex-row md:justify-between items-center gap-3 mb-4">
      {/* Category breakdown */}
      <div className="flex flex-col gap-1 bg-green-50 px-3 py-2 rounded-lg border border-green-100 text-xs shadow-inner">
        <span className="font-bold text-green-700 mb-1">Category Breakdown</span>
        <div className="flex flex-row gap-4 items-center">
          {showBreakdown ? (
            Object.entries(breakdown)
              .sort(([,aVal],[,bVal]) => Number(bVal) - Number(aVal))
              .map(([k, v]) => {
                let color = "text-green-700";
                if (/travel/i.test(k)) color = "text-blue-500";
                else if (/food/i.test(k)) color = "text-orange-500";
                else if (/shop/i.test(k)) color = "text-fuchsia-700";
                else if (/home/i.test(k)) color = "text-green-700";
                else if (/util/i.test(k)) color = "text-yellow-700";
                return <span key={k} className={color}>{k}: <b>{Number(v).toFixed(1)}</b>kg</span>;
              })
          ) : <span className="text-gray-400">No data yet</span>
          }
        </div>
      </div>
      {/* Streak highlight */}
      <div className="flex flex-row gap-2 items-center bg-orange-50 px-3 py-2 rounded-lg border border-orange-100 text-xs shadow-inner">
        <Flame className="w-5 h-5 text-orange-500" />
        <span className="text-orange-700 font-semibold">{streak.current} day streak</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help text-gray-400 ml-1">ℹ️</span>
          </TooltipTrigger>
          <TooltipContent side="top">Days in a row you've logged actions</TooltipContent>
        </Tooltip>
      </div>
      {/* Milestones */}
      <div className="flex flex-row gap-2 items-center bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-100 text-xs shadow-inner">
        <Trophy className="w-5 h-5 text-yellow-500"/>
        <span>Milestones:</span>
        <div className="flex gap-1">
          {milestones.map(m => (
            <Tooltip key={m.label}>
              <TooltipTrigger asChild>
                <span className={m.achieved ? "" : "opacity-40"}>
                  {m.label === "First Action" && <BadgeDollarSign className="w-5 h-5 text-green-500" />}
                  {m.label === "One Week Streak" && <Flame className="w-5 h-5 text-orange-500" />}
                  {m.label === "100kg CO₂e Saved" && <Trophy className="w-5 h-5 text-yellow-500" />}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <div>
                  <b>{m.label}</b>
                </div>
                <div>{m.description}</div>
                {!m.achieved && <div className="text-orange-500 mt-1">Not achieved yet</div>}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImpactHighlightsRow;
