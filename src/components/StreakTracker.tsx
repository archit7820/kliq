
import React from "react";
import { Flame } from "lucide-react";

const StreakTracker = ({ days = 0 }: { days: number }) => (
  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50">
    <Flame className="text-orange-500 w-5 h-5" />
    <span className="text-orange-700 font-semibold">{days} day streak</span>
  </div>
);

export default StreakTracker;
