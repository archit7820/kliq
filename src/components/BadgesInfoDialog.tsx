
import React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Info } from "lucide-react";

export const BADGE_INFO = [
  {
    name: "OG",
    description: "First 10,000 registered users!",
  },
  {
    name: "Eco Hero",
    description: "Earn 500+ kelp points",
  },
  {
    name: "CO₂e Saver",
    description: "Offset over 50kg CO₂e",
  },
  {
    name: "Streak Master",
    description: "7 day activity streak",
  },
  {
    name: "Challenge Champ",
    description: "Complete 3 team challenges",
  },
];

const BadgesInfoDialog: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          aria-label="Badge Info"
          className="flex items-center gap-1 p-1 rounded-full hover:bg-primary/10 transition shadow-md active:scale-95"
        >
          <Info className="w-5 h-5 text-primary hover:scale-125 transition-transform" />
          <span className="sr-only">Info</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-2xl animate-fade-in">
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center text-primary">
            <Info className="w-5 h-5" /> Badge Milestones &amp; Terms
          </DialogTitle>
        </DialogHeader>
        <div className="mt-3 space-y-3">
          <ul className="space-y-2">
            {BADGE_INFO.map((b) => (
              <li key={b.name} className="flex items-start gap-2">
                <span className={`font-semibold ${b.name === "OG" ? "text-orange-500" : "text-green-700"}`}>{b.name}:</span>
                <span className="text-sm">{b.description}</span>
              </li>
            ))}
          </ul>
          <div className="pt-2 text-xs text-muted-foreground text-center">
            Badges are updated automatically. More badges coming soon.<br />
            <span className="italic text-orange-600">OG</span> badge is exclusive to our very first 10,000 community members!
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BadgesInfoDialog;
