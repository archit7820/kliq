
import React from "react";
import { Activity, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChallengeVerificationDialog from "@/components/ChallengeVerificationDialog";

interface ChallengeStatusCardProps {
  title: string;
  description: string;
  reward: number;
  joined: boolean;
  completed: boolean;
  onJoin?: () => void;
  joining?: boolean;
  actionLabel?: string;
  challengeId?: string;
  participantId?: string;
  onComplete?: () => void;
}

const ChallengeStatusCard: React.FC<ChallengeStatusCardProps> = ({
  title,
  description,
  reward,
  joined,
  completed,
  onJoin,
  joining,
  actionLabel,
  challengeId,
  participantId,
  onComplete
}) => {
  // Determine button state and action
  const getButtonConfig = () => {
    if (completed) {
      return {
        text: "Completed!",
        icon: <Check className="w-3 h-3 mr-1" />,
        className: "bg-green-600 hover:bg-green-700 text-white cursor-default",
        disabled: true,
        onClick: undefined,
        showDialog: false
      };
    }
    
    if (!joined) {
      return {
        text: actionLabel || "Accept Mission",
        className: "bg-emerald-500 hover:bg-emerald-600 text-white",
        disabled: joining,
        onClick: onJoin,
        showDialog: false
      };
    }
    
    // Joined but not completed - show verification dialog
    return {
      text: "Mark as Completed",
      className: "bg-blue-500 hover:bg-blue-600 text-white",
      disabled: false,
      onClick: undefined,
      showDialog: true
    };
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="bg-[#f6f3ff] border border-[#e8e3fa] rounded-xl p-3 flex flex-col gap-2 shadow-sm group transition-all mb-2 touch-manipulation">
      <div className="flex flex-col gap-2">
        <div className="font-semibold text-violet-900 text-sm leading-tight">{title}</div>
        <div className="text-xs text-violet-700 leading-relaxed line-clamp-2">{description}</div>
        <span className="inline-flex items-center gap-1 bg-[#d0fae4] text-green-700 font-mono text-xs px-2 py-1 rounded-full w-fit">
          <Activity className="w-3 h-3" /> +{reward} Kelp Points
        </span>
      </div>
      
      <div className="flex justify-end mt-1">
        {buttonConfig.showDialog && challengeId && participantId ? (
          <ChallengeVerificationDialog
            challenge={{
              id: challengeId,
              title: title,
              description: description,
              reward: reward
            }}
            participantId={participantId}
            onFinish={() => {
              if (onComplete) onComplete();
            }}
          />
        ) : (
          <Button
            size="sm"
            className={`${buttonConfig.className} px-2 py-1 font-medium rounded-lg text-xs h-6 touch-manipulation`}
            onClick={buttonConfig.onClick}
            disabled={buttonConfig.disabled}
          >
            {buttonConfig.icon}
            {buttonConfig.text}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChallengeStatusCard;
