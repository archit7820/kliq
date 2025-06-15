
import React from "react";
import { Activity, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChallengeStatusCardProps {
  title: string;
  description: string;
  reward: number;
  joined: boolean;
  completed: boolean;
  onJoin?: () => void;
  onComplete?: () => void;
  joining?: boolean;
}
const ChallengeStatusCard: React.FC<ChallengeStatusCardProps> = ({
  title,
  description,
  reward,
  joined,
  completed,
  onJoin,
  onComplete,
  joining
}) => (
  <div className="bg-[#f6f3ff] border border-[#e8e3fa] rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between shadow group transition-all mb-3 min-h-[72px]">
    <div>
      <div className="font-semibold text-violet-900 text-lg mb-1">{title}</div>
      <div className="text-xs text-violet-700 mb-2">{description}</div>
      <span className="inline-flex items-center gap-1 bg-[#d0fae4] text-green-700 font-mono text-[11px] px-2 py-0.5 rounded-full">
        <Activity className="w-3 h-3" /> Reward: +{reward} Kelp Points
      </span>
    </div>
    <div className="flex flex-row gap-2 items-center mt-2 md:mt-0 min-w-[150px] justify-end">
      {!joined && onJoin && (
        <Button
          size="sm"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 font-semibold rounded-xl"
          onClick={onJoin}
          disabled={joining}
        >
          {joining ? "Joining..." : "Accept Challenge"}
        </Button>
      )}
      {joined && !completed && onComplete && (
        <Button
          size="sm"
          className="bg-green-500 hover:bg-green-600 text-white px-4 font-semibold rounded-xl"
          onClick={onComplete}
        >
          Mark as Completed
        </Button>
      )}
      {completed && (
        <span className="inline-flex items-center text-green-700 text-sm font-semibold ml-2">
          <Check className="w-5 h-5 mr-1" /> Completed!
        </span>
      )}
    </div>
  </div>
);
export default ChallengeStatusCard;
