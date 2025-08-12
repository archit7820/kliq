
import React from "react";
import StreakTracker from "./StreakTracker";
import ImpactSnapshot from "./ImpactSnapshot";
import CurrentChallengeCard from "./CurrentChallengeCard";
import OffsetPrompt from "./OffsetPrompt";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Flame } from "lucide-react";

const DashboardSummary = () => {
  const navigate = useNavigate();

  // Dummy data, replace with real fetched values later
  const weeklySavings = 8.2; // CO2e kg
  const streak = 4; // days
  const impact = {
    food: 2.7,
    travel: 3.0,
    shopping: 2.5,
  };

  return (
    <section className="w-full flex flex-col gap-3 p-3 rounded-2xl border bg-card shadow-sm">
      {/* Weekly Savings & Streak */}
      <div className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl border bg-muted/40">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-1">Weekly Impact</p>
          <p className="text-2xl font-semibold">{weeklySavings}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-background">
          <Flame className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{streak} day streak</span>
        </div>
      </div>

      {/* Impact Snapshot */}
      <ImpactSnapshot impact={impact} />

      {/* Quick actions (minimal) */}
      <div className="grid grid-cols-2 gap-2">
        <button
          className="rounded-xl border bg-background py-3 px-3 text-left hover:bg-muted/50 transition-colors"
          onClick={() => navigate('/challenges')}
          aria-label="View current challenge"
        >
          <div className="text-xs text-muted-foreground mb-1">Challenge</div>
          <div className="text-sm font-medium">Current challenge</div>
        </button>
        <button
          className="rounded-xl border bg-background py-3 px-3 text-left hover:bg-muted/50 transition-colors"
          onClick={() => navigate('/impact-dashboard')}
          aria-label="Open impact dashboard"
        >
          <div className="text-xs text-muted-foreground mb-1">Impact</div>
          <div className="text-sm font-medium">Offset & insights</div>
        </button>
      </div>
    </section>
  );
};
export default DashboardSummary;
