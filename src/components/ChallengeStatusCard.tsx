
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
  <div className="bg-[#f6f3ff] border border-[#e8e3fa] rounded-xl p-3 flex flex-col gap-2 shadow-sm group transition-all mb-2 touch-manipulation">
    <div className="flex flex-col gap-2">
      <div className="font-semibold text-violet-900 text-sm leading-tight">{title}</div>
      <div className="text-xs text-violet-700 leading-relaxed line-clamp-2">{description}</div>
      <span className="inline-flex items-center gap-1 bg-[#d0fae4] text-green-700 font-mono text-xs px-2 py-1 rounded-full w-fit">
        <Activity className="w-3 h-3" /> +{reward} Kelp Points
      </span>
    </div>
    
    <div className="flex flex-row gap-2 items-center justify-end mt-1">
      {!joined && onJoin && (
        <Button
          size="sm"
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 font-semibold rounded-lg text-xs h-7 touch-manipulation"
          onClick={onJoin}
          disabled={joining}
        >
          {joining ? "Joining..." : "Accept"}
        </Button>
      )}
      {joined && !completed && onComplete && (
        <Button
          size="sm"
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 font-semibold rounded-lg text-xs h-7 touch-manipulation"
          onClick={onComplete}
        >
          Mark Complete
        </Button>
      )}
      {completed && (
        <span className="inline-flex items-center text-green-700 text-xs font-semibold">
          <Check className="w-4 h-4 mr-1" /> Completed!
        </span>
      )}
    </div>
  </div>
);

export default ChallengeStatusCard;
