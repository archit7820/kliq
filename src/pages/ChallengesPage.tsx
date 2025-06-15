
import React from "react";
import CurrentChallenges from "@/components/CurrentChallenges";
import { Link } from "react-router-dom";

export default function ChallengesPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-3">
      <div className="max-w-screen-md mx-auto w-full">
        <div className="flex items-center gap-3 mb-2">
          <Link to="/leaderboard" className="text-blue-700 hover:underline">&larr; Back to Stats</Link>
          <h1 className="text-2xl font-bold flex-1 text-center">Current Challenges</h1>
        </div>
        <CurrentChallenges />
      </div>
    </div>
  );
}
