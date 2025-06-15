
import React from "react";
import StreakTracker from "./StreakTracker";
import ImpactSnapshot from "./ImpactSnapshot";
import CurrentChallengeCard from "./CurrentChallengeCard";
import OffsetPrompt from "./OffsetPrompt";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
    <section className="w-full flex flex-col gap-2 sm:gap-3 px-2 py-4 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow">
      {/* Weekly Savings & Streak */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-3 rounded-2xl bg-gradient-to-r from-blue-100 via-blue-50 to-white shadow border">
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1">CO₂e Saved This Week</p>
          <p className="text-2xl font-semibold text-blue-900">{weeklySavings} kg</p>
        </div>
        <div className="flex-1 flex flex-col items-end sm:items-center">
          <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-xl shadow text-orange-800 font-bold text-base">
            <span className="text-orange-500 text-xl">🔥</span>
            <span>{streak} day streak</span>
          </div>
        </div>
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

      {/* NEW: Current team-wide challenge */}
      <CurrentChallengeCard />

      {/* Offset Prompt */}
      <OffsetPrompt />
    </section>
  );
};
export default DashboardSummary;
