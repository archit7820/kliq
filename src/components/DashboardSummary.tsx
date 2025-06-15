
import React from "react";
import StreakTracker from "./StreakTracker";
import ImpactSnapshot from "./ImpactSnapshot";
import CurrentChallengeCard from "./CurrentChallengeCard";
import OffsetPrompt from "./OffsetPrompt";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Modern color palette (no olive green)
const DashboardSummary = () => {
  const navigate = useNavigate();

  // Dummy data, replace with real fetched values later
  const weeklySavings = 8.2; // CO2e kg
  const streak = 4; // days
  const impact = {
    food: 2.7,
    travel: 3.0,
    shopping: 2.5
  };

  return (
    <section className="w-full flex flex-col gap-3">
      {/* Weekly Savings & Streak */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-4 rounded-2xl bg-gradient-to-r from-cyan-100 to-indigo-100 shadow border">
        <div>
          <p className="text-xs text-gray-500 mb-1">CO₂e Saved This Week</p>
          <p className="text-2xl font-semibold text-cyan-800">{weeklySavings} kg</p>
        </div>
        <StreakTracker days={streak} />
      </div>

      {/* Impact Snapshot */}
      <ImpactSnapshot impact={impact} />

      {/* Log New Action */}
      <Button
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 text-base tracking-tight rounded-xl shadow"
        onClick={() => navigate("/log-activity")}
      >
        Log New Action
      </Button>

      {/* Challenge card */}
      <CurrentChallengeCard />

      {/* Offset Prompt */}
      <OffsetPrompt />
    </section>
  );
};
export default DashboardSummary;
