
import React from "react";

const CurrentChallengeCard = () => (
  <div className="flex flex-row items-center justify-between bg-purple-50 rounded-xl px-4 py-3 border shadow-sm mt-1">
    <div>
      <p className="text-sm font-bold text-purple-800 mb-1">🌎 Current Challenge</p>
      <p className="text-xs text-purple-700">"Bike or walk instead of drive 3 times this week!"</p>
    </div>
    {/* Compact "leaderboard" (dummy) */}
    <div className="flex flex-col items-end gap-1">
      <span className="font-mono text-xs text-gray-600 mb-1">Top Users</span>
      <div className="flex -space-x-2">
        <img src="https://randomuser.me/api/portraits/men/1.jpg" className="rounded-full w-6 h-6 border-2 border-purple-300" />
        <img src="https://randomuser.me/api/portraits/women/2.jpg" className="rounded-full w-6 h-6 border-2 border-purple-300" />
        <img src="https://randomuser.me/api/portraits/men/3.jpg" className="rounded-full w-6 h-6 border-2 border-purple-300" />
      </div>
    </div>
  </div>
);

export default CurrentChallengeCard;
